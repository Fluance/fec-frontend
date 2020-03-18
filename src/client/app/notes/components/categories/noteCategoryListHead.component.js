import template from './noteCategoryListHead.component.html';

const NoteCategoriesListHead = {
    bindings: {
        category: '<'
    },
    require: {
        fecNoteCategoriesList: '^fecNoteCategoriesList'
    },
    controller: ['$translate', '$scope', controller],
    templateUrl: template
};

function controller($translate, $scope) {

    var ctrl = this;
    ctrl.$onInit = onInit;
    ctrl.sortBy = sortBy;
    ctrl.$onDestroy = onDestroy;

    ctrl.selectedColumn = {
        sortDesc: true,
        name: 'id'
    };

    function onInit() {
        createColums();

        ctrl.destroyWatch = $scope.$watch('$ctrl.category', function (oldValue, newValue) {
            if (oldValue !== newValue) {
                createColums();
            }
        });
    }

    function onDestroy() {
        ctrl.destroyWatch();
    }

    /**
     * Create columns dynamically
     */
    function createColums() {
        ctrl.columns = [
            {
                text: 'notes.TABLE_HEAD_DATE', name: 'date', flex: '15', canSort: true,
                show: true
            },
            {
                text: 'notes.TABLE_HEAD_CREATOR', name: 'creator', flex: '20', canSort: true,
                show: true
            },
            {
                text: 'notes.TABLE_HEAD_CATEGORY',
                name: 'category',
                flex: '15',
                // canSort: true,
                show: (ctrl.category === 0)
            },
            {
                text: 'notes.TABLE_HEAD_TITLE', name: 'title', flex: 'auto', canSort: true,
                show: true
            },
            {
                text: 'notes.TABLE_HEAD_CONTENTS', name: 'contents', flex: '15', canSort: false,
                show: true
            }
        ];
    }

    function sortBy(columnName) {
        if (!ctrl.selectedColumn.sortDesc) {
            ctrl.selectedColumn.sortDesc = true;
            ctrl.selectedColumn.name = columnName;
        } else {
            if (ctrl.selectedColumn.name === columnName) {
                if (ctrl.selectedColumn.sortDesc) {
                    ctrl.selectedColumn.sortDesc = false;
                } else {
                    ctrl.selectedColumn.sortDesc = true;
                }
            } else {
                ctrl.selectedColumn.name = columnName;
                ctrl.selectedColumn.sortDesc = true;
            }
        }
        ctrl.fecNoteCategoriesList.sortTable(ctrl.selectedColumn);
    }
}

export default NoteCategoriesListHead;
