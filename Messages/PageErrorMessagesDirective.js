;(function() {
    'use strict';

    angular.module('APTPS_ngCPQ').directive('pageErrorMessages', PageErrorMessages);

    PageErrorMessages.$inject = ['SystemConstants'];

    function PageErrorMessages(SystemConstants) {
        return {
            controller: PageErrorMessagesCtrl,
            controllerAs: 'pageErrors',
            bindToController: true,
            templateUrl: SystemConstants.baseUrl + '/Templates/page-error-messages.html'
        };

    }

    PageErrorMessagesCtrl.$inject = ['PageErrorDataService'];

    function PageErrorMessagesCtrl(PageErrorDataService) {
        this.hideDetails = true;
        this.isCollapsed = false;
        
        this.pageErrors = function() {
            return PageErrorDataService.errorMessages;
        };

        this.hasPageErrors = function() {
            return PageErrorDataService.errorMessages.length !== 0;
        };
        return this;

    }

})();