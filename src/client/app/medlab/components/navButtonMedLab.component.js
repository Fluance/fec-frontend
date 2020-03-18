import _ from 'lodash';

/**
 * @ngdoc directive
 * @module medlab
 * @name fecNavButtonMedLab
 * @description
 *
 * The MedLab navigation button allows a popup window to navigate to MedLab (pre-filled) Prescription form for visits.
 */

const NavButtonMedLab = {
    bindings: {
        pid: '<',
        vnb: '<',
        directPrescriptionURL: '<',
        isEnabled: '<'
    },
    controller: controller,
    template:   '<a ng-if="$ctrl.isActive && !$ctrl.directPrescriptionURL" class ="md-primary" ng-disabled="!$ctrl.isEnabled || $ctrl.isBusy" ng-click="$ctrl.onClick()">' +
                    '<img src="content/images/medlab_logo_small.png" style="height:24px; margin:8px; padding:0"></img>' +
                '</a>' +
                '<a ng-if="$ctrl.isActive && $ctrl.directPrescriptionURL" class ="md-primary" ng-disabled="!$ctrl.isEnabled || $ctrl.isBusy" href="{{$ctrl.directPrescriptionURL}}" target="_blank">' +
                    '<img src="content/images/medlab_logo_small.png" style="height:24px; margin:8px; padding:0"></img>' +
                '</a>' +
                '<md-progress-linear md-mode="indeterminate" ng-show="$ctrl.isBusy"></md-progress-linear></md-button>'
};

controller.$inject = [
    '$q',
    '$translate',
    'dataservice.accessLogs',
    'dataservice.visits',
    'logger',
    'medlabService',
    'LabService',
    'TabOpenerService',
    '$mdDialog',
    'SelectVisitDialogService',
    '$window',
    'routerService'
];

function controller(
    $q,
    $translate,
    dataServiceAccessLogs,
    dataServiceVisits,
    logger,
    medlabService,
    labService,
    tabOpener,
    $mdDialog,
    selectVisitDialogService,
    $window,
    routerService
) {

    /*jshint validthis: true */
    var vm = this;

    vm.isBusy = false;
    vm.canNavigateResult = false;
    vm.isActive = true;
    vm.visitsCount = 0;
    vm.directPrescriptionURL = "http://www.google.com";
    vm.onClick = onClick;

    vm.$onInit = onInit;

    // ------------------------------------------------------------------------ Lifecycle-hooks
    function onInit() {
        // Remove tag, if MedLab components are not activated
        if (!medlabService.isActive()) {
            vm.isActive = false;
        } else {
            // check open visits
            dataServiceVisits.getPatientVisits({pid: vm.pid})
                .then(function(result) {
                    vm.visitsCount = result.totalRecords;
                    vm.visits = result.visits;

                    // set vm.vnb
                    if(vm.visitsCount === 1) {
                        vm.vnb = vm.visits[0].visit.visitInfo.number;
                    } else {
                        vm.vnb = null;
                    }

                })
                .then(function() {
                    // pre-fetch URL for 1 visit
                    if(vm.vnb) {
                        vm.visits.forEach(function (entry, index) {
                            var visitNumber = entry.visit.visitInfo.number;

                            selectVisitDialogService.labUrlForVisit(visitNumber)
                                .then(function (labURL) {
                                    vm.directPrescriptionURL = labURL;
                                });
                        });
                    }
                });

            if (!_.isBoolean(vm.isEnabled)) {
                vm.isEnabled = true;
            }
        }
    }

    // ------------------------------------------------------------------------- Public methods

    function onClick($event) {
        // no open visits
        if(vm.visitsCount === 0) {
            // display dialog with error to user
            vm.errorTranslationTitle = $translate.instant('medlab.ERROR_NO_PRESCRIPTION_TITLE');
            vm.errorTranslation = $translate.instant('medlab.ERROR_NO_PRESCRIPTION_MESSAGE');

            $mdDialog.show(
                $mdDialog.alert()
                    .clickOutsideToClose(true)
                    .title(vm.errorTranslationTitle)
                    .htmlContent(vm.errorTranslation)
                    .ariaLabel(vm.errorTranslationTitle)
                    .ok($translate.instant('core.OK'))
                    .targetEvent($event)
            );
        }
        else {
            vm.visits.forEach(function (entry, index) {
                var visitNumber = entry.visit.visitInfo.number;

                selectVisitDialogService.labUrlForVisit(visitNumber)
                    .then(function (labURL) {
                        vm.visits[index].visit.labURL = labURL;
                    });
            });
            labService.createPrescription(vm.visitsCount, vm.vnb, vm.visits, $event);
        }
    }

    // ------------------------------------------------------------------------- Private methods

}

export default NavButtonMedLab;
