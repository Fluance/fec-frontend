PatientNavigationController.$inject = [
    '$q',
    '$scope',
    '$state',
    '$transitions',
    '$stateParams',
    'routerService',
    'patientNavigationService'
];

/* @ngInject */
function PatientNavigationController(
    $q,
    $scope,
    $state,
    $transitions,
    $stateParams,
    routerService,
    patientNavigationService
) {
    var TRANSITION_SOURCE_URL = 'url';
    var TRANSITION_LOCATION = 'replace';

    var ctrl = this;

    ctrl.patientExists = false;
    ctrl.navigationOpened = false;

    ctrl.$onInit = onInit;
    ctrl.$onDestroy = onDestroy;
    ctrl.toggleNavigation = toggleNavigation;

    $scope.$on('$locationChangeStart', function() {
        ctrl.navigationOpened = false;
    });

    // Register events
    $transitions.onSuccess({}, onStateChangeSuccess);

    // ---------------------------------------------------------- API methods

    function onInit() {
        ctrl.isLoading = true;

        // get parameters from state
        var relatedPatientIds = {
            patientId: $stateParams.pid,
            visitId: $stateParams.vnb,
            appointmentId: $stateParams.aid
        };

        routerService.stateChangedSuccess.subscribe(_stateChangedSuccess);
        ctrl.currentNavigationTitle = $state.current.navigationTitle;

        _validatePatientExists(relatedPatientIds);
        _setOriginState();
        _setOriginParams();
    }

    function onDestroy() {
        if (routerService.stateChangedSuccess) { routerService.stateChangedSuccess.unsubscribe(); }
    }

    function _setOriginState() {
        patientNavigationService.setOriginState($state.params.originState);
    }

    function _setOriginParams() {
        patientNavigationService.setOriginParams($state.params.originParams);
    }

    function _stateChangedSuccess(data) {
        ctrl.currentNavigationTitle = data.state.navigationTitle;
    }

    function toggleNavigation() {
        ctrl.navigationOpened = !ctrl.navigationOpened;
    }

    // ---------------------------------------------------------- Event handling

    /**
     * Validate if patient exists when state changes
     */
    function onStateChangeSuccess(transition) {
        var toState = transition.to();
        var toParams = transition.params('to');

        // get parameters from state
        var relatedPatientIds = {
            patientId: toParams['pid'],
            visitId: toParams['vnb'],
            appointmentId: toParams['aid'],
            noteId: toParams['noteId']
        };

        // source == 'url' => transition state comes from manually changing the URL
        var isNavigationClick = transition._options.source !== TRANSITION_SOURCE_URL && transition._options.location !== TRANSITION_LOCATION;


        // don't need to validate (again) patient when clicking the navigation menu
        if(isNavigationClick) {
            return $q.resolve();
        }
        // validate patient (exists) from deep link parameters (aid, vnb, pid)
        else {
            return _validatePatientExists(relatedPatientIds);
        }

    }

    // ---------------------------------------------------------- Helper methods

    function _validatePatientExists(relatedPatientIds) {
        ctrl.isLoading = true;
        patientNavigationService.validatePatientExists(relatedPatientIds)
            .then(function() {
                ctrl.patientExists = true;
            })
            .catch(function(reason) {
                ctrl.patientExists = false;
                if(reason === 'note') {
                    ctrl.errorMsg = 'patientNavigation.NO_NOTE'; // note not found
                }
                else if(reason === 'appointment') {
                    ctrl.errorMsg = 'patientNavigation.NO_APPOINTMENT'; // appointment not found
                }
                else if(reason === 'visit') {
                    ctrl.errorMsg = 'patientNavigation.NO_VISIT'; // visit not found
                }
                else {
                    ctrl.errorMsg = 'patientNavigation.NO_PATIENT'; // patient not found
                }
            })
            .finally(function() {
                ctrl.isLoading = false;
            });
    }
}

export default PatientNavigationController;
