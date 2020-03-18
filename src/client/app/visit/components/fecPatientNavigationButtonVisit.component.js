import _ from 'lodash';
import template from './fecPatientNavigationButtonVisit.component.html';

const PatientNavigationButtonVisit = {
    controller: ['$rootScope', '$q', '$state', 'fecNavigationContextService', 'dataservice.visits', controller],
    templateUrl: template
};

function controller($rootScope, $q, $state, fecNavigationContextService, dataServiceVisits) {
    var ctrl = this;
    var refreshEvent;

    // state
    ctrl.isActive = true;
    ctrl.context;
    ctrl.askAlways = {
        name: 'visitId',
        state: 'visit'
    };
    ctrl.hasMultipleVisits = false;

    // methods
    ctrl.$onInit = onInit;
    ctrl.$onDestroy = _onDestroy;
    ctrl.canNavigate = canNavigate;
    ctrl.navigateTo = navigateTo;
    ctrl.isOnVisitDetails = isOnVisitDetails;
    ctrl.preventNavigation = preventNavigation;

    // ------------------------------------------------------ Public functions

    function onInit() {
        if (!_.isBoolean(ctrl.isEnabled)) { ctrl.isEnabled = true; }
        ctrl.requiredContext = 'visitId';

        var patientNavigationContext = fecNavigationContextService.getContext();
        if (patientNavigationContext) {
            var originParams = patientNavigationContext.originParams;
            if (originParams && originParams.visitId) {fecNavigationContextService.setContextItem('visitId', originParams.visitId);}
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
            } else if (contextElement.key === 'visitId' && contextElement.value) {
                ctrl.context[contextElement.key] = contextElement.value;
            }
        }
    }

    function canNavigate(context) {
        ctrl.context = context;
        if (context.patientId) {
            //if there is appointment test if it matches the patient
            _validateVisit(context.patientId);
            //deep link access to patient or access with a patient loaded in the context
            return dataServiceVisits.getPatientVisits({pid: context.patientId})
            .then(function (result) {
                ctrl.hasMultipleVisits = result.totalRecords > 1;
                return !!result.totalRecords;
            })
            .catch(function(error) {
                console.error(error ? error : 'Error getting patient visits');
                return false;
            });
        } else if(context.visitId) {
            //deep link access to visit
            return dataServiceVisits.getVisitById(context.visitId)
                .then(function (visit) {
                    fecNavigationContextService.setContextItem('patientId', visit.patientId);
                    return canNavigate(context);
                })
                .catch(function(error) {
                    console.error(error ? error : 'Error getting patient visit');
                    return false;
                });
        } else {
            return $q.resolve(false);
        }
    }

    function navigateTo(context) {
        $state.go('visit', {'vnb': context['visitId']});
    }

    function preventNavigation() {
        var prevent = false;
        if (isOnVisitDetails() && !ctrl.hasMultipleVisits && ctrl.context.visitId) {
            prevent = true;
        }

        return prevent;
    }

    function isOnVisitDetails() {
        return _.startsWith($state.current.name, ctrl.askAlways.state);
    }

    function _validateVisit(pid) {
        if (pid && ctrl.context.visitId) {
            ctrl.isBusy = true;
            dataServiceVisits.getVisitById(ctrl.context.visitId)
                .then(function (visit) {
                    if (visit.patientId !== Number(pid)) {
                        ctrl.context.visitId = null;
                    }
                })
                .catch(function (error) {
                    console.error(error ? error : 'Error getting patient visit');
                })
                .finally(function () {
                    ctrl.isBusy = false;
                });
        }
    }
}

export default PatientNavigationButtonVisit;
