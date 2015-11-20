/**
 * PageErrorsDataService DataService
 *  prepares data for any transaction related page errors.
 */
;(function() {
    'use strict';

    angular.module('APTPS_ngCPQ')
        .service('PageErrorDataService', PageErrorDataService); 

    PageErrorDataService.$inject = ['SystemConstants'];

    function PageErrorDataService(SystemConstants) {
        var service = this;
        var nsPrefix = SystemConstants.nsPrefix;
        
        service.errorMessages = [];

        checkSystemErrors();

        /**
         * Check for errors in system constants, etc
         */
        function checkSystemErrors() {
            if (!SystemConstants.baseFileUrl) {
                service.errorMessages.push('No Carousel Default IconId');
            }
        }

        /**
         * @return error messages array
         */
        service.getMessages = function() {
            return service.errorMessages;

        };

        service.clear = function () {
            service.errorMessages.length = 0;
            checkSystemErrors();
            return service;

        };

        /**
         * Update error messages array.
         */
        service.add = function(pageErrors) {
            if (!angular.isDefined(pageErrors) || pageErrors === null) {
                return;

            }
            if (angular.isArray(pageErrors)) {
                // Array.prototype.push.apply(service.errorMessages, pageErrors);
                _.each(pageErrors, function(pageError){
                    if (angular.isObject(pageError)
                        && pageError.hasOwnProperty('message')) {
                        service.errorMessages.push(pageError.message);
                    }
                })
            } else if (angular.isObject(pageErrors)) {
                if (pageErrors.hasOwnProperty('message')) {
                    service.errorMessages.push(pageErrors.message);

                } else if (pageErrors.hasOwnProperty('errorMessages')) {
                    service.errorMessages.push(pageErrors.errorMessages);

                }
            } else {
                service.errorMessages.push(pageErrors);

            }
            return service;

        };


    }
    
})();