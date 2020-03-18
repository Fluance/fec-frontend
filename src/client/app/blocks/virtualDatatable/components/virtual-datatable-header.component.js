import template from './virtual-datatable-header.component.html';

const virtualDatatableHeader = {
    bindings: {
        columns: '<',
        resetSorting: '<',
        onSort: '&'
    },
    controller: ['$translate', controller],
    templateUrl: template
};

function controller($translate) {
    var ctrl = this;

    ctrl.$onInit = onInit;
    ctrl.$onChanges = onChanges;
    ctrl.sortBy = sortBy;
    ctrl.translate = translate;

    // ------------------------------------------------------------

    function onInit() {
        ctrl.selectedColumn = null;
        ctrl.selectedFilter = null;
    }

    function onChanges(changesObj) {
        if(changesObj.resetSorting && changesObj.resetSorting.currentValue) {
            ctrl.selectedColumn = null;
            ctrl.selectedFilter = null;
        }
    }

    function sortBy(columnName) {
        // no selected column
        if(!ctrl.selectedColumn || ctrl.selectedColumn.name !== columnName) {
            ctrl.selectedColumn = {
                name: columnName,
                sortDesc: true
            }
        }
        // toggle selection
        else {
            ctrl.selectedColumn.sortDesc = !ctrl.selectedColumn.sortDesc
        }

        // (sortBy = column name, sortDesc = [true = descending, false = ascending])
        ctrl.onSort({sortBy: ctrl.selectedColumn.name, sortDesc: ctrl.selectedColumn.sortDesc});
    }

    function translate(code) {
        return $translate.instant(code);
    }
}

export default virtualDatatableHeader;
