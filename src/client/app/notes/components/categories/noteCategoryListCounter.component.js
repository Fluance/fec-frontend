import template from './noteCategoryListCounter.component.html';

const NoteCategoriesListCounter = {
    bindings: {
        totalRecords: '<',
        isAllNotes: '<',
        unreadRecords: '<'
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

export default NoteCategoriesListCounter;
