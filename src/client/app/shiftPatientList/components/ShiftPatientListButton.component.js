/*jshint -W040*/ //  Strict
/*jshint -W101*/ //  Line too long
import _ from 'lodash';
import template from './ShiftPatientListButton.component.html';

const ShiftPatientListButton = {
    bindings: {
        isDisabled: '<',
        companyId: '<',
        unit: '<'
    },
    controller: controller,
    templateUrl: template
};

controller.$inject = ['$element', 'ShiftPatientListService', 'dataservice.shiftPatients'];

function controller($element, shiftPatientListService, dataServiceShiftPatients) {
    var ctrl = this;
    ctrl.isActive = true;
    ctrl.isPatientListAvailable = false;

    // Remove tag, if PatientList component is not activated
    if (!shiftPatientListService.isActive()) {
        $element.remove();
    }
    else {
        // event
        ctrl.$onInit = onInit;
        ctrl.$onChanges = onChanges;
        // interface
        ctrl.onClick = onClick;
    }

    // ------------------------------------------------------------------------ Lifecycle-hooks

    function onInit() {
        // verify there is data available
        if (!ctrl.isDisabled) {
            _checkIsPatientListAvailable();
        }
    }

    function onChanges(changesObj) {
        if (!_.isUndefined(changesObj)) {
            // $onChanges runs before $onInit. Skip first run.
            if (!_.isUndefined(changesObj.isDisabled) && changesObj.isDisabled.isFirstChange()) { return; }

            // verify there is data available
            if (changesObj.companyId || changesObj.unit) {
                _checkIsPatientListAvailable();
            }
        }
    }

    // ------------------------------------------------------------------------ Public methods

    function onClick() {
        // open patient list dialog
        _openPatientList();
    }

    // ------------------------------------------------------------------------ Private methods

    // check if patient list data is available (for a company and unit)
    function _checkIsPatientListAvailable() {
        if (!!ctrl.unit) {
            dataServiceShiftPatients.checkAvailability(ctrl.companyId, ctrl.unit.code)
                .then(function(data) {
                    ctrl.isPatientListAvailable = data.data;
                })
                .catch(function(error) {
                    ctrl.isPatientListAvailable = false;
                });
        } else {
            ctrl.isPatientListAvailable = false;
        }
    }

    // show patient list dialog
    function _openPatientList() {
        shiftPatientListService.showPatientList(ctrl.companyId, ctrl.unit.code);
    }

}

export default ShiftPatientListButton;
