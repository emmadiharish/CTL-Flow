;(function() {
    'use strict';
    angular.module('APTPS_ngCPQ').service('PageMessageService', PageMessageService); 
    PageMessageService.$inject = ['$log'];
    function PageMessageService($log) {
        var service = this;
        
        var ruleTypes = ['error', 'warning', 'info'];

        var messages = {
                
        };

        var messageTemplate = {
            page: {
                error: [],
                warning: [],
                info: []
            },
            prompt: []
        };

        service.clearAll = clearAll;

        service.addMessage = function(ruleType, msg){
            messages[0] = angular.copy(messageTemplate);
            
            var targetMessages = messages[0];
            targetMessages.page[ruleType].push({Message:msg});
        }

        /*function removeMessage(index)
        {
            service.messages.splice(index, 1);
        }*/

        service.clearAll = function(){
            //service.messages.length = 0;
            messages[0] = angular.copy(messageTemplate);
        }

        /**
         * @return {Object} message structure
         */
        service.getMessages = function() {
            return messages[0];
        };
    }
})();