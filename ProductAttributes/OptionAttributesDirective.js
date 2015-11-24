/**
 * Directive: OptionAttributesDirective 
 */
;(function() {
    'use strict';

    function OptionAttributesController($scope, $log, $sce, SystemConstants, BaseService, LocationDataService, OptionGroupDataService, ProductAttributeConfigDataService, ProductAttributeValueDataService, PAVObjConfigService) {
        var attrCtrl = this;

        // multi-location support for E-line.
        var zLoc = '';

        function init(){
            // all variable intializations.
            $scope.locationService = LocationDataService;
            $scope.PAVService = ProductAttributeValueDataService;
            $scope.optionGroupService = OptionGroupDataService;
            
            attrCtrl.constants = SystemConstants;
            attrCtrl.AttributeGroups = [];
            attrCtrl.pavfieldDescribeMap = {};
            attrCtrl.productAttributeValues = {};
            attrCtrl.Selectedoptionproduct = {};
        }
        
        // Option Attribute load on location selection.
        $scope.$watch('locationService.getselectedlpa()', function(newVal, oldVal) {
            if(!_.isEmpty(newVal)
                && !_.isEqual(newVal, oldVal)
                && !_.isEmpty(attrCtrl.Selectedoptionproduct))
            {   
                var optionProductId = attrCtrl.Selectedoptionproduct.productId;
                var componentId = attrCtrl.Selectedoptionproduct.componentId;
                retrieveproductattributeGroupData(optionProductId, componentId);
            }    
        });

        // Option Attribute load on option selection.
        $scope.$watch('optionGroupService.getSelectedoptionproduct()', function(newVal, oldVal) {
            if(!_.isEmpty(newVal)){
                attrCtrl.Selectedoptionproduct = newVal;
                var optionProductId = newVal.productId;
                var componentId = newVal.componentId;
                retrieveproductattributeGroupData(optionProductId, componentId);
            }
            else{
                // clear the option attributes.
                clearAttributes();
            }
        });

        // Cascading of bundle attributes to options.
        $scope.$watchCollection('PAVService.getbundleproductattributevalues()', function(newValue){ 
            if(!_.isEmpty(newValue))
            {
                CascadeBunleAttributestoOptions();
                PAVObjConfigService.configurePAVFields(attrCtrl.AttributeGroups, attrCtrl.productAttributeValues);
            }
        });

        function CascadeBunleAttributestoOptions(){
            // get attribute config fields for bundle product and clone them.
            var bundlePAV = ProductAttributeValueDataService.getbundleproductattributevalues();
            var bunleAttributeFields = ProductAttributeConfigDataService.getBundleAttributeFields();
            var optionPAV = attrCtrl.productAttributeValues;
            _.each(bunleAttributeFields, function(field){
                optionPAV[field] = bundlePAV[field];
            });
        }
            

        function retrieveproductattributeGroupData(productId, componentId){
            // collect all products at this level and make a remote call for attributes.
            var alllocationIdSet = LocationDataService.getalllocationIdSet();
            var selectedlocationId = LocationDataService.getselectedlpaId();
            attrCtrl.pavfieldDescribeMap = PAVObjConfigService.fieldNametoDFRMap;
            ProductAttributeConfigDataService.getProductAttributesConfig(productId, alllocationIdSet, selectedlocationId).then(function(attributeconfigresult) {
                ProductAttributeValueDataService.getProductAttributeValues(componentId).then(function(pavresult)
                {
                    setOptionAttributes(attributeconfigresult, pavresult);
                    renderOptionAttributes();
                })
            })
        }

        function setOptionAttributes(attrgroups, pav){
            attrCtrl.AttributeGroups = attrgroups;
            attrCtrl.productAttributeValues = pav;
        }

        function renderOptionAttributes(){
            // clear the previous option attribute groups.
            CascadeBunleAttributestoOptions();
            PAVObjConfigService.configurePAVFields(attrCtrl.AttributeGroups, attrCtrl.productAttributeValues);
            optionLevelAttributeChange();
            seatTypeExpressions();
            eLinePAVAttributes(); 
            //$scope.safeApply();
        }

        attrCtrl.PAVPicklistChange = function(fieldName){
            renderOptionAttributes();
            ProductAttributeConfigDataService.setMultiSiteLocations(attrCtrl.productAttributeValues, LocationDataService.zLocations);

            // initiate the save call on attribute change.
            BaseService.setisSavecallRequested(true);
        }

        function optionLevelAttributeChange(){
            var optionAttributes = attrCtrl.productAttributeValues;
            var portOptions = PAVObjConfigService.getPortOptions();
            var result = ProductAttributeConfigDataService.optionAttributeChangeConstraint(optionAttributes, portOptions, $scope.AttributeGroups, $scope.productAttributeValues);
            if(!_.isEmpty(result)){
                attrCtrl.AttributeGroups = result[0].AttributeGroups;
                attrCtrl.productAttributeValues = result[0].productAttributeValues;
            }
        }

        function seatTypeExpressions(){
            ProductAttributeConfigDataService.seatTypeExpressions(attrCtrl.AttributeGroups, attrCtrl.productAttributeValues);
        }

        function eLinePAVAttributes(){
            var selectedSR = LocationDataService.getselectedlpa();
            var zLocations = LocationDataService.zLocations;

            if((selectedSR != null || selectedSR != 'undefined') && (_.size(zLocations) > 0)){
                attrCtrl.AttributeGroups = ProductAttributeConfigDataService.getLocationsCheck(attrCtrl.AttributeGroups, selectedSR, zLocations);                
                attrCtrl.productAttributeValues = ProductAttributeConfigDataService.setProductAttributeValues(attrCtrl.productAttributeValues, selectedSR, zLoc);
            }           
            if(_.has(attrCtrl.productAttributeValues, 'Location_Z__c') && attrCtrl.productAttributeValues['Location_Z__c'] != null){
                ProductAttributeConfigDataService.setSelectedLocationZ = attrCtrl.productAttributeValues['Location_Z__c'];
            }
        }

        function getLocationZ(pav){
            zLoc = ProductAttributeConfigDataService.getLocationZ(pav);         
        }

        attrCtrl.trustAsHtml = function(value) {
            return $sce.trustAsHtml(value);
        };

        function clearAttributes(){
            attrCtrl.AttributeGroups = [];
            attrCtrl.Selectedoptionproduct = {};       
            attrCtrl.productAttributeValues = {};
        }

        init();
    }

    OptionAttributesController.$inject = ['$scope', 
                                            '$log',
                                            '$sce',
                                            'SystemConstants',
                                            'BaseService',
                                            'LocationDataService', 
                                            'OptionGroupDataService', 
                                            'ProductAttributeConfigDataService', 
                                            'ProductAttributeValueDataService', 
                                            'PAVObjConfigService'];

    
    angular.module('APTPS_ngCPQ').directive('optionAttributes', OptionAttributes);

    OptionAttributes.$inject = ['SystemConstants'];
    function OptionAttributes(SystemConstants){
        // Runs during compile
        return {
            // name: '',
            // priority: 1,
            // terminal: true,
            scope: {}, // {} = isolate, true = child, false/undefined = no change
            controller: OptionAttributesController,
            controllerAs: 'attrCtrl',
            // require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
            restrict: 'AE', // E = Element, A = Attribute, C = Class, M = Comment
            //template: '<div>pageHeader</div>',
            templateUrl: SystemConstants.baseUrl + "/Templates/OptionAttributesView.html",
            // replace: true,
            // transclude: true,
            // compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
            link: function(cartCtrl, iElm, iAttrs, controller) {
                /*var top = 100;//$('.thisone').offset().top;
                    
                $(document).scroll(function(){
                    $('.thisone').css('position','');
                    top = $('.thisone').offset().top;
                    $('.thisone').css('position','absolute');
                    $('.thisone').css('top', Math.max(top, $(document).scrollTop()));
                });*/
            },
            bindToController: true
        };
    }
}).call(this);