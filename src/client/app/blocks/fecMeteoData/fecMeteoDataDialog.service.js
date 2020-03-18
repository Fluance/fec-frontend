// jscs:disable requireParenthesesAroundIIFE
// Turn off jshint rules:
/*jshint -W101*/ //  Line too long
import template from './fecMeteoDataDialog.tmpl.html';

meteDataDialogService.$inject = ['$mdDialog'];

function meteDataDialogService($mdDialog) {
    var service = {

        // API Functions
        showDialog: showDialog
    };

    return service;

    // -------------------------------------------------------- Interface methods

    function showDialog($event, parentEl, firstDate, companyId) {
        $mdDialog.show({
            parent: parentEl,
            targetEvent: $event,
            templateUrl: template,
            controller: ['$scope', '$mdDialog', DialogController],
            controllerAs: '$ctrl',
            clickOutsideToClose: true,
            escapeToClose: true
        });

        function DialogController($scope, $mdDialog) {
            var ctrl = this;
            ctrl.firstDate = firstDate;
            ctrl.companyId = companyId;
            ctrl.closeDialog = function() {
                $mdDialog.hide();
            };
        }
    }

    // -------------------------------------------------------- Helper methods
}

export default meteDataDialogService;
