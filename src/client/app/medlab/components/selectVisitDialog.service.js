import angular from 'angular';
import template from './selectVisitDialog.html';

SelectVisitDialogService.$inject = ['$window', 'routerService', '$mdDialog', '$translate', 'logger', 'dataservice.accessLogs', 'medlabService'];
function SelectVisitDialogService($window, routerService, $mdDialog, $translate, logger, dataServiceAccessLogs, medlabService) {
    var service;

    service = {
        visits: [],
        prescriptionUrl: '',
        showDialog: showDialog,
        navigateToVisit: navigateToVisit,
        labUrlForVisit: labUrlForVisit
    };

    return service;

    // -------------------------------------------------------- Public methods

    function showDialog($event, visits) {
        var parentEl = angular.element(document.body);
        service.visits = visits;

        $mdDialog.show({
            parent: parentEl,
            targetEvent: $event,
            clickOutsideToClose: true,
            escapeToClose: true,
            controller: [selectVisitDialogController],
            controllerAs: '$ctrl',
            locals: {
                visits: service.visits,
                prescriptionUrl: service.prescriptionUrl
            },
            bindToController: true,
            templateUrl: template
        });

        function selectVisitDialogController() {
            var vm = this;

            vm.selectedVnb = null;

            vm.closeDialog = closeDialog;
            vm.navigateToVisit = navigateToVisit;
            //vm.labUrlForVisit = labUrlForVisit;
            vm.isClicked = isClicked;

            // -------------------------------------------------------------------

            function isClicked(vnb) {
                return (vnb === vm.seletedVnb);
            }
        }
    }

    function labUrlForVisit(vnb) {

        var errorTranslationTitle, errorTranslationMessageSupport, errorTranslationCode,
            errorTranslation;

        // Write access log
        // Log only when user clicks on link
        //dataServiceAccessLogs.writeLog(undefined, 'medlab', vnb);

        return medlabService.getUrl(vnb)
            .then(function (url) {
                return url;
            })
            .catch(function (exception) {
                vm.seletedVnb = null;
                vm.prescriptionUrl = null;

                errorTranslationTitle = $translate.instant('medlab.ERROR_PRESCRIPTION_SERVER_TITLE');
                errorTranslationMessageSupport = $translate.instant('medlab.ERROR_PRESCRIPTION_SUPPORT');
                if (exception.status === 404) {
                    errorTranslationCode = 'medlab.ERROR_PRESCRIPTION_NOT_AVAILABLE';
                } else if (exception.status === 502) {
                    errorTranslationCode = 'medlab.ERROR_PRESCRIPTION_SERVER_NOT_AVAILABLE';
                } else if (exception.status === 500) {
                    errorTranslationCode = 'error.HTTP_SERVER';
                }
                else {
                    errorTranslationCode = 'medlab.ERROR_PRESCRIPTION_SERVER_NOT_AVAILABLE';
                }

                if (errorTranslationCode) {
                    errorTranslation = $translate.instant(errorTranslationCode);
                    logger.error(errorTranslation, exception);
                } else {
                    logger.error(exception.message);
                }

                vm.closeDialog();

                // show error communicating with prescription server
                $mdDialog.show(
                    $mdDialog.alert()
                        .clickOutsideToClose(true)
                        .title(errorTranslationTitle)
                        .htmlContent(errorTranslation + '. ' + errorTranslationMessageSupport)
                        .ariaLabel(errorTranslationTitle)
                        .ok($translate.instant('core.OK'))
                        .targetEvent($event)
                );
            });
    }

    function closeDialog() {
        $mdDialog.hide();
    }

    function navigateToVisit($event, vnb) {
        // Write access log
        dataServiceAccessLogs.writeLog(undefined, 'medlab', vnb);
        closeDialog();
    }

    /*
     *  Asynchronously getting lab URL => security issue in the browser when opening a new tab
     *  Workaround: pre-fetch lab URL's and use a static URL to open a new tab
     */
    function _navigateToVisit($event, vnb, dlg) {
        var errorTranslationTitle, errorTranslationMessageSupport, errorTranslationCode, errorTranslation;

        // Write access log
        dataServiceAccessLogs.writeLog(undefined, 'medlab', vnb);

        if (dlg) {
            medlabService.getUrl(vnb)
            .then(function(url) {
                dlg.location.href = url; // go to Prescription form page
                closeDialog();
            })
            .catch(function(exception) {
                errorTranslationTitle = $translate.instant('medlab.ERROR_PRESCRIPTION_SERVER_TITLE');
                errorTranslationMessageSupport = $translate.instant('medlab.ERROR_PRESCRIPTION_SUPPORT');
                if (exception.status === 404) {
                    errorTranslationCode = 'medlab.ERROR_PRESCRIPTION_NOT_AVAILABLE';
                } else if (exception.status === 502) {
                    errorTranslationCode = 'medlab.ERROR_PRESCRIPTION_SERVER_NOT_AVAILABLE';
                } else if (exception.status === 500) {
                    errorTranslationCode = 'error.HTTP_SERVER';
                }
                else {
                    errorTranslationCode = 'medlab.ERROR_PRESCRIPTION_SERVER_NOT_AVAILABLE';
                }

                if (errorTranslationCode) {
                    errorTranslation = $translate.instant(errorTranslationCode);
                    logger.error(errorTranslation, exception);
                } else {
                    logger.error(exception.message);
                }

                closeDialog();
                dlg.close();

                // show error communicating with prescription server
                $mdDialog.show(
                    $mdDialog.alert()
                        .clickOutsideToClose(true)
                        .title(errorTranslationTitle)
                        .htmlContent(errorTranslation + '. ' + errorTranslationMessageSupport)
                        .ariaLabel(errorTranslationTitle)
                        .ok($translate.instant('core.OK'))
                        .targetEvent($event)
                );
            });
        }
    }
}

export default SelectVisitDialogService;
