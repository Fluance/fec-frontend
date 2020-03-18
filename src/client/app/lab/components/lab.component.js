// jscs:disable requireParenthesesAroundIIFE
import _ from 'lodash';
import template from './lab.component.html';

const Lab = {
    templateUrl: template,
    controller: controller
};

controller.$inject = [
    '$rootScope',
    '$stateParams',
    'dataservice.lab',
    'waitForRendering',
    'LabService'
];

/* @ngInject */
function controller(
    $rootScope,
    $stateParams,
    dataServiceLab,
    waitForRendering,
    labService
) {
    /*jshint validthis: true */
    var ctrl = this;

    ctrl.NUMERICAL_MEASURE = 'NM';

    ctrl.$onInit = _onInit;

    // Initial tab & icons
    ctrl.selectedTab = 'text';
    ctrl.tabIconTable = null;
    ctrl.tabIconText = null;

    ctrl.activateTab = activateTab;


    // --------------------------------------------------------------------

    function _onInit() {
        ctrl.pid = $stateParams.pid;

        ctrl.hasLabData = true;
        ctrl.isLoading = true;

        // Selection reveal
        ctrl.categorySelection = {
            title: 'lab.CHANGE_CATEGORY_TITLE',
            items: [],
            selectedItem: undefined,
            selectedItemChanged: onSelectedItemChanged,
            getItemDisplayName: function (item) {
                return item.name;
            }
        };

        waitForRendering.wait(function () {
            checkHasLabData();
            ctrl.isLoading = false;
        });
    }

    // Change the current selected item
    function onSelectedItemChanged(item) {
        ctrl.categorySelection.selectedItem = item;
        _loadCategoryDatas(item.name)
            .then(function(labDataByCategory) {
                ctrl.labDataByCategory = labDataByCategory;

                // Load data for table
                if (ctrl.labDataByCategory.table.data.length >= 1) {
                    $rootScope.$broadcast(labService.EVENT_LAB_TABLE_CHANGED, labDataByCategory.table);
                    ctrl.selectedTab = 'table';
                } else {
                    ctrl.selectedTab = 'text';
                }
            })
            .catch(function(error) {
               console.error(error);
            });
    }

    function activateTab(tab) {
        ctrl.selectedTab = tab;
    }

    // Load the datas for the given category
    function _loadCategoryDatas(categoryName) {
        return labService.getLabDataByCategory(ctrl.pid, categoryName);
    }

    // Load the lab categories
    function _loadCategories() {
        dataServiceLab.getLabCategories(ctrl.pid).then(function (categories) {
            if (_.isArray(categories) && categories.length > 0) {
                categories = _.orderBy(categories, 'name', 'asc');
            }
            ctrl.categorySelection.items = categories;
            onSelectedItemChanged(categories[0]);
        })
        .catch(function(error) {
            console.error(error);
        });
    }

    function checkHasLabData() {
        dataServiceLab.hasLabData(ctrl.pid)
            .then(function (result) {
                ctrl.hasLabData = result;
            })
            .catch(function () {
                ctrl.hasLabData = false;
            })
            .finally(function () {
                if (ctrl.hasLabData) {
                    _loadCategories();
                }
            });
    }
}

export default Lab;
