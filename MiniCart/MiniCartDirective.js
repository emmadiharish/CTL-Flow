/**
 * Directive: MiniCartDirective 
 */
;(function() {
	'use strict';

    function miniCartLink(scope, elem, attrs, ctrl) {
        var dropdown = elem[0].querySelector('.mini-cart__display');
        var clickOutside = document.querySelector('html');
        clickOutside.addEventListener('click', function() {
            return elem.removeClass('is--open');
        });
        elem[0].addEventListener('click', function(e) {
            return e.stopPropagation();
        });

        /*scope.$watch(function () { return ctrl.totals; },
                function(newVal, oldVal) {
            if(newVal) {
                ctrl.syncCartTotal();
            }
        }, true
        );*/

        return dropdown.addEventListener('click', function(e) {
            if (elem.hasClass('is--open')) {
                return elem.removeClass('is--open');
            } else {
                return elem.addClass('is--open');
            }
        });
    };
        
	function MiniCartController($scope, $window, $dialogs, SystemConstants, BaseService, MiniCartDataService, PageErrorDataService)
    {
        var miniCtrl = this;

        function init(){
             
            // Initialize  Variables
            // miniCtrl.reverse = false;                
            // miniCtrl.itemsPerPage = 5;
            miniCtrl.cart = [];
            // miniCtrl.pagedItems = [];
            // miniCtrl.currentPage = 0;
            miniCtrl.itemsPerPage = 5;
            
            miniCtrl.baseUrl = SystemConstants.baseUrl;
            // miniCtrl.lineCount = 0;
            
            // Group by pages
            // miniCtrl.groupToPages();
            MiniCartDataService.getMiniCartLines().then(function(result) {
                miniCtrl.cart = result;
            });
        }

        // Calculate Total Number of Pages based on Records Queried 
        /*miniCtrl.groupToPages = function () {
            // miniCtrl.currentPage = 0;
            MiniCartDataService.getMiniCartLines().then(function(result) {
                miniCtrl.cart = result;        
                miniCtrl.lineCount = miniCtrl.items.length;
                miniCtrl.pagedItems = [];
                for (var i = 0; i < miniCtrl.items.length; i++) {
                    if (i % miniCtrl.itemsPerPage === 0) {
                        miniCtrl.pagedItems[Math.floor(i / miniCtrl.itemsPerPage)] = [miniCtrl.items[i]];
                    } else {
                        miniCtrl.pagedItems[Math.floor(i / miniCtrl.itemsPerPage)].push(miniCtrl.items[i]);
                    }
                }
            })
        };*/
            
        /*miniCtrl.firstPage = function () {
            miniCtrl.currentPage = 0;
        };
        
        miniCtrl.lastPage = function () {
            miniCtrl.currentPage = miniCtrl.pagedItems.length-1;
        };
        
        miniCtrl.prevPage = function () {
            if (miniCtrl.currentPage > 0) {
                miniCtrl.currentPage--;
            }
        };
        
        miniCtrl.nextPage = function () {
            if (miniCtrl.currentPage < miniCtrl.pagedItems.length - 1) {
                miniCtrl.currentPage++;
            }
        };
        
        miniCtrl.setPage = function () {
            miniCtrl.currentPage = this.n;
        };*/
        
        miniCtrl.invokeDoConfigure = function(lineItemId){
            MiniCartDataService.configureLineItem(lineItemId).then(function(result){
                // redirect the page to config URL.

                // add if any erors.
                PageErrorDataService.add(result.messageWrapList);
                
                var configUrl = parsePagereference(result.ref);
                if(!_.isNull(configUrl))
                    $window.location.href = configUrl;
            })
        };

        miniCtrl.deleteLineItemFromCart = function(lineNumber_tobedeleted){
            BaseService.startprogress();// start page level progress bar. 
            MiniCartDataService.deleteLineItemFromCart(lineNumber_tobedeleted).then(function(result){
                // add if any erors.
                PageErrorDataService.add(result.messageWrapList);

                var retUrl = parsePagereference(result.ref);
                if(!_.isNull(retUrl))
                    $window.location.href = retUrl;
                // mark minicart as dirty and reload minicart.
                //MiniCartDataService.setMinicartasDirty();
                //miniCtrl.groupToPages();
                BaseService.completeprogress();// stop page level progress bar.
            })
        };
        
        /*miniCtrl.launch = function(which, lineItem){
            var dlg = null;
            switch(which){
                // Delete Line Item Confirm Dialog
                case 'confirmRemoveLine':
                    dlg = $dialogs.confirm('Please Confirm','Are you sure you want to Delete "'+lineItem.Apttus_Config2__ProductId__r.Name+ '" from cart ?');
                    dlg.result.then(function(btn){
                        miniCtrl.deleteLineItemFromCart(lineItem.Apttus_Config2__LineNumber__c);
                    },function(btn){
                        
                });
                break;
            }; // end switch
        }; // end launch*/

        function parsePagereference(pgReference){
            var res = null;
            if(!_.isNull(pgReference)
                && !_.isEmpty(pgReference))
                res = _.unescape(pgReference);
            return res;
        };

        miniCtrl.gotoCart = function() {
            
        };

        miniCtrl.finalizeCart = function() {
            
        };

        init();
    };
    MiniCartController.$inject = ['$scope', 
    								'$window', 
    								'$dialogs', 
    								'SystemConstants', 
    								'BaseService', 
    								'MiniCartDataService',
                                    'PageErrorDataService'];

	angular.module('APTPS_ngCPQ').directive('miniCart', MiniCart);

	MiniCart.$inject = ['SystemConstants'];
	function MiniCart(SystemConstants){
		// Runs during compile
		return {
			// name: '',
			// priority: 1,
			// terminal: true,
			scope: {}, // {} = isolate, true = child, false/undefined = no change
			controller: MiniCartController,
			controllerAs: 'miniCart',
			// require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
			restrict: 'AE', // E = Element, A = Attribute, C = Class, M = Comment
			//template: '<div>pageHeader</div>',
			templateUrl: SystemConstants.baseUrl + "/Templates/MiniCartView.html",
			// replace: true,
			// transclude: true,
			// compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
			link: miniCartLink,
			bindToController: true
		};
	}
}).call(this);