;(function() {
    'use strict';

    ehconfigBlock.$inject = ['$provide'];

    function ehconfigBlock($provide){
        $provide.decorator("$exceptionHandler", ['$delegate', 'PageErrorDataService', function($delegate, PageErrorDataService){
                return function(exception, cause){
                    exception.message = 'Please contact Admin \n Message: '+exception.message;
                    $delegate(exception, cause);
                    
                    // end progress bar so atleast user can abandon on hard-error.
                    // BaseService.resetProgressBartinprogress();// end progress bar.
                    
                    PageErrorDataService.add(exception.message);
            };
        }])
    }

    /*angular.module('APTPS_ngCPQ').factory('$exceptionHandler', function() {
        return function(exception, cause) {
            exception.message += ' (caused by "' + cause + '")';
        throw exception;
        };
    });*/

    angular.module('APTPS_ngCPQ').config(ehconfigBlock);
})();