/**
 * Directive: PageMessagesDirective 
 */
;(function() {
    'use strict';

    function PageMessagesController(PageMessageService) {
        
        var ctrl = this;
        
        // ctrl.errorMessages = [];
        ctrl.messageField = 'Message';

        ctrl.pageErrors = function() {
            return ctrl.messenger.getMessages().page.error;
        };

        ctrl.pageWarnings = function() {
            return ctrl.messenger.getMessages().page.warning;
        };

        ctrl.pageInfos = function() {
            return ctrl.messenger.getMessages().page.info;
        };

        ctrl.hasError = function() {
            return ctrl.messenger.getMessages().page.error.length !== 0;
        };

        ctrl.hasWarning = function() {
            return ctrl.messenger.getMessages().page.warning.length !== 0;
        };

        ctrl.hasInfo = function() {
            return ctrl.messenger.getMessages().page.info.length !== 0;
        };

        ctrl.hasMessages = function() {
            return ctrl.hasError() || ctrl.hasWarning() || ctrl.hasInfo();// || ctrl.hasCommonErrors();
        };

        ctrl.messenger = PageMessageService;

        return ctrl;
    }

    PageMessagesController.$inject = ['PageMessageService'];

    angular.module('APTPS_ngCPQ').directive('pageMessages', PageMessages);

    PageMessages.$inject = ['SystemConstants'];
    function PageMessages(SystemConstants){
        // Runs during compile
        return {
            // name: '',
            // priority: 1,
            // terminal: true,
            // scope: {}, // {} = isolate, true = child, false/undefined = no change
            controller: PageMessagesController,
            controllerAs: 'pgMessageCtrl',
            // require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
            // restrict: 'AE', // E = Element, A = Attribute, C = Class, M = Comment
            //template: '<div>pageHeader</div>',
            templateUrl: SystemConstants.baseUrl + "/Templates/PageMessagesView.html",
            // replace: true,
            // transclude: true,
            // compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
            //link: function($scope, iElm, iAttrs, controller) {
            //}
            bindToController: true
        };
    }
}).call(this);