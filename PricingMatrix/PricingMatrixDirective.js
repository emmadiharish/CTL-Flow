/**
 * Directive: PricingMatrixDirective 
 */
;(function() {
	'use strict';


	function PricingMatrixController($scope, $filter, SystemConstants, BaseService, PAVObjConfigService, ProductAttributeValueDataService, PricingMatrixDataService) {
        /*Initialize Scope Variables*/
        var pmCtrl = this;

        var items = [];
        pmCtrl.filteredItems = [];
        
        function init(){
    		$scope.baseService = BaseService;
    		$scope.PAVService = ProductAttributeValueDataService;

		    pmCtrl.pavfieldDescribeMap = {};
		    pmCtrl.displayPricingMatrix = false;
        	pmCtrl.baseUrl = SystemConstants.baseUrl;
        }
        
	    
		$scope.$watch('baseService.getPAVObjConfigLoadComplete()', function(newVal, oldVal) {
	        if(newVal != oldVal
                && newVal == true)
            {
	            PricingMatrixDataService.getPricingMatrix().then(function(result) {
			        items = result.lines;		
					pmCtrl.dimensions = result.dimensions;
					pmCtrl.pavfieldDescribeMap = PAVObjConfigService.fieldNametoDFRMap;
					pmCtrl.displayPricingMatrix = PricingMatrixDataService.gethasPricingMatrix();

			    	// functions have been describe process the data for display
				    search();
				})  
        	}
        });

		$scope.$watchCollection('PAVService.getbundleproductattributevalues()', function(newValue){
    		if(!_.isUndefined(items)
    			&& _.size(items) > 0)
    		{
    			search();// perform search when bundle PAV is changed.
    		}
	    });

	    //Initialize the Search Filters 
	    function search() {
	        var selectedAttrValues = ProductAttributeValueDataService.getbundleproductattributevalues();
	        var dimensions_nonblank = [];
	        _.each(pmCtrl.dimensions, function(field) {
	            if(!_.isUndefined(selectedAttrValues[field])
	                && !_.isNull(selectedAttrValues[field])
	                && selectedAttrValues[field] != '')
	            {
	                dimensions_nonblank.push(field);
	            }
	        });
	        pmCtrl.filteredItems = $filter('filter')(items, function (item) {
	            for (var i = 0; i < dimensions_nonblank.length;  i++) {
	            var prodattvalue = selectedAttrValues[dimensions_nonblank[i]];
	                var pricingmatrixvalue = item[dimensions_nonblank[i]];
	                if(prodattvalue != pricingmatrixvalue)
	                {
	                   return false;
	                }
	            }
	            return true;
	        });
	    };
	    
	    init();
    };

    PricingMatrixController.$inject = ['$scope', 
    									'$filter', 
    									'SystemConstants', 
    									'BaseService', 
    									'PAVObjConfigService', 
    									'ProductAttributeValueDataService', 
    									'PricingMatrixDataService'];

	angular.module('APTPS_ngCPQ').directive('pricingMatrix', PricingMatrix);

	PricingMatrix.$inject = ['SystemConstants'];
	function PricingMatrix(SystemConstants){
		// Runs during compile
		return {
			// name: '',
			// priority: 1,
			// terminal: true,
			scope: {}, // {} = isolate, true = child, false/undefined = no change
			controller: PricingMatrixController,
			controllerAs: 'Ctrl',
			// require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
			restrict: 'AE', // E = Element, A = Attribute, C = Class, M = Comment
			//template: '<div>pageHeader</div>',
			templateUrl: SystemConstants.baseUrl + "/Templates/PricingMatrixView.html",
			// replace: true,
			// transclude: true,
			// compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
			//link: function(cartCtrl, iElm, iAttrs, controller) {
			//}
			bindToController: true
		};
	}
}).call(this);