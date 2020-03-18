import template from './fecPatientNavigationButtonAppointment.component.html';

const PatientNavigationButtonAppointment = {
    bindings: {
        isEnabled: '<?'
    },
    controller: ['$rootScope', '$q', '$state', '$translate', 'dataservice.appointments', 'fecNavigationContextService', controller],
    templateUrl: template
};

function controller($rootScope, $q, $state, $translate, dataserviceAppointments, fecNavigationContextService) {
    var ctrl = this;
    var refreshEvent;

    var DEFAULT_FROM_DATE = '1970-01-01';
    var STATE_APPOINTMENT = 'appointment';

    // state
    ctrl.isActive = true;
    ctrl.context = [];
    ctrl.askAlways = {
        name: 'appointmentId',
        state: 'appointment'
    };
    ctrl.hasMultipleAppointments = false;

    // methods
    ctrl.$onInit = onInit;
    ctrl.$onDestroy = _onDestroy;
    ctrl.canNavigate = canNavigate;
    ctrl.navigateTo = navigateTo;
    ctrl.isOnAppointmentDetails = isOnAppointmentDetails;
    ctrl.preventNavigation = preventNavigation;

    // ------------------------------------------------------ Public functions

    function onInit() {
        if (!_.isBoolean(ctrl.isEnabled)) {
            ctrl.isEnabled = true;
        }
        ctrl.requiredContext = 'appointmentId';

        var patientNavigationContext = fecNavigationContextService.getContext();
        if (patientNavigationContext) {
            var originParams = patientNavigationContext.originParams;
            if (originParams && originParams.appointmentId) {fecNavigationContextService.setContextItem('appointmentId', originParams.appointmentId);}
            canNavigate(fecNavigationContextService.getContext());
        }

        refreshEvent = $rootScope.$on('fecNavigationContextChanged', _navigationContextChangedEvent);
    }

    function _onDestroy() {
        refreshEvent();
    }

    function _navigationContextChangedEvent(event, contextElement) {
        if (contextElement && contextElement.key) {
            if (contextElement.key === 'patientId' && contextElement.value) {
                ctrl.context[contextElement.key] = contextElement.value;
                canNavigate(ctrl.context);
            } else if (contextElement.key === 'visitId' && ctrl.context.appointmentId && !isOnAppointmentDetails()) {
                //test if the visit is different of the appointment's visit
                dataserviceAppointments.getAppointmentDetails(ctrl.context.appointmentId).then(function (appointmentDetail) {
                    if (appointmentDetail && appointmentDetail.visit && appointmentDetail.visit.visitNb &&
                        appointmentDetail.visit.visitNb !== contextElement.value) {
                        ctrl.context['appointmentId'] = null;
                    }
                }).catch(function (error) {
                    console.error(error ? error : 'Error getting appointment');
                });
            } else if (contextElement.key === 'appointmentId') {
                ctrl.context['appointmentId'] = contextElement.value;
                if (contextElement.value) {
                    //fire the visit change due to a visitId change
                    dataserviceAppointments.getAppointmentDetails(contextElement.value).then(function (appointmentDetail) {
                        if (appointmentDetail && appointmentDetail.visit && appointmentDetail.visit.visitNb) {
                            fecNavigationContextService.setContextItem('visitId', appointmentDetail.visit.visitNb);
                        }
                    }).catch(function (error) {
                        console.error(error ? error : 'Error getting appointment');
                    });
                }
            }
        }
    }

    function canNavigate(context) {
        ctrl.context = context;
        if (context.patientId) {
            //if there is appointment test if it matches the patient
            _validateAppointment(context.patientId);
            //deep link access to patient or access with a patient loaded in the context
            var params = {
                pid: context.patientId,
                from: DEFAULT_FROM_DATE
            };

            return dataserviceAppointments.getAppointmentListForPatientCount(params)
                .then(function (count) {
                    ctrl.hasMultipleAppointments = count > 1;
                    return count > 0;
                });
        } else if (context.appointmentId) {
            //deep link access to appointments
            return dataserviceAppointments.getAppointmentDetails(context.appointmentId).then(function (appointmentDetail) {
                fecNavigationContextService.setContextItem('patientId', appointmentDetail.patient.pid);
                //fire the visit change for deep link access
                fecNavigationContextService.setContextItem('visitId', appointmentDetail.visit.visitNb);
                return canNavigate(context);
            }).catch(function (error) {
                console.error(error ? error : 'Error getting appointment');
                return $q.resolve(false);
            });
        } else {
            return $q.resolve(false);
        }
    }

    function navigateTo(context) {
        $state.go(STATE_APPOINTMENT, {'aid': context['appointmentId']});
    }

    function isOnAppointmentDetails() {
        return _.startsWith($state.current.name, ctrl.askAlways.state);
    }

    function preventNavigation() {
        var prevent = false;
        if (isOnAppointmentDetails() && !ctrl.hasMultipleAppointments && ctrl.context.appointmentId) {
            prevent = true;
        }

        return prevent;
    }

    function _validateAppointment(pid) {
        if (pid && ctrl.context.appointmentId) {
            ctrl.isBusy = true;
            dataserviceAppointments.getAppointmentDetails(ctrl.context.appointmentId)
                .then(function (appointmentDetail) {
                    if (appointmentDetail.patient.pid !== Number(pid)) {
                        ctrl.context.appointmentId = null;
                    }
                })
                .catch(function (error) {
                    console.error(error ? error : 'Error getting patient appointment');
                })
                .finally(function () {
                    ctrl.isBusy = false;
                });
        }
    }
}

export default PatientNavigationButtonAppointment;
