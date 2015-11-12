/**
 * Directive: BundleAttributesDirective 
 */
;(function() {
	'use strict';
	
	function BundleAttributesController($scope, SystemConstants, $sce, BaseService, BaseConfigService, LocationDataService, ProductAttributeConfigDataService, ProductAttributeValueDataService, PAVObjConfigService, OptionGroupDataService) {
		// all variable intializations.
        var remotecallinitiated = false;
        var attrCtrl = this;
        
        function init(){
        	$scope.locationService = LocationDataService;
            $scope.baseService = BaseService;
            $scope.optionGroupService = OptionGroupDataService;

            attrCtrl.constants = SystemConstants;
            attrCtrl.baseConfig = BaseConfigService;

            attrCtrl.AttributeGroups = [];// attribute config groups for main bundle.
            attrCtrl.pavfieldDescribeMap = {};
            attrCtrl.productAttributeValues = {};

            attrCtrl.SeatCountForBundle = 0;
        }

        $scope.$watch('locationService.getselectedlpa()', function(newVal, oldVal) {
            if(!_.isEmpty(newVal)
                && !_.isEqual(newVal, oldVal)
                && remotecallinitiated == false)
            {   
                retrieveproductattributeGroupData();
            }    
        });

        $scope.$watch('baseService.getLocationLoadComplete()', function(newVal, oldVal) {
            if(newVal != oldVal
                && newVal == true
                && remotecallinitiated == false)
            {   
                retrieveproductattributeGroupData();
            }    
        });

        $scope.$watch('optionGroupService.seatTypeCount', function(newVal, oldVal){
            attrCtrl.SeatCountForBundle = newVal;
            //if($scope.productAttributeValues.hasOwnProperty('Total_Seats__c') && $scope.SeatCountForBundle > 0){
            if(attrCtrl.SeatCountForBundle != 'undefined' 
                || attrCtrl.SeatCountForBundle != null){
                attrCtrl.productAttributeValues['Total_Seats__c'] = attrCtrl.SeatCountForBundle;
            }
            if(remotecallinitiated == false)
            {
                attrCtrl.retrieveproductattributeGroupData();
            }
        });
        
        // Note : this method should be invoked only when remotecallinitiated flag is false;
        function retrieveproductattributeGroupData(){
            // run only if location remote call is complete.
            if(BaseService.getLocationLoadComplete() == true)
            {
                remotecallinitiated = true;
                var alllocationIdSet = LocationDataService.getalllocationIdSet();
                var selectedlocationId = LocationDataService.getselectedlpaId();
                var bundleProductId = BaseConfigService.lineItem.bundleProdId;
                PAVObjConfigService.getPAVFieldMetaData().then(function(fieldDescribeMap){
                    if(_.isEmpty(attrCtrl.pavfieldDescribeMap))
                    {
                        attrCtrl.pavfieldDescribeMap = fieldDescribeMap;
                    }
                    ProductAttributeConfigDataService.getProductAttributesConfig(bundleProductId, alllocationIdSet, selectedlocationId).then(function(attributeconfigresult) {
                        ProductAttributeValueDataService.getProductAttributeValues(bundleProductId).then(function(result)
                        {
                            ProductAttributeConfigDataService.setBundleAttributeFields(attributeconfigresult);
                            var bundlePAV = ProductAttributeValueDataService.getbundleproductattributevalues();
                            // var res = PAVObjConfigService.configurePAVFields(attributeconfigresult, bundlePAV);
                            setBundleAttributes(attributeconfigresult, bundlePAV);
                            renderBundleAttributes();
                            remotecallinitiated = false;
                        })
                    })
                })
            }
        }

        function setBundleAttributes(attrgroups, pav){
            attrCtrl.AttributeGroups = attrgroups;
            attrCtrl.productAttributeValues = pav;
        }

        function renderBundleAttributes(){
            // clear the previous option attribute groups.
            PAVObjConfigService.configurePAVFields(attrCtrl.AttributeGroups, attrCtrl.productAttributeValues);
            ProductAttributeValueDataService.setbundleproductattributevalues(attrCtrl.productAttributeValues);
            totalSeatCheck();
        }
        
        attrCtrl.PAVPicklistChange = function(fieldName){
            // attrCtrl.productAttributeValues['isUpdatedLocal'] = true;
            renderBundleAttributes();
        }

        attrCtrl.trustAsHtml = function(value) {
            return $sce.trustAsHtml(value);
        };

        //Set Total Seat Count When quantity is changed on Option level.
        function totalSeatCheck(){
            _.each(attrCtrl.AttributeGroups,  function(attributeGrp){
                _.each(attributeGrp.productAtributes, function(attribute){
                    if(attribute.fieldName == 'Total_Seats__c'){
                        attribute.isReadOnly = true;
                    }
                });
            });
        }

        init();
	};
    BundleAttributesController.$inject = ['$scope', 
                                           'SystemConstants',
                                           '$sce', 
                                           'BaseService', 
                                           'BaseConfigService', 
                                           'LocationDataService', 
                                           'ProductAttributeConfigDataService', 
                                           'ProductAttributeValueDataService', 
                                           'PAVObjConfigService',
                                           'OptionGroupDataService'];

	BundleAttributes.$inject = ['SystemConstants'];
	function BundleAttributes(SystemConstants){
		// Runs during compile
		return {
			// name: '',
			// priority: 1,
			// terminal: true,
			scope: {}, // {} = isolate, true = child, false/undefined = no change
			controller: BundleAttributesController,
			controllerAs: 'attrCtrl',
			// require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
			restrict: 'AE', // E = Element, A = Attribute, C = Class, M = Comment
			//template: '<div>pageHeader</div>',
			templateUrl: SystemConstants.baseUrl + "/Templates/BundleAttributesView.html",
			// replace: true,
			// transclude: true,
			// compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
			//link: function(cartCtrl, iElm, iAttrs, controller) {
			//}
			bindToController: true
		};
	}

	angular.module('APTPS_ngCPQ').directive('bundleAttributes', BundleAttributes);
}).call(this);