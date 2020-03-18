/*jshint maxparams: 20 */
PatientController.$inject = ['$scope',
    '$translate',
    'moment',
    '$stateParams',
    '$q',
    '$state',
    '$timeout',
    'dataservice.patients',
    'logger',
    'searchStateManager',
    //'LayoutPatientContextBox',
    '$rootScope',
    //'tutorialService',
    '$filter',
    'sessionService',
    'fecNavigationContextService',
    'whiteboardService'
];

/* @ngInject */

function PatientController($scope, $translate,
    moment, $stateParams, $q, $state, $timeout,
    dataservice, logger, searchStateManager,
    $rootScope,
    $filter, session, fecNavigationContextService, whiteboardService) {

    /*jshint validthis: true */
    var vm = this;
    vm.title = 'PatientController';

    // The result object containing the patient to display
    vm.pid = $stateParams.pid;

    var whiteboardParams = whiteboardService.getWhiteboardState();
    if (!_.isEmpty(whiteboardParams)) {
        vm.companyid = whiteboardParams.companyId;
        vm.hospservice = whiteboardParams.hospService;
    }

    vm.result = {};

    // Populate our scope (as vm)
    $.extend(vm, {
        isLoading: true,
        isEmpty: false,
        isCrashed: false
    });

    // Events
    $rootScope.$on(session.EVENT_SELECTED_COMPANY_CHANGED, function () {
        searchStateManager.clearPatientSearchCache();
    });

    activate();
    return;

    // Is executed when controller is initialized
    function activate() {
        var contextToPreserve = [];
        if ($state.fluanceLastState && $state.fluanceLastState.state && $state.fluanceLastState.state.name && $state.fluanceLastState.state.name === 'patient') {
            //access from outside of patient context. Reset context
            contextToPreserve = ['companyId', 'field'];
            fecNavigationContextService.setContextItem('visitId', null);
            fecNavigationContextService.setContextItem('appointmentId', null);
        } else {
            // Preserve visitId and appointmentId in context
            // Preserve all search fields
            contextToPreserve = [
                'companyId',
                'visitId',
                'appointmentId',
                'firstname',
                'birthdate',
                'admissionstatus',
                'maidenname',
                'companyid',
                'hospservice',
                'patientunit',
                'patientbed',
                'admitdt',
                'patientId',
                'field',
                'name',
                'firstname',
                'birthdate',
                'admissionstatus',
                'maidenname',
                'companyid',
                'hospservice',
                'patientunit',
                'patientbed',
                'admitdt',
            ];
        }

        fecNavigationContextService.preserveContext(contextToPreserve);
        _loadData(vm.pid);

        /*
        if (tutorialService.isActive()) {
            // Configure tutorials
            configureTutorial();
            tutorialService.current(vm.title);
        }*/
    }

    function configureTutorial() {
        var contextBoxSteps = ContextBox.getTutorialSteps();
        var steps = [{
            element: 'fec-nav-button-notes',
            introKey: 'patient.GUIDE_NOTE',
            position: 'top-middle-aligned',
            isValid: function () {
                return $('.expander-body').is(':visible');
            }
        }, {
            element: 'fec-nav-button-visit-list',
            introKey: 'patient.GUIDE_VISITS',
            position: 'top-middle-aligned',
            isValid: function () {
                return $('.expander-body').is(':visible');
            }
        }, {
            element: 'fec-nav-button-imaging-list',
            introKey: 'patient.GUIDE_IMAGING',
            position: 'top-middle-aligned',
            isValid: function () {
                return $('.expander-body').is(':visible');
            }
        }, {
            element: 'fec-nav-button-lab',
            introKey: 'patient.GUIDE_LAB',
            position: 'top-middle-aligned',
            isValid: function () {
                return $('.expander-body').is(':visible');
            }
        }, {
            element: 'fec-nav-button-reporting',
            introKey: 'core.GUIDE_REPORTING',
            position: 'top-middle-aligned',
            isValid: function () {
                return $('.expander-body').is(':visible');
            }
        }, {
            element: 'fec-nav-button-appointment-list',
            introKey: 'patient.GUIDE_APPOINTMENT',
            position: 'top-middle-aligned',
            isValid: function () {
                return $('.expander-body').is(':visible');
            }
        }, {
            element: 'fec-nav-button-access-log',
            introKey: 'patient.GUIDE_ACCESS_LOGS',
            position: 'top-middle-aligned',
            isValid: function () {
                return $('.expander-body').is(':visible');
            }
        }];

        tutorialService.setSteps(vm.title, 0, contextBoxSteps.concat(steps));
    }

    function _loadData(pid) {
        vm.isLoading = true;
        _getPatientByPid(pid).finally(function () {
            if (!vm.isEmpty && !vm.isCrashed) {
                return $q
                    .all([
                        _getPatientDetail(pid),
                        _getNextOfKin(pid)
                    ])
                    .catch(function (exception) {
                        $translate('error.ERROR').then(function (translation) {
                            logger.error(translation, exception);
                        });
                    })
                    .finally(function () {
                        vm.isLoading = false;
                    });
            } else {
                vm.isLoading = false;
                return $q.resolve();
            }
        });
    }

    function _getPatientByPid(pid) {
        return dataservice.getPatientByPid(pid)
            .then(function (result) {
                if (result && result.patient) {
                    vm.result.patient = result.patient;
                    vm.result.visit = result.visit;
                } else {
                    vm.isEmpty = true;
                }
            })
            .catch(function (exception) {
                if (exception.status === 404) {
                    vm.isEmpty = true;
                } else if (exception.status === 401) {
                    vm.isCrashed = true;
                } else {
                    vm.isLoadingMore = false;
                    vm.isCrashed = true;
                    $translate('error.ERROR').then(function (translation) {
                        logger.error(translation, exception);
                    });
                }
            });
    }

    function _getPatientDetail(pid) {
        return dataservice
            .getPatientDetail(pid)
            .then(function (details) {
                // If in database there is "c/o" in any format it is deleted, due to is added in the html
                if (details && details.address && details.address.careOf) {
                    details.address.careOf = details.address.careOf.replace(/c\/[0o]/gi, '').trim();
                }
                vm.result.details = details;
            });
    }

    function _getNextOfKin(pid) {
        return dataservice
            .getPatientNextOfKinList(pid)
            .then(function (nok) {
                var promises = [];
                if (nok !== null && nok !== undefined) {
                    vm.result.nextofkin = nok;

                    // For each nok, we query contacts details
                    _.each(vm.result.nextofkin, function (nextOfKinObj, index) {
                        promises.push(
                            _getNextOfKinContact(nextOfKinObj)
                        );
                    });
                }

                _getBillingContacts();

                // we query each nok to get details of it.
                return $q.all(promises);
            });
    }

    function _getNextOfKinContact(nok) {
        return dataservice.getPatientNextOfKinContactList(nok.nextOfKinId)
            .then(function (contacts) {
                nok.contacts = [];
                _.each(contacts, function (contact) {
                    nok.contacts.push(contact);
                });
            });
    }

    function _getBillingContacts() {
        if (vm.result.nextofkin) {
            vm.result.billingContacts = _.filter(vm.result.nextofkin, function (item) {
                return item.addressType && item.addressType.indexOf('billing') > -1;
            });
        } else {
            vm.result.billingContacts = [];
        }
    }
}

export default PatientController;
