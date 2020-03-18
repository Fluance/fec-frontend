import template from './virtual-datatable-filter.component';

const virtualDatatableFilter = {
    bindings: {
        filterList: '<',
        filterOptions: '<',
        onFilter: '&'
    },
    controller: [controller],
    templateUrl: template
};

function controller() {
    var ctrl = this;

    ctrl.$onInit = onInit;
    ctrl.applyFilter = applyFilter;

    // ------------------------------------------------------------

    function onInit() {
        ctrl.selectedFilter = null;
    }

    function applyFilter(filterId) {
        ctrl.onFilter({name: ctrl.filterOptions.idName, value: filterId});
    }
}

export default virtualDatatableFilter;
