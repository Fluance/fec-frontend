/*jshint maxparams: 20 */
AppointmentController.$inject = ['$scope',
    '$translate',
    'moment',
    '$stateParams',
    '$timeout',
    'dataservice.appointments',
    'logger',
    'searchStateManager',
    //'LayoutPatientContextBox',
    '$rootScope',
    '$http',
    //'tutorialService',
    '$filter',
    'sessionService'
];

function AppointmentController($scope, $translate,
    moment, $stateParams, $timeout, dataserviceAppointments,
    logger, searchStateManager, $rootScope,
    $http, $filter, session) {

    /*jshint validthis: true */
    var vm = this;
    vm.title = 'AppointmentController';
    vm.aid = $stateParams.aid;

    vm.result = null;

    // Populate our scope (as vm)
    $.extend(vm, {
        isLoading: true,
        isEmpty: false,
        isCrashed: false
    });

    // Events
    $rootScope.$on(session.EVENT_SELECTED_COMPANY_CHANGED, function() {
        searchStateManager.clearPatientSearchCache();
    });

    activate();

    // --------------------------------------------------------

    // Is executed when controller is initialized
    function activate() {
        getAppointmentDetails(vm.aid);

        /*
        if (tutorialService.isActive()) {
            // Configure tutorials
            configureTutorial();
            tutorialService.current(vm.title);
        }
        */
    }

    function getAppointmentDetails(aid) {
        return dataserviceAppointments.getAppointmentDetails(aid)
            .then(function(appointment) {
                appointment.isExpanded = true;
                var result = {
                    appointment: appointment
                };

                vm.result = result;
                if (vm.result) {
                    vm.result.isExpanded = true;
                }
            })
            .catch(function(exception) {
                if (exception.status === 404) {
                    vm.isEmpty = true;
                } else if (exception.status === 401) {
                    vm.isCrashed = true;
                } else {
                    vm.isLoadingMore = false;
                    vm.isCrashed = true;
                    $translate('error.ERROR').then(function(translation) {
                        logger.error(translation, exception);
                    });
                }
            });
    }

    function configureTutorial() {
        var contextBoxSteps = ContextBox.getTutorialSteps();
        var steps = [{
            element: '[tutorial-step="appointment"]',
            introKey: 'appointment.GUIDE_APPOINTMENT_AREA',
            position: 'bottom-middle-aligned'
        }];

        tutorialService.setSteps(vm.title, 0, contextBoxSteps.concat(steps));
    }
}

export default AppointmentController;
