import template from './visitIdSelectionDialog.tmpl.html';

/* @ngInject */
visitIdSelectionDialogService.$inject = [
    '$mdDialog',
    'dataservice.visits',
    'fecNavigationContextService'
];

function visitIdSelectionDialogService(
    $mdDialog,
    dataserviceVisits,
    fecNavigationContextService
) {
    var service = {
        select: select
    };

    return service;

    function select() {
        return fecNavigationContextService.getContextItem('patientId')
            .then(function (patientId) {
                return dataserviceVisits.getPatientVisits({pid: patientId});
            })
            .then(function (visits) {
                if (!_.isEmpty(visits) && visits.totalRecords === 1) {
                    return visits.visits[0].visit.visitInfo.number;
                } else {
                    var selectedVisit;
                    var parentEl = angular.element(document.body);
                    return $mdDialog.show({
                        parent: parentEl,
                        templateUrl: template,
                        controller: ['$mdDialog', DialogController],
                        controllerAs: '$ctrl',
                        clickOutsideToClose: true,
                        escapeToClose: true
                    }).then(function () {
                        return selectedVisit;
                    })
                    .catch(function(error) {
                        if (error) {
                            console.error(error);
                        }
                        return null;
                    });
                }

                function DialogController($mdDialog) {
                    var ctrl = this;
                    var selected;

                    ctrl.visits = visits.visits;

                    ctrl.closeDialog = closeDialog;
                    ctrl.isSelected = isSelected;
                    ctrl.selectElement = selectElement;

                    function isSelected(visitId) {
                        return selected === visitId;
                    }

                    function selectElement(element) {
                        selected = element;
                        selectedVisit = selected;
                        $mdDialog.hide();
                    }

                    function closeDialog() {
                        $mdDialog.hide();
                    }
                }
            })
            .catch(function(error) {
                console.error(error);
                return null;
            });
    }
}

export default visitIdSelectionDialogService;
