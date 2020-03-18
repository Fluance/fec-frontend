/**
 * Mycockpit Patient Element Directive
 */
import template from '../templates/singlePatientElement.html';

const myCockpitSinglePatient = ['$state', 'dataservice.patients', 'dataservice.visits', function($state, dataservicePatient, dataServiceVisits) {
    return {
        restrict: 'E',
        templateUrl: template,
        link: function(scope, element, attrs) {
            scope.isExpanded = function() {
                return true;
            };

            scope.goToDetailView = function(pid) {
                if (attrs.boxid === 'myUnits' || attrs.boxid === 'patient') {
                    $state.go('patient', { pid: pid });
                }
            };

            scope.goToVisit = function(visitNb) {
                $state.go('visit', {
                    vnb: visitNb
                });
            };
        },
        scope: {
            patients: '=patients',
            boxid: '=boxid',
            elementid: '=elementid',
            isLast: '=isLast',
            icon: '=icon'
        }
    }
}];

export default myCockpitSinglePatient;
