;(function() {
	'use strict';
    
    angular.module('APTPS_ngCPQ').service('ProductAttributeConfigDataService', ProductAttributeConfigDataService); 
	ProductAttributeConfigDataService.$inject = ['$q', '$log', 'BaseService', 'BaseConfigService', 'RemoteService', 'OptionGroupDataService', 'PAVObjConfigService'];
	function ProductAttributeConfigDataService($q, $log, BaseService, BaseConfigService, RemoteService, OptionGroupDataService, PAVObjConfigService) {
		var service = this;
        service.isValid = false;

		var cachedProductAttributes = {};
        var prodductIdtoattributegroupsMap = {};
        var productIdtodynamicattributegroupMap = {};

		var bundleAttribueFields = [];
        var isLocationZ = false;
        var depattributes = {};
        
		// product attribute methods.
		service.getProductAttributesConfig = getProductAttributesConfig;
		service.getDynamicGroups = getDynamicGroups;
		service.getBundleAttributeFields = getBundleAttributeFields;
		service.setBundleAttributeFields = setBundleAttributeFields;

        service.setMultiSiteLocations = setMultiSiteLocations;
        service.optionAttributeChangeConstraint = optionAttributeChangeConstraint;
        service.seatTypeExpressions = seatTypeExpressions;
        service.getLocationZ = getLocationZ;
		
		function getProductAttributesConfig_bulk(servicelocationIdSet, productIds, groupIds) {
			// check if cachedProductAttributes has products requested for else make a remote call.
			var existingproductIds = _.keys(cachedProductAttributes.prodductIdtoattributegroupsMap);
			var productIds_filtered = _.filter(productIds, function(Id){ return !_.contains(existingproductIds, Id); });
			if (service.isValid
				&& productIds_filtered.length < 1) {
				// logTransaction(cachedProductAttributes);
				return $q.when(cachedProductAttributes);
			}

			// locationRequest = createOptionGroupRequestDO(productIds_filtered, BaseConfigService.getcartId(), BaseConfigService.getcontextLineNumber());
			var attributeGroupRequest = {servicelocationIds:servicelocationIdSet
                                        , bundleprodId: BaseConfigService.lineItem.bundleProdId
                                        , productIdsList: productIds_filtered
                                        , allgroupIds: groupIds
                                        };
            var requestPromise = RemoteService.getAttributeGroups(attributeGroupRequest);
			BaseService.startprogress();// start progress bar.
			return requestPromise.then(function(response){
				initializeProductAttributes(response);
				// logTransaction(response, categoryRequest);
                // add if any erors.
                // PageErrorDataService.add(response.messageWrapList);
                
				BaseService.setPAConfigLoadComplete();
				return cachedProductAttributes;
			});
		}

		function getProductAttributesConfig( productId, alllocationIdSet, selectedlocationId) {
			var productIdset = [], allgroupIds = [];
			var currentproductoptiongroups = OptionGroupDataService.getcurrentproductoptiongroups();
            var dynamicgroupId = selectedlocationId != '' ? productId+selectedlocationId : '';
			if (service.isValid
				&& cachedProductAttributes != null
				&& cachedProductAttributes.prodductIdtoattributegroupsMap != null
				&& _.has(cachedProductAttributes.prodductIdtoattributegroupsMap, productId))
			{
				var res = buildattributegroups(cachedProductAttributes.prodductIdtoattributegroupsMap, productId, cachedProductAttributes.productIdtodynamicattributegroupMap,
															dynamicgroupId);
				return $q.when(res);
			}

			productIdset = getAllProductsinCurrentOptiongroups(currentproductoptiongroups, 'productOptionComponents', 'productId');
            productIdset.push(productId);
            
            return getProductAttributesConfig_bulk(alllocationIdSet, productIdset, allgroupIds).then(function(result) {
            	var res = buildattributegroups(result.prodductIdtoattributegroupsMap, productId, result.productIdtodynamicattributegroupMap,
                                                        dynamicgroupId);
            	return res;
            });
		}

        function initializeProductAttributes(result) {
            _.each(result.productIdtoproductgroupIdsMap, function (groupIdsSet, prodId) {
                var attributeGroups = [];
                _.each(groupIdsSet, function(groupId){
                    attributeGroups.push(result.groupIdtoattributegroupMap[groupId]);
                });
                
                prodductIdtoattributegroupsMap[prodId] = attributeGroups;
            });
            
            // dynamic attribute groups.
            _.each(result.productIdtodynamicattributegroupMap, function (attributeGroup, prodpluslocationId) {
                productIdtodynamicattributegroupMap[prodpluslocationId] = attributeGroup;
            });

            cachedProductAttributes = {'prodductIdtoattributegroupsMap' : prodductIdtoattributegroupsMap, 'productIdtodynamicattributegroupMap': productIdtodynamicattributegroupMap};

            service.isValid = true;
        }

		function getDynamicGroups(groupId){
			var res = [];
			if(_.has(cachedProductAttributes.productIdtodynamicattributegroupMap, groupId))
            {
                var dynamicgroup = cachedProductAttributes.productIdtodynamicattributegroupMap[groupId];
                res.push(dynamicgroup);
            }
            return res;
		}

		// Util methid. a: product Id to attribute groups map, b: productId, c: product to dynamic group map., d: dynamic group Id.
        // add dynamic attributes prior to static.
        function buildattributegroups(a, b, c, d){
            var res = [];

            if(_.isObject(c)
            	&& _.has(c, d))
            {
                res.push(c[d]);
            }
            
            if(_.has(a, b))
            {
                _.each(a[b], function(g) {
                    res.push(g);
                })
            }

            return res;
        }

        // Util methid. a: product Id to attribute groups map, b: productId, c: product to dynamic group map., d: dynamic group Id.
        /*function buildattributegroups(prodIdtoattributegroups, prodId, prodIdtodynamicattributegroups, dynamicgroupId){
            var res = [];
            
            // collect all dynamic attributes if exists.
            var dynamicAttributes = {};
            if(_.isObject(prodIdtodynamicattributegroups)
            	&& _.has(prodIdtodynamicattributegroups, dynamicgroupId))
            {
                _.each(prodIdtodynamicattributegroups[dynamicgroupId].productAtributes, function(dynamicattribute){
                	dynamicAttributes[dynamicattribute.fieldName] = dynamicattribute;
                })
            }

            // get attributes configured at product level.
            if(_.has(prodIdtoattributegroups, prodId))
            {
                _.each(prodIdtoattributegroups[prodId], function(g) {
                    res.push(g);
                })
            }

            // replace attributes(product level) values with dynamic attributes from location availability.
            if(!_.isEmpty(dynamicAttributes))
            {
            	_.each(res, function(attrGroup){
	            	_.each(attrGroup.productAtributes, function(prodAttribute){
	            		if(_.has(dynamicAttributes, prodAttribute.fieldName))
	            		{
	            			prodAttribute.lovs = dynamicAttributes[prodAttribute.fieldName].lovs;
	            			// unhide dynamic attribute if lov's exists.
	            			prodAttribute.isHidden = _.size(prodAttribute.lovs) > 0 ? false : prodAttribute.isHidden;
	            			prodAttribute.isDynamicAttr = true;
	            		}
	            	})
	            })	
            }
            return res;
        }*/

		// util method. a: option groups, b: field name to access product components, c: field name to access product Id within product component.
        function getAllProductsinCurrentOptiongroups(a, b, c){
            // return a list of bundle product Id's. based on flag provided.
            var res = [];
            _.each(a, function (group) {
                res.push(_.pluck(group[b], c));
            });
            res = _.flatten(res);// Flattens a nested array.
            res = _.filter(res, function(prodId){return !_.isUndefined(prodId)});
            return res;
        }

        function setBundleAttributeFields(attrgroups){
        	_.each(attrgroups, function(attrgroup){
                bundleAttribueFields.push(_.pluck(attrgroup.productAtributes, 'fieldName'));
            })
            bundleAttribueFields = _.flatten(bundleAttribueFields);
        }

        function getBundleAttributeFields(){
        	return bundleAttribueFields;
        }

        function optionAttributeChangeConstraint(optionAttributes, portOptions, AttributeGroups, productAttributeValues){
            var filteredPortOption = ''
            var Bandwidth = [];
            var CircuitSpeed = [];
            var BillingType = [];
            var BandwidthSplitted = [];
            var CircuitSpeedSplitted = [];
            var BillingTypeSplitted = [];
            var bandwidthIs = false;
            var circuitSpeedIs = false;
            var billingTypeIs = false;
            var result = [];
                        
            
            if(_.has(optionAttributes, 'Ethernet_Local_Access_Speed__c')
                && !_.isNull(optionAttributes['Ethernet_Local_Access_Speed__c'])){
                depattributes['AccessSpeed'] = optionAttributes['Ethernet_Local_Access_Speed__c'];
            }
            
            if(_.has(optionAttributes, 'Billing_Type__c') 
                && !_.isNull(optionAttributes['Billing_Type__c'])){
                depattributes['BillingType'] = optionAttributes['Billing_Type__c'];
            }
            
            _.each(portOptions, function(option){
                if(option['Local_Access_Speed__c'] == depattributes.AccessSpeed){
                    BillingTypeSplitted.push(option['Billing_Type__c']);
                    if(option['Billing_Type__c'] == productAttributeValues['Billing_Type__c']){
                        billingTypeIs = true;
                    }
                }
            });
            
            BillingType = PAVObjConfigService.getPicklistValues(PAVObjConfigService.prepareOptionsList(BillingTypeSplitted));
            
            if(_.has(depattributes, 'AccessSpeed') 
                && _.has(depattributes, 'BillingType')){                
                filteredPortOption = _.findWhere(portOptions, {'Local_Access_Speed__c': depattributes.AccessSpeed, 'Billing_Type__c': depattributes.BillingType});
                if(_.has(filteredPortOption, 'Bandwidth__c') 
                    && _.has(filteredPortOption, 'Circuit_Speed__c')){
                    
                    BandwidthSplitted = filteredPortOption['Bandwidth__c'].split(', ');
                    CircuitSpeedSplitted = filteredPortOption['Circuit_Speed__c'].split(', ');                      
                    
                    Bandwidth = PAVObjConfigService.getPicklistValues(PAVObjConfigService.prepareOptionsList(BandwidthSplitted));
                    CircuitSpeed = PAVObjConfigService.getPicklistValues(PAVObjConfigService.prepareOptionsList(CircuitSpeedSplitted));
                    
                    _.each(Bandwidth, function(item){
                        if(item.value != null && (item.value == productAttributeValues['Bandwidth__c'])){
                            bandwidthIs = true;
                        }
                    });
                    
                    _.each(CircuitSpeed, function(item){
                        if(item.value != null && (item.value == productAttributeValues['Access_Speed__c'])){
                            circuitSpeedIs = true;
                        }
                    });
                    
                    _.each(AttributeGroups, function(eachgroup){
                        _.each(eachgroup.productAtributes, function(eachattribute){
                            if(eachattribute.fieldName == 'Bandwidth__c'){
                                eachattribute.picklistValues = Bandwidth;
                                if(!bandwidthIs){
                                    productAttributeValues['Bandwidth__c'] = Bandwidth[1].label;
                                }                   
                            }
                            
                            if(eachattribute.fieldName == 'Access_Speed__c'){
                                eachattribute.picklistValues = CircuitSpeed;
                                if(!circuitSpeedIs){
                                    productAttributeValues['Access_Speed__c'] = CircuitSpeed[1].value;
                                } 
                            }
                            
                            if(eachattribute.fieldName == 'Billing_Type__c'){
                                eachattribute.picklistValues = BillingType; 
                                if(!billingTypeIs){
                                    productAttributeValues['Billing_Type__c'] = '--None--';
                                }
                            }
                            
                        });
                    });
                    result.push({'AttributeGroups':AttributeGroups, 'productAttributeValues':productAttributeValues});
                }else{
                    Bandwidth = PAVObjConfigService.getPicklistValues(PAVObjConfigService.prepareOptionsList(BandwidthSplitted));
                    CircuitSpeed = PAVObjConfigService.getPicklistValues(PAVObjConfigService.prepareOptionsList(CircuitSpeedSplitted));
                    
                    _.each(AttributeGroups, function(eachgroup){
                        _.each(eachgroup.productAtributes, function(eachattribute){
                            if(eachattribute.fieldName == 'Bandwidth__c'){
                                eachattribute.picklistValues = Bandwidth;
                                productAttributeValues['Bandwidth__c'] = '--None--';
                            }
                            
                            if(eachattribute.fieldName == 'Access_Speed__c'){
                                eachattribute.picklistValues = CircuitSpeed;
                                productAttributeValues['Access_Speed__c'] = '--None--';
                            }
                        });
                    });
                    
                    result.push({'AttributeGroups':AttributeGroups, 'productAttributeValues':productAttributeValues});
                }
            }
            if(_.has(depattributes, 'AccessSpeed') 
                && !_.has(depattributes, 'BillingType')){
                
                Bandwidth = PAVObjConfigService.getPicklistValues(PAVObjConfigService.prepareOptionsList(BandwidthSplitted));
                CircuitSpeed = PAVObjConfigService.getPicklistValues(PAVObjConfigService.prepareOptionsList(CircuitSpeedSplitted));
                
                _.each(AttributeGroups, function(eachgroup){
                    _.each(eachgroup.productAtributes, function(eachattribute){
                        if(eachattribute.fieldName == 'Bandwidth__c'){
                            eachattribute.picklistValues = Bandwidth;                                
                            productAttributeValues['Bandwidth__c'] = '--None--';                                  
                        }
                        
                        if(eachattribute.fieldName == 'Access_Speed__c'){
                            eachattribute.picklistValues = CircuitSpeed;
                            productAttributeValues['Access_Speed__c'] = '--None--';
                        }
                        
                        if(eachattribute.fieldName == 'Billing_Type__c'){
                             eachattribute.picklistValues = BillingType; 
                             if(!billingTypeIs){
                                productAttributeValues['Billing_Type__c'] = '--None--';
                             }
                        }
                    });
                });             
                result.push({'AttributeGroups':AttributeGroups, 'productAttributeValues':productAttributeValues});
            }
            
            return result;
        }

        function seatTypeExpressions(AttributeGroups, productAttributeValues){
            var count = OptionGroupDataService.seatTypeCount;
            _.each(AttributeGroups, function(attrGroups){
                _.each(attrGroups.productAtributes, function(item){
                    if(item.fieldName == 'Total_Seats__c'){
                        item.isReadOnly = true;
                        productAttributeValues['Total_Seats__c'] = count;
                    }
                });
            });
            return productAttributeValues;
        }

        // multi-location related.
        // Applicable for E-Line products.
        function getLocationsCheck(attributeGrous, selectedSR, allSRs){
            var locationA = [];
            var locationZ = [];
                if(selectedSR != null || selectedSR != 'undefined'){
                    locationA.push({active:true,defaultValue:false,label:selectedSR.Name, value:selectedSR.Name});
                }
                if(allSRs != null || allSRs != 'undefined'){
                    locationZ.push({active:true,defaultValue:false,label:'--None--', value:'--None--'});
                    _.each(allSRs, function(item){
                        locationZ.push({active:true,defaultValue:false,label:item.Name, value:item.Id});
                    });
                }
            _.each(attributeGrous, function(attrGroups){
                _.each(attrGroups.productAtributes, function(items){
                    if(items.fieldName == 'Location_A__c'){
                        items.picklistValues = locationA;
                        items.isReadOnly = true;
                    }
                    if(items.fieldName == 'Location_Z__c'){
                        items.picklistValues = locationZ;
                    }
                });
            });
            
            
            return attributeGrous;
        }
        
        function checkIfLocationIsZ(optionGroups, selectedProductId, locZ, selectedLoc, optionGroupName){
            var loc = '';
            if(optionGroupName != 'undefined' || !_.isEmpty(optionGroupName)){
                _.each(optionGroups, function(optGroup){
                    _.each(optGroup.productOptionComponents, function(component){
                        if(component.productId == selectedProductId && optionGroupName.indexOf('Location Z') != -1 && locZ != null){
                            loc = locZ;
                        }
                        if(component.productId == selectedProductId && optionGroupName.indexOf('Location A') != -1 && selectedLoc != null){
                            loc = selectedLoc;
                        }
                    });
                });
            }
            return loc;
        }
        function setMultiSiteLocations(productAttributeValues, allLocations){
            if(_.has(productAttributeValues, 'Location_A__c')){
                OptionGroupDataService.LocationAValue = productAttributeValues['Location_A__c'];
            }
            if(_.has(productAttributeValues, 'Location_Z__c')){ 
                _.each(allLocations, function(LocItem){
                    if(LocItem.Id == productAttributeValues['Location_Z__c']){
                        OptionGroupDataService.LocationZValue = LocItem.Name;
                    }
                });
            }
        }
        
        function setProductAttributeValues(pavs, selectedSr, zLoc){
            if(_.has(pavs, 'Location_A__c')){
                pavs['Location_A__c'] = selectedSr.Name;
            }
            if(_.has(pavs, 'Location_Z__c')){
                pavs['Location_Z__c'] = zLoc;
            }
            
            return pavs;
        }

        function getLocationZ(pav){ 
            var zLoc = '';  
            if(_.has(pav, 'Location_Z__c') 
                && (pav['Location_Z__c'] == null 
                || pav['Location_Z__c'] == 'undefined')){
                zLoc = null;
            }else{
                zLoc = pav['Location_Z__c'];
            }
            return zLoc;
        }
    }
})();