// jscs:disable requireParenthesesAroundIIFE
// Turn off jshint rules:
/*jshint -W101*/ //  Line too long
(function () {
    'use strict';

    var componentName = 'WhiteboardSurgeryCalendarDashboardComponent';

    angular
        .module('app.dashboard')
        .service(componentName, WhiteboardSurgeryCalendarDashboardComponent);

    WhiteboardSurgeryCalendarDashboardComponent.$inject = [
        '$rootScope',
        'config',
        'sessionService'
    ];


    /**
     * @ngdoc service
     * @module dashboard
     * @name WhiteboardSurgeryCalendarDashboardComponent
     * @description
     *
     * This is a dashboard object. Allow you to create an object.
     *
     */
    function WhiteboardSurgeryCalendarDashboardComponent($rootScope, config, session) {

        return function (params) {

            // Scope connect controller and template
            var scope = {};

            scope.isDashboardComponentAvailable = !_.isUndefined(config.whiteboardSurgery.operationRooms[session.user.companyId]);

            $rootScope.$on(session.EVENT_SELECTED_COMPANY_CHANGED, _onCompanyChanged);

            function _onCompanyChanged() {
                scope.isDashboardComponentAvailable = !_.isUndefined(config.whiteboardSurgery.operationRooms[session.user.companyId]);
            }

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
                        template: 'app/dashboard/components/whiteboardSurgeryCalendarDashboard/whiteboardSurgeryCalendarDashboard.tpl.html',
                        refreshStateSorting: function (isSorting) {
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
