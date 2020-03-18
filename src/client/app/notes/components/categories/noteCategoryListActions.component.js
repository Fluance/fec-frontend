import template from './noteCategoryListActions.component.html';

const NoteCategoriesListActions = {
    bindings: {
        pid: '<',
        vnb: '<',
        hasNotesToRestore: '<',
        totalRecords: '<',
        isAllNotes: '<',
        markReadAll: '<',
        markUnreadAll: '<',
        isMobileView: '<',
        categoryId: '<?'
    },
    controller: ['$translate', '$scope', 'sessionService', 'config', controller],
    templateUrl: template
};

function controller($translate, $scope, session, config) {

    var ctrl = this;
    ctrl.$onInit = onInit;
    ctrl.iconSize = ctrl.isMobileView ? 'xs' : 'sm';
    ctrl.editionEnabled = editionEnabled;

    function onInit() {
    }

    function editionEnabled() {
        return !session.user.hasRole(config.accessControl.navigationComponents.fecNoteCategoryListActions.editonDisabledForRoles);
    }
}

export default NoteCategoriesListActions;
