;(function() {
    'use strict';
    
    angular.module('APTPS_ngCPQ').service('LocationDataService', LocationDataService); 
    LocationDataService.$inject = ['$q', 'BaseService', 'BaseConfigService', 'RemoteService'];
    function LocationDataService($q, BaseService, BaseConfigService, RemoteService) {
        var service = this;

        var locations;
        var locationIdSet = [];
        var locIdtolocAvlsMap = {};
        var locIdtoOptionProductsMap = {};
        var availableOptionProducts = [];
        
        // location methods.
        service.selectedlpa = {};
        service.hasServicelocations = false;
        
        service.gethasServicelocations = gethasServicelocations;
        service.getlocItems = getlocItems;
        service.getselectedlpa = getselectedlpa;
        service.setselectedlpa = setselectedlpa;
        service.getselectedlpaId = getselectedlpaId;
        service.getalllocationIdSet = getalllocationIdSet;
        service.getLocationAvailabilityforBundle = getLocationAvailabilityforBundle;
        service.getLocationAvailabilityforOption = getLocationAvailabilityforOption;
        service.getAvailableOptionProducts = getAvailableOptionProducts;

        function getlocItems() {
            if (locations) {
                return $q.when(locations);
            }

            // chain the location call and location availability calls.
            var locationRequest = { productId: BaseConfigService.lineItem.bundleProdId
                                    ,opportunityId: BaseConfigService.opportunityId
                                }; 
            var requestPromise = RemoteService.getServiceLocations(locationRequest);
            BaseService.startprogress();// start progress bar.
            return requestPromise.then(function(locationresponse){
                initializeLocations(locationresponse);
                var locationAvailabiltyRequest = { servicelocationIdSet:locationIdSet
                                                   ,bundleprodId: BaseConfigService.lineItem.bundleProdId
                                                };
                requestPromise = RemoteService.getLocationAvailabilities(locationAvailabiltyRequest);
                return requestPromise.then(function(laresponse){
                    initializelocationAvailabilities(laresponse);
                    BaseService.setLocationLoadComplete();
                    return locations;
                });                                
            });                    
        }

        function initializeLocations(response) {
            locations = response.locations;
            
            if(locations.length > 0)
            {
                service.hasServicelocations = true;
                setalllocationIdSet(_.pluck(locations, 'Id'));
            }
        }

        function initializelocationAvailabilities(response){
            _.each(response.locAvailabilities, function(la){
                var las = [];
                var locId = la.Service_Location__c;
                if(_.has(locIdtolocAvlsMap, locId))
                {
                    las = locIdtolocAvlsMap[locId];
                }
                las.push(la);
                locIdtolocAvlsMap[locId] = las;
                
                // if option product exits then add them to locIdtoOptionProductsMap.
                if(_.has(la, 'Option_Product__c')){
                    var optionProd = la.Option_Product__c;
                    var pIds = [];
                    if(_.has(locIdtoOptionProductsMap, locId))
                    {
                        pIds = locIdtoOptionProductsMap[locId];
                    }
                    pIds.push(optionProd);
                    locIdtoOptionProductsMap[locId] = pIds;
                }
            });

            //set selected lpa after the location availability initialization.
            var locationId = BaseConfigService.lineItem.serviceLocationId;
            if(!_.isUndefined(locationId)
                && !_.isNull(locationId))
            {
                setselectedlpa(_.findWhere(locations, {Id:locationId}));
            }
        }

        function getLocationAvailabilityforBundle(locId, productId){
            // find the location availability record where location matches with service location and productId matches with bundle product and option product = null
            var res = [];
            if(_.has(locIdtolocAvlsMap, locId))
            {
                _.each(_.where(locIdtolocAvlsMap[locId], {Bundle_Product__c: productId}), 
                    function(la){
                    if(!_.has(la, 'Option_Product__c'))
                        res.push(la);
                });
            }
            return res;
        }

        function getLocationAvailabilityforOption(locId, productId){
            // find the location availability record where location matches with service location and option product = productId
            var res = [];
            if(_.has(locIdtolocAvlsMap, locId))
            {
                res = _.where(locIdtolocAvlsMap[locId], {Option_Product__c: productId});
            }
            return res;
        }

        function setAvailableOptionProductsforLocation(locId){
            if(_.has(locIdtoOptionProductsMap, locId))
                availableOptionProducts = locIdtoOptionProductsMap[locId];
            else
                availableOptionProducts = [];
        }

        function getAvailableOptionProducts(){
            return availableOptionProducts;
        }

        function gethasServicelocations(){
            return service.hasServicelocations;
        }
        function setselectedlpa(loc) {
            service.selectedlpa = loc;
            setAvailableOptionProductsforLocation(getselectedlpaId());
        }
        
        function getselectedlpa() {
            return service.selectedlpa;
        }

        function getselectedlpaId(){
            return _.isObject(service.selectedlpa) ? service.selectedlpa.Id : '';
        }

        function setalllocationIdSet(locIds){
            locationIdSet = locIds;
        }

        function getalllocationIdSet(){
            return locationIdSet;
        }
    }
})();