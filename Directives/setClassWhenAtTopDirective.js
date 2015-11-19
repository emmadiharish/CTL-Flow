/**
 * Directive: setClassWhenAtTop
 * 
 */
;(function() {
    'use strict';

    
    angular.module('APTPS_ngCPQ').directive('setClassWhenAtTop', SetClassWhenAtTop);

    SetClassWhenAtTop.$inject = ['$window'];

    function SetClassWhenAtTop($window){
        var directive;
        var $win = angular.element($window); // wrap window object as jQuery object

        directive = {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var topClass = attrs.setClassWhenAtTop, // get CSS class from directive's attribute value
                    offsetTop = element.offset().top; // get element's top relative to the document

                $win.on('scroll', function (e) {
                    if ($win.scrollTop() >= offsetTop) {
                        element.addClass(topClass);
                    } else {
                        element.removeClass(topClass);
                    }
                });
            }
        };
        return directive;
    };
}).call(this);
