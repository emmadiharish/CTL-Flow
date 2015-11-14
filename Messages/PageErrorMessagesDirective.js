;(function() {
    'use strict';

    angular.module('APTPS_ngCPQ').directive('pageErrorMessages', PageErrorMessages);

    PageErrorMessages.$inject = ['systemConstants'];

    function PageErrorMessages(systemConstants) {
        return {
            controller: PageErrorMessagesCtrl,
            controllerAs: 'pageErrors',
            bindToController: true,
            templateUrl: systemConstants.baseUrl + '/Templates/page-error-messages.html'
        };

    }

    PageErrorMessagesCtrl.$inject = ['PageErrorDataService'];

    function PageErrorMessagesCtrl(PageErrorDataService) {
        this.hideDetails = true;

        this.pageErrors = function() {
            return PageErrorDataService.errorMessages;
        };

        this.hasPageErrors = function() {
            return PageErrorDataService.errorMessages.length !== 0;
        };
        return this;

    }

})();