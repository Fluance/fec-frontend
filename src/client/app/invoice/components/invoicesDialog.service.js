import template from './invoicesDialog.html';

InvoicesDialogService.$inject = ['$mdDialog', '$timeout'];

function InvoicesDialogService($mdDialog, $timeout) {

    var service = {};

    // Public API
    service.showInvoices = showInvoices;

    return service;

    // ------------------------------------------------------------------------- Interface methods

    function showInvoices($event, vnb, guarantorId) {
        $event.stopPropagation();
        var parentEl = angular.element(document.body);

        var backdropOpacity = 0.6;

        $mdDialog.show({
            parent: parentEl,
            targetEvent: $event,
            templateUrl: template,
            controller: ['$scope', '$mdDialog', InvoicesDialogController],
            controllerAs: '$ctrl',
            onShowing: function () {
                $timeout(function () {
                    if (angular.isNumber(backdropOpacity)) {
                        document.getElementsByClassName("md-dialog-backdrop")[0].style.opacity = backdropOpacity;
                    }
                });
            },
            clickOutsideToClose: true,
            escapeToClose: true,
            fullscreen: true
        });

        function InvoicesDialogController($scope, $mdDialog) {
            var ctrl = this;
            ctrl.vnb = vnb;
            ctrl.guarantorId = guarantorId;

            ctrl.closeDialog = function () {
                $mdDialog.hide();
            };
        }
    }
}

export default InvoicesDialogService;
