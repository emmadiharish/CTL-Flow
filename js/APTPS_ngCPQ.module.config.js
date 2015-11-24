;(function() {
    'use strict';

    configBlock.$inject = [
            '$provide',
            'SystemConstants',
            'paginationTemplateProvider'
        ];

    function configBlock($provide, SystemConstants, paginationTemplateProvider){
        //A single pagination-controls template is used throught the app. This may be limiting.
        paginationTemplateProvider.setPath(SystemConstants.baseUrl + '/Templates/pagination.html');

        $provide.decorator("$exceptionHandler", ['$delegate', 'BaseService', 'PageErrorDataService', function($delegate, BaseService, PageErrorDataService){
                return function(exception, cause){
                    exception.message = 'Please contact Admin \n Message: '+exception.message;
                    $delegate(exception, cause);
                    
                    // end progress bar so atleast user can abandon on hard-error.
                    // BaseService.resetProgressBartinprogress();// end progress bar.
                    
                    PageErrorDataService.add(exception.message);
            };
        }])
    }

    angular.module('APTPS_ngCPQ').config(configBlock);
})();