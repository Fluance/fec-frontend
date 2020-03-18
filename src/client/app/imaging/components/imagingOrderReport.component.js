import template from './imagingOrderReport.component.html';

const ImagingOrderReport = {
    bindings: {
        report: '<',
        history: '<'
    },
    templateUrl: template,
    controller: [controller]
};

function controller() {
    var ctrl = this;

    ctrl.hasHistory = false;
    ctrl.$onChanges = onChanges;

    // ----------------------------------------------------------

    function onChanges(changesObj) {
        if(!_.isUndefined(changesObj.history) && _.isArray(changesObj.history.currentValue) && changesObj.history.currentValue.length > 0) {
            ctrl.hasHistory = true;
        }
        else {
            ctrl.hasHistory = false;
        }
    }
}

export default ImagingOrderReport;
