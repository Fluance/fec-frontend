import template from './settings-usersettings.component.html';

const SettingsUserSettings = {
    templateUrl: template,
    controller: controller,
    bindings: {}
};

controller.$inject = [
    '$translate',
    'logger',
    'sessionService',
    //'tutorialService',
    'dashboardFactory'
];

function controller($translate, logger, session, fluanceDashboard) {
    /*jshint validthis: true */
    var ctrl = this;

    // Functions for the UI sorted by name
    ctrl.resetTutorials = resetTutorials;
    ctrl.resetDashboardLayout = resetDashboardLayout;
    ctrl.isActiveTutorial = isActiveTutorial;

    function resetDashboardLayout() {
        if (session.user) {
            session.user.resetDashboardLayout()
                .then(function () {
                    fluanceDashboard.reinitialize();
                });
            $translate('settings.CLEAR_DASHBOARD_LAYOUT_MSG_SUCCESS').then(function (translation) {
                logger.info(translation);
            });
        }
    }

    function resetTutorials() {
        /*
        if (session.user) {
            session.user.resetTutorials()
                .then(function () {
                    tutorialService.notifyOnTutorialsChanged();
                });
            $translate('settings.CLEAR_TUTORIALS_MSG_SUCCESS').then(function (translation) {
                logger.info(translation);
            });
        }*/
    }

    function isActiveTutorial() {
        //return tutorialService.isActive();
        return false;
    }
}

export default SettingsUserSettings;
