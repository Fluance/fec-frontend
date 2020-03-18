/*jshint -W101*/ //  Line too long

import angular from 'angular';
import _ from 'lodash';

ShiftPatientListService.$inject = ['$mdDialog'];

function ShiftPatientListService($mdDialog) {
    var _config;
    var _isActive = false;

    var service;

    service = {
        init: init,
        isActive: isActive,
        showPatientList: showPatientList
    };

    return service;

    // ------------------------------------------------------------------- Configration methods

    function init(config) {
        if (!_.isObject(config)) { return; }

        _config = config;
        service.isActive(true);
    }

    function isActive(value) {
        if (_.isUndefined(value)) {
            return _isActive;
        }
        else {
            var oldValue = _isActive;
            _isActive = value;
            return oldValue;
        }
    }

    // -------------------------------------------------------------------

    function showPatientList(companyId, unit) {
        var parentEl = angular.element(document.body);

        $mdDialog.show({
            parent: parentEl,
            template: '<md-dialog class="shiftPatientListDialog">' +
                '   <md-toolbar>' +
                '       <div class="md-toolbar-tools">' +
                '           <h2>{{"shiftPatientList.PATIENTS_LIST" | translate}}</h2>' +
                '           <span flex></span>' +
                '           <md-button class="md-icon-button" fec-mobile-click="vm.close()">' +
                '               <fec-icon type="cancel"></fec-icon>' +
                '           </md-button>' +
                '       </div>' +
                '   </md-toolbar>' +
                '   <fec-shift-patient-list company-id="vm.companyId" unit="vm.unit"></fec-shift-patient-list>' +
                '</md-dialog>',
            controller: ['$scope', '$mdDialog', DialogController],
            controllerAs: 'vm',
            clickOutsideToClose: true,
            escapeToClose: true
        });

        function DialogController() {
            var vm = this;

            vm.companyId = companyId;
            vm.unit = unit;
            vm.close = close;

            // -------------------------------------------------------

            function close() {
                $mdDialog.hide();
            }
        }
    }

}

export default ShiftPatientListService;
