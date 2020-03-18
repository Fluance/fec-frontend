import template from './noteCategoryListSelection.component.html';

const NoteCategoriesListSelection = {
    bindings: {
        categories: '=',
        category: '=',
        isLoading: '=',
        onChange: '='
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

export default NoteCategoriesListSelection;
