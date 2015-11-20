/**
 * Directive: PageFooterDirective 
 */
;(function() {
	'use strict';

	angular.module('APTPS_ngCPQ').directive('pageFooter', PageFooter);
	PageFooterController.$inject = ['$scope', 
                               '$q', 
                               '$log', 
                               '$window', 
                               '$timeout', 
                               '$dialogs', 
                               'SystemConstants', 
                               'BaseService', 
                               'BaseConfigService',
                               'RemoteService',
                               'SaveConfigService',
                               'PageErrorDataService'];
	
	function PageFooterController($scope, $q, $log, $window, $timeout, $dialogs, SystemConstants, BaseService, BaseConfigService, RemoteService, SaveConfigService, PageErrorDataService){
		// all variable intializations.
        var pgFooterCtrl = this;
        
        function init(){
            $scope.baseService = BaseService;
            
            pgFooterCtrl.constants = SystemConstants;
            pgFooterCtrl.baseUrl = SystemConstants.baseUrl;
            pgFooterCtrl.ProgressBartinprogress = false;
            //pgFooterCtrl.ProgressBartinprogress = BaseService.getProgressBartinprogress();
        }

        $scope.$watch('baseService.getProgressBartinprogress()', function(newVal, oldVal){
            pgFooterCtrl.ProgressBartinprogress = newVal;
        });

        $scope.safeApply = function(fn) {
            var phase = this.$root.$$phase;
            if(phase == '$apply' || phase == '$digest') {
                if(fn && (typeof(fn) === 'function')) {
                    fn();
                }
            } else {
                this.$apply(fn);
            }
        };

        pgFooterCtrl.launch = function(which){
            var dlg = null;
            switch(which){

                /*// Error Dialog
                case 'error':
                dlg = $dialogs.error('This is my error message');
                break;

                // Wait / Progress Dialog
                case 'wait':
                dlg = $dialogs.wait(msgs[i++],progress);
                fakeProgress();
                break;

                // Notify Dialog
                case 'notify':
                dlg = $dialogs.notify('Something Happened!','Something happened that I need to tell you.');
                break;*/

                // Abandon Confirm Dialog
                case 'confirmAbandon':
                    dlg = $dialogs.confirm('Please Confirm','Are you sure you want to abandon the current cart?');
                    dlg.result.then(function(btn){
                        Abandon();
                    },function(btn){
                        
                });
                break;

                // Remove Item Confirm Dialog
                case 'confirmRemoveItem':
                    dlg = $dialogs.confirm('Please Confirm','Are you sure you want to remove the current Line item?');
                    dlg.result.then(function(btn){
                        removeItemFromCart();
                    },function(btn){
                    
                });
                break;
            }; // end switch
        }; // end launch

        pgFooterCtrl.addMoreProducts = function(){
            // apply timeout if saveCall is in progress.
            $timeout(function() {
                SaveConfigService.saveinformation().then(function(response){
                    if(response == true)
                    {
                        var requestparam = {cartHeader:BaseConfigService.cartHeader, 
                                            paramsMap:{}, 
                                            actionName:'Add More Products'};
                        var requestPromise = RemoteService.runPageAction(requestparam);
                        return requestPromise.then(function(response){
                            // add if any erors.
                            PageErrorDataService.add(response.messageWrapList);

                            parsenRedirect(response);
                        });
                    }
                })
            }, gettimeinmillis());
        }

        pgFooterCtrl.GoToPricing = function(){
            // apply timeout if saveCall is in progress.
            $timeout(function() {
                SaveConfigService.saveinformation().then(function(response){
                    if(response == true)
                    {
                        var requestparam = {cartHeader:BaseConfigService.cartHeader, 
                                            paramsMap:{}, 
                                            actionName:'Go To Pricing'};
                        var requestPromise = RemoteService.runPageAction(requestparam);
                        return requestPromise.then(function(response){
                            // add if any erors.
                            PageErrorDataService.add(response.messageWrapList);

                            parsenRedirect(response);
                        });
                    }
                })
            }, gettimeinmillis());
        }

        function Abandon(){
            var requestparam = {cartHeader:BaseConfigService.cartHeader, 
                                            paramsMap:{}, 
                                            actionName:'Abandon'};
            var requestPromise = RemoteService.runPageAction(requestparam);
            return requestPromise.then(function(response){
                // add if any erors.
                PageErrorDataService.add(response.messageWrapList);

                parsenRedirect(response);
            });
        }

        function removeItemFromCart(){
            var primaryLineNumber = BaseConfigService.lineItem.lineNumber, bundleProdId = BaseConfigService.lineItem.bundleProdId;
            var requestparam = {cartHeader:BaseConfigService.cartHeader, 
                                            paramsMap:{primaryLineNumber: primaryLineNumber, bundleProdId: bundleProdId}, 
                                            actionName:'Remove Current Bundle'};
            var requestPromise = RemoteService.runPageAction(requestparam);
            return requestPromise.then(function(response){
                // add if any erors.
                PageErrorDataService.add(response.messageWrapList);
                    
                parsenRedirect(response);
            });
        }

        function parsenRedirect(pgReference){
            if(!_.isNull(pgReference)
                && !_.isEmpty(pgReference))
                $window.location.href = _.unescape(pgReference);
        };

        function gettimeinmillis(){
            if(BaseService.getisSaveCallinProgress() == true)
                return 5000;
            else
                return 100;
        }

        init();

        return pgFooterCtrl;
	}

	PageFooter.$inject = ['SystemConstants'];
	function PageFooter(SystemConstants){
		// Runs during compile
		return {
			// name: '',
			// priority: 1,
			// terminal: true,
			// scope: {}, // {} = isolate, true = child, false/undefined = no change
			controller: PageFooterController,
			controllerAs: 'PageFooter',
			// require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
			restrict: 'AE', // E = Element, A = Attribute, C = Class, M = Comment
			//template: '<div>pageHeader</div>',
			templateUrl: SystemConstants.baseUrl + "/Templates/PageFooterView.html",
			// replace: true,
			// transclude: true,
			// compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
			//link: function($scope, iElm, iAttrs, controller) {
			//}
			bindToController: true
		};
	}
}).call(this);