import template from './settings-clinics.component.html';

const SettingsClinics = {
    templateUrl: template,
    controller: controller,
    bindings: {}
};

controller.$inject = [
    'sessionService'
];

function controller(session) {
    /*jshint validthis: true */
    var ctrl = this;
    ctrl.reordering = false;

    // events
    ctrl.$onInit = onInit;
    // interface
    ctrl.changeReordering = changeReordering;

    // --------------------------------------------- Event methods

    function onInit() {
        ctrl.companies = (session.user) ? angular.copy(session.user.companies) : [];

        ctrl.sortableOptions = {
            'ui-floating': true,
            items: '.sortable-item',
            handle: '.clinics-list-item-reorder'
        };
    }

    // --------------------------------------------- Interface methods

    function changeReordering(saveState) {
        ctrl.reordering = !ctrl.reordering;
        if (!ctrl.reordering) {
            if (saveState) {
                session.setCompaniesUnitsServicesOrder(ctrl.companies);
                session.user.companies = angular.copy(ctrl.companies);
            } else {
                ctrl.companies = angular.copy(session.user.companies);
            }
        }
    }
}

export default SettingsClinics;
