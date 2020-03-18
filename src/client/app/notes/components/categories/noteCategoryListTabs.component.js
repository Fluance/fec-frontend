import template from './noteCategoryListTabs.component.html';

const NoteCategoriesListTabs = {
    bindings: {
        currentTab: '<',
        changeTab: '<'
    },
    controller: ['$translate', '$scope', controller],
    templateUrl: template
};

function controller($translate, $scope) {

    var ctrl = this;
    ctrl.$onInit = onInit;

    function onInit() {
    }
}

export default NoteCategoriesListTabs;
