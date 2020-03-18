// jscs:disable requireParenthesesAroundIIFE
// Turn off jshint rules:
/*jshint -W101*/ //  Line too long
(function() {
    'use strict';

    var componentName = 'MyLastSearchComponent';

    angular
        .module('app.dashboard')
        .service(componentName, MyLastSearchComponent);

    MyLastSearchComponent.$inject = [
        '$translate',
        '$rootScope',
        'userAgentService'
    ];


    /**
     * @ngdoc service
     * @module dashboard
     * @name MyLastSearchComponent
     * @description
     *
     * This is a dashboard object. Allow you to create an object.
     *
     */
    function MyLastSearchComponent(
        $translate,
        $rootScope,
        userAgent
    ) {

        return function(params) {

            // Scope connect controller and template
            var scope = {};
            scope.isMobile = userAgent.isMobileSize;

            // set sorting state
            function setStateSorting(isSorting) {
                scope.isStateSorting = isSorting;
            }

            return {
                // SOME DATA, NOT REQUIRED
                name: componentName,
                params: params,
                scope: scope,
                states: {
                    'default': {
                        template: 'app/dashboard/components/myLastSearch/myLastSearch.tpl.html',
                        refreshStateSorting: function(isSorting) {
                            // set isStateSorting in scope (to display draggable layer)
                            if (!_.isUndefined(isSorting) && _.isBoolean(isSorting)) {
                                setStateSorting(isSorting);
                            }
                        }
                    },

                }
            };
        };
    }

})();
