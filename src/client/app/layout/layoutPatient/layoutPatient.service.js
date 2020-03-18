(function() {
    'use strict';
    /**
     * @ngdoc service
     * @module app.layout
     * @name LayoutPatientContextBox
     * @description
     *
     * Use this factory to display a context box instead of using a navigation bar

        PatientContextController.$inject = ['LayoutPatientContextBox', '$scope'];
        function PatientContextController(ContextBox, $scope) {
            var vm = this;
              $scope.context = ContextBox;
        }
        ...
     *
     */
    angular
        .module('app.layout')
        .service('LayoutPatientContextBox', LayoutPatientContextBox);

    /* @ngInject */
    LayoutPatientContextBox.$inject = ['$q', '$rootScope', '$state', '$transitions',
        'dataservice.appointments', 'dataservice.guarantors', 'dataservice.invoices', 'dataservice.notes', 'dataservice.notecategories', 'dataservice.patients',
        'dataservice.servicefees', 'dataservice.session', 'dataservice.visits'
    ];

    function LayoutPatientContextBox($q, $rootScope, $state, $transitions, appointmentService, guarantorService, invoiceService, noteService, noteCategoryService, patientService,
                                     serviceFeeService, sessionService, visitService) {

        var HIDDEN_SEARCH_PARAMETERS = ['companyid', 'offset', 'sortorder', 'orderby'];
        var ROUTING_STATE_NAME_DASHBOARD = 'mycockpit';
        var ROUTING_STATE_NAME_FULL_SEARCH_RESULT = 'fullSearch';
        var ROUTING_STATE_NAME_FULL_SEARCH_BY_TYPE_RESULT = 'fullSearchByType';
        var ROUTING_STATE_NAME_SEARCH_RESULT = 'searchpatient';
        var ROUTING_STATE_NAME_VISIT_LIST = 'visitList';
        var ROUTING_STATE_NAME_GUARANTOR_LIST = 'guarantorList';
        var ROUTING_STATE_NAME_APPOINTMENT_LIST = 'appointmentList';
        var SESION_KEY_NAVIGATION_BACK_CONTEXT = 'fec-navigationBackContext';

        var canNavigateToDashboard = (!!$state.get(ROUTING_STATE_NAME_DASHBOARD));
        var canNavigateToSearchResult = (!!$state.get(ROUTING_STATE_NAME_SEARCH_RESULT));

        var navigationContext = {
            // Context
            appointment: undefined,
            guarantor: undefined,
            invoice: undefined,
            patient: undefined,
            serviceFee: undefined,
            visit: undefined,
            note: undefined,
            noteCategory: undefined,

            canNavigateBack: function() { return _.isObject(navigationContext.backContext.state); },
            canNavigateToVisitList: (!!$state.get(ROUTING_STATE_NAME_VISIT_LIST)),
            canNavigateToGuarantorList: (!!$state.get(ROUTING_STATE_NAME_GUARANTOR_LIST)),
            canNavigateToAppointmentList: (!!$state.get(ROUTING_STATE_NAME_APPOINTMENT_LIST)),

            isLoading: false,

            // Back context: allows navigating back to the last search (patient list) or home (my cockpit)
            backContext: {
                state: undefined,
                stateParams: undefined,
                searchParams: undefined,
                title: undefined
            },

            // Public methods
            getTutorialSteps: getTutorialSteps,
            navigateTo: navigateTo
        };

        // Register events
        $transitions.onSuccess({}, onStateChangeSuccess);
        $rootScope.$on('$viewContentLoaded', onViewContentLoaded);

        init();
        return navigationContext;

        // ------------------------------------------------------------------------- Public methods

        function getTutorialSteps() {
            return [{
                element: '#patientListBox',
                introKey: 'layoutPatient.GUIDE_HOME',
                position: 'bottom-left-aligned',
                isValid: function() {
                    return canNavigateToDashboard && (!navigationContext.backContext.searchParams) && $('#patientContext').is(':visible');
                }
            }, {
                element: '#patientListBox',
                introKey: 'layoutPatient.GUIDE_PATIENT_LIST',
                position: 'bottom-left-aligned',

                isValid: function() {
                    return canNavigateToSearchResult && navigationContext.backContext.searchParams && navigationContext.backContext.searchParams.length > 0 && $('#patientContext').is(':visible');
                }
            }, {
                element: '#patientDetailBox',
                introKey: 'layoutPatient.GUIDE_PATIENT_DETAIL',
                position: 'bottom-left-aligned',

                isValid: function() {
                    return _.isObject(navigationContext.patient) && $('#patientContext').is(':visible');
                }
            }, {
                element: '#visitListBox',
                introKey: 'layoutPatient.GUIDE_VISIT_LIST',
                position: 'bottom-left-aligned',
                isValid: function() {
                    return navigationContext.canNavigateToVisitList && _.isObject(navigationContext.visit) && $('#patientContext').is(':visible');
                }
            }, {
                element: '#visitDetailBox',
                introKey: 'layoutPatient.GUIDE_VISIT_DETAIL',
                position: 'bottom-left-aligned',

                isValid: function() {
                    return _.isObject(navigationContext.visit) && $('#patientContext').is(':visible');
                }
            }, {
                element: '#guarantorListBox',
                introKey: 'layoutPatient.GUIDE_GUARANTOR_LIST',
                position: 'bottom-left-aligned',

                isValid: function() {
                    return navigationContext.canNavigateToGuarantorList && _.isObject(navigationContext.guarantor) && $('#patientContext').is(':visible');
                }
            }, {
                element: '#guarantorDetailBox',
                introKey: 'layoutPatient.GUIDE_GUARANTOR_DETAIL',
                position: 'top-left-aligned',

                isValid: function() {
                    return _.isObject(navigationContext.guarantor) && navigationContext.guarantor.code && $('#patientContext').is(':visible');
                }
            }, {
                element: '#noteCategoryBox',
                introKey: 'layoutPatient.GUIDE_NOTE_CATEGORY',
                position: 'bottom-left-aligned',

                isValid: function() {
                    return _.isObject(navigationContext.noteCategory) && $('#noteCategoryBox').is(':visible');
                }
            }, {
                element: '#noteBox',
                introKey: 'layoutPatient.GUIDE_NOTE',
                position: 'bottom-left-aligned',

                isValid: function() {
                    return _.isObject(navigationContext.note) && $('#noteBox').is(':visible');
                }
            }];
        }

        /**
         * @ngdoc method
         * @name LayoutPatientContextBox#navigateTo
         * @description
         * Navigates to the specified routing state.
         **/
        function navigateTo(stateName, stateParams) {
            $state.go(stateName, stateParams);
        }

        // ------------------------------------------------------------------------- Event handlers

        function onViewContentLoaded() {
            $('#mobileExpand:not(.bound)')
                .addClass('bound')
                .on('click', function() {
                    $('#patientContext').slideToggle(350);
                    $('#unfoldFoldContext').toggleClass('unFolded');
                });
        }

        function onStateChangeSuccess(transition) {
            var toState = transition.to();
            var toParams = transition.params('to');
            var fromState = transition.from();
            var fromParams = transition.params('from');

            var promise;
            if (toState.name === ROUTING_STATE_NAME_DASHBOARD) {
                // Reset back-context when returning home (returning an empty backContext)
                promise = clearBackContext()
                    .then(function() {
                        return {};
                    });
            } else {
                // Restoring backContext from session or initialized from 'fromState'
                promise = sessionService.getNavigationBackContext()
                    .then(function(backContext) {
                        if (!_.isObject(backContext) || _isSearchResultState(fromState)) {
                            backContext = {
                                state: fromState,
                                stateParams: fromParams
                            };
                        }
                        return backContext;
                    });
            }

            promise.then(function(backContext) {
                setBackContext(backContext);
            });

            // Everytime the state changes successfully, the contextbox needs to update
            loadContext(toParams);
        }

        // --------------------------------------------------------------------- Context management

        function init() {
            // When re-/loading the page, we need to load the contextbox
            loadContext($state.params);

            // Restore last-search context
            return sessionService.getNavigationBackContext()
                .then(function(backContext) {
                    if (!_.isObject(backContext)) {
                        backContext = navigationContext.backContext;
                    }
                    setBackContext(backContext);
                });
        }

        function clearContext() {
            navigationContext.appointment = undefined;
            navigationContext.guarantor = undefined;
            navigationContext.invoice = undefined;
            navigationContext.patient = undefined;
            navigationContext.serviceFee = undefined;
            navigationContext.visit = undefined;
            navigationContext.note = undefined;
            navigationContext.noteCategory = undefined;
        }

        function clearBackContext() {
            navigationContext.backContext.state = undefined;
            navigationContext.backContext.stateParams = undefined;
            navigationContext.backContext.searchParams = undefined;
            return sessionService.clearNavigationBackContext();
        }

        // Method to setup the contextbox.
        // It works like a cascade, loading the related objects from the bottom to top.
        function loadContext(stateParams) {
            navigationContext.isLoading = true;
            clearContext();

            $q.resolve()
                .then(function() {
                    return _loadNote(stateParams);
                })
                .then(function() {
                    return _loadNoteCategory(stateParams);
                })
                .then(function() {
                    return _loadAppointment(stateParams);
                })
                .then(function() {
                    return _loadInvoice(stateParams);
                })
                .then(function() {
                    return _loadGuarantor(stateParams);
                })
                .then(function() {
                    return _loadServiceFee(stateParams);
                })
                .then(function() {
                    return _loadVisit(stateParams);
                })
                .then(function() {
                    return _loadPatient(stateParams);
                })
                .catch(function(error) {
                    console.error(error);
                })
                .finally(function () {
                    navigationContext.isLoading = false;
                });
        }

        /**
         * @ngdoc method
         * @name LayoutPatientContextBox#setBackContext
         * @description
         * Sets the last-search context and notifies all listeners that the context has changed.
         */
        function setBackContext(backContext) {
            // Get last-search parameters
            var searchParams;
            if (backContext.state && _isSearchResultState(backContext.state) && backContext.stateParams) {
                var keys = _.difference(Object.keys(backContext.stateParams), HIDDEN_SEARCH_PARAMETERS);
                keys = _.filter(keys, function(key) {
                    return backContext.stateParams[key] && backContext.stateParams[key] !== null;
                });

                if (keys.length > 0) {
                    searchParams = keys.map(function(key) {
                        return {
                            name: key,
                            value: backContext.stateParams[key]
                        };
                    });
                }
            }

            // Save back context
            if (canNavigateToSearchResult && searchParams && searchParams.length > 0) {
                navigationContext.backContext.title = 'layoutPatient.SEARCH_RESULTS';
                navigationContext.backContext.state = backContext.state;
                navigationContext.backContext.stateParams = backContext.stateParams;
                navigationContext.backContext.searchParams = searchParams;
                sessionService.setNavigationBackContext(navigationContext.backContext);
            } else if (canNavigateToDashboard) {
                navigationContext.backContext.title = 'layoutPatient.HOME';
                navigationContext.backContext.state = $state.get(ROUTING_STATE_NAME_DASHBOARD);
                navigationContext.backContext.stateParams = undefined;
                navigationContext.backContext.searchParams = searchParams;
            } else {
                navigationContext.backContext.title = undefined;
                navigationContext.backContext.state = undefined;
                navigationContext.backContext.stateParams = undefined;
                navigationContext.backContext.searchParams = undefined;
            }
        }

        // --------------------------------------------------------------------------- ID providers

        function getAppointmentId(stateParams) {
            var value = 0;
            if (_.isObject(stateParams) && _.isString(stateParams.aid) && stateParams.aid.length > 0) {
                value = stateParams.aid;
            }
            return (_.isString(value)) ? parseInt(value) : value;
        }

        function getGuarantorId(stateParams) {
            var value = 0;
            if (_.isObject(navigationContext.invoice)) {
                value = navigationContext.invoice.guarantorId;
            } else if (_.isObject(stateParams) && _.isString(stateParams.guarantorid) && stateParams.guarantorid.length > 0) {
                value = stateParams.guarantorid;
            }
            return (_.isString(value)) ? parseInt(value) : value;
        }

        function getInvoiceId(stateParams) {
            var value = 0;
            if (_.isObject(stateParams) && _.isString(stateParams.invoiceId) && stateParams.invoiceId.length > 0) {
                value = stateParams.invoiceId;
            }
            return (_.isString(value)) ? parseInt(value) : value;
        }

        function getNoteId(stateParams) {
            var value = 0;
            if (_.isObject(stateParams) && _.isString(stateParams.noteId) && stateParams.noteId.length > 0) {
                value = stateParams.noteId;
            }
            return (_.isString(value)) ? parseInt(value) : value;
        }

        function getNoteCategoryId(stateParams) {
            var value = 0;
            if (_.isObject(navigationContext.note) && _.isObject(navigationContext.note.category)) {
                value = navigationContext.note.category.id;
            }
            return (_.isString(value)) ? parseInt(value) : value;
        }

        function getPatientId(stateParams) {
            var value = 0;
            if (_.isObject(navigationContext.visit)) {
                value = navigationContext.visit.patientId;
            } else if (_.isObject(navigationContext.note)) {
                value = navigationContext.note.patient.pid;
            } else if (_.isObject(stateParams) && _.isString(stateParams.pid) && stateParams.pid.length > 0) {
                value = stateParams.pid;
            }
            return (_.isString(value)) ? parseInt(value) : value;
        }

        function getServiceFeeId(stateParams) {
            var value = 0;
            if (_.isObject(stateParams) && _.isString(stateParams.bid) && stateParams.bid.length > 0) {
                value = stateParams.bid;
            }
            return (_.isString(value)) ? parseInt(value) : value;
        }

        function getVisitId(stateParams) {
            var value = 0;
            if (_.isObject(navigationContext.appointment)) {
                value = navigationContext.appointment.visit.visitNb;
            } else if (_.isObject(navigationContext.serviceFee)) {
                value = navigationContext.serviceFee.visitNb;
            } else if (_.isObject(navigationContext.note) && _.isObject(navigationContext.note.visit)) {
                value = navigationContext.note.visit.vnb;
            } else if (_.isObject(stateParams) && _.isString(stateParams.vnb) && stateParams.vnb.length > 0) {
                value = stateParams.vnb;
            }
            return (_.isString(value)) ? parseInt(value) : value;
        }

        // ------------------------------------------------------------------------ Loading methods

        function _loadAppointment(stateParams) {
            var appointmentId = getAppointmentId(stateParams);

            if (appointmentId) {
                return appointmentService.getAppointmentDetails(stateParams.aid)
                    .then(function(appointment) {
                        navigationContext.appointment = appointment;
                    })
                    .catch(function(error) {
                        navigationContext.appointment = null;
                        console.error(error);
                    });
            } else {
                return $q.resolve();
            }
        }

        function _loadGuarantor(stateParams) {
            var guarantorId = getGuarantorId(stateParams);
            var visitId = getVisitId(stateParams);

            if (visitId && guarantorId) {
                var promise = (guarantorId !== '-') ? guarantorService.getGuarantorDetails(visitId, guarantorId) : $q.resolve({});
                return promise
                    .then(function(guarantor) {
                        navigationContext.guarantor = guarantor;
                    })
                    .catch(function(error) {
                        navigationContext.guarantor = null;
                        console.error(error);
                    });
            } else {
                return $q.resolve();
            }
        }

        function _loadInvoice(stateParams) {
            var invoiceId = getInvoiceId(stateParams);
            if (invoiceId) {
                return invoiceService.getInvoice(invoiceId)
                    .then(function(invoice) {
                        navigationContext.invoice = invoice;
                    })
                    .catch(function(error) {
                        navigationContext.invoice = null;
                        console.error(error);
                    });
            } else {
                return $q.resolve();
            }
        }

        function _loadNote(stateParams) {
            var noteId = getNoteId(stateParams);
            if (noteId) {
                return noteService.getNote(noteId)
                    .then(function(note) {
                        navigationContext.note = note;
                    })
                    .catch(function(error) {
                        navigationContext.note = null;
                        console.error(error);
                    });
            } else {
                return $q.resolve();
            }
        }

        function _loadNoteCategory(stateParams) {
            var noteCategoryId = getNoteCategoryId(stateParams);
            if (noteCategoryId) {
                return noteCategoryService.getNoteCategory(noteCategoryId)
                    .then(function(note) {
                        navigationContext.noteCategory = note;
                    })
                    .catch(function(error) {
                        navigationContext.noteCategory = null;
                        console.error(error);
                    });
            } else {
                return $q.resolve();
            }
        }

        function _loadPatient(stateParams) {
            var pid = getPatientId(stateParams);
            if (pid) {
                return patientService.getPatientDetail(pid)
                    .then(function(patient) {
                        navigationContext.patient = patient;
                    })
                    .catch(function(error) {
                        navigationContext.patient = null;
                        console.error(error);
                    });
            } else {
                return $q.resolve();
            }
        }

        function _loadVisit(stateParams) {
            var vnb = getVisitId(stateParams);
            if (vnb) {
                return visitService.getVisitById(vnb)
                    .then(function(visit) {
                        navigationContext.visit = visit;
                    })
                    .catch(function(error) {
                        navigationContext.visit = null;
                        console.error(error);
                    });
            } else {
                return $q.resolve();
            }
        }

        function _loadServiceFee(stateParams) {
            var serviceFeeId = getServiceFeeId(stateParams);

            if (serviceFeeId) {
                return serviceFeeService.getServiceFeeDetails(serviceFeeId)
                    .then(function(serviceFee) {
                        navigationContext.serviceFee = serviceFee;
                    })
                    .catch(function(error) {
                        navigationContext.serviceFee = null;
                        console.error(error);
                    });
            } else {
                return $q.resolve();
            }
        }

        // ------------------------------------------------------------------------- Helper methods

        function _isSearchResultState(state) {
            return _.isObject(state) &&
                (
                    (state.name === ROUTING_STATE_NAME_FULL_SEARCH_RESULT) ||
                    (state.name === ROUTING_STATE_NAME_FULL_SEARCH_BY_TYPE_RESULT) ||
                    (state.name === ROUTING_STATE_NAME_SEARCH_RESULT)
                );
        }
    }
})();
