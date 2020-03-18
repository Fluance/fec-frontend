import angular from 'angular';
import template from './servicefeeDetailDialog.html';

ServicefeeDetailService.$inject = ['$mdDialog', '$timeout'];

function ServicefeeDetailService($mdDialog, $timeout) {

    var service = {};

    // Public API
    service.showServicefeeDetail = showServicefeeDetail;

    return service;

    // ------------------------------------------------------------------------- Interface methods

    function showServicefeeDetail($event, serviceFee) {

        $event.stopPropagation();

        var parentEl = angular.element(document.body);

        var backdropOpacity = 0.6;

        $mdDialog.show({
            parent: parentEl,
            targetEvent: $event,
            templateUrl: template,
            controller: ['$scope', '$mdDialog', '$translate', 'dataservice.servicefees', 'logger', 'sessionService', DialogController],
            controllerAs: '$ctrl',
            onShowing: function () {
                $timeout(function () {
                    if (angular.isNumber(backdropOpacity)) {
                        document.getElementsByClassName("md-dialog-backdrop")[0].style.opacity = backdropOpacity;
                    }
                });
            },
            clickOutsideToClose: true,
            escapeToClose: true
        });

        function DialogController($scope, $mdDialog, $translate, dataserviceBenefits, logger, session) {
            var ctrl = this;
            ctrl.serviceFee = serviceFee;

            ctrl.closeDialog = function () {
                $mdDialog.hide();
            };

            ctrl.$onInit = init;

            function init() {
                _getBenefit();
            }

            function _getBenefit() {
                ctrl.isLoadingDetails = true;

                var params = {
                    id: ctrl.serviceFee.benefitId,
                    lang: session.getUILanguage()
                };

                dataserviceBenefits
                    .getServiceFeeDetails(ctrl.serviceFee.benefitId, params.lang)
                    .then(function (benefit) {

                        ctrl.serviceFee.details = benefit;

                        ctrl.isLoadingDetails = false;
                    })
                    .catch(function (exception) {
                        ctrl.isLoadingDetails = false;
                        $translate('error.ERROR').then(function (translation) {
                            logger.error(translation, exception);
                        });
                    });

            }
        }
    }
}

export default ServicefeeDetailService;
