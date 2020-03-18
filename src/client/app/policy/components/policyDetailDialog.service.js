import angular from 'angular';
import template from './policyDetailDialog.html';

PolicyDetailDialogService.$inject = ['$mdDialog', '$timeout'];

function PolicyDetailDialogService($mdDialog, $timeout) {

    var service = {};

    // Public API
    service.showPolicyDetail = showPolicyDetail;

    return service;

    // ------------------------------------------------------------------------- Interface methods

    function showPolicyDetail($event, policy) {
        $event.stopPropagation();
        var parentEl = angular.element(document.body);

        var backdropOpacity = 0.6;

        $mdDialog.show({
            parent: parentEl,
            targetEvent: $event,
            templateUrl: template,
            controller: ['$scope', '$mdDialog', PolicyDetailDialogController],
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

        function PolicyDetailDialogController($scope, $mdDialog) {
            var ctrl = this;
            ctrl.policy = policy;

            ctrl.closeDialog = function () {
                $mdDialog.hide();
            };
        }
    }
}

export default PolicyDetailDialogService;
