// jscs:disable requireParenthesesAroundIIFE
// Turn off jshint rules:
/*jshint -W101*/ //  Line too long

import angular from 'angular';
import template from './fecLabChartDialog.tmpl.html';

labChartDialogService.$inject = ['$mdDialog'];

function labChartDialogService($mdDialog) {
    var service = {

        // API Functions
        showDialog: showDialog
    };

    return service;

    // -------------------------------------------------------- Interface methods

    function showDialog($event, result, observationDates) {
        $mdDialog.show({
            parent: angular.element(document.body),
            templateUrl: template,
            controller: [DialogController],
            controllerAs: '$ctrl',
            clickOutsideToClose: true,
            escapeToClose: true,
            fullscreen: true
        });

        function DialogController() {
            var ctrl = this;
            ctrl.datas = result;
            ctrl.dates = observationDates;
            ctrl.closeDialog = closeDialog;

            function closeDialog() {
                $mdDialog.cancel();
            }
        }
    }

    // -------------------------------------------------------- Helper methods
}

export default labChartDialogService;
