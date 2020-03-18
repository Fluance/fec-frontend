import template from './settings-profile.component.html';

const SettingsProfile = {
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

    // events
    ctrl.$onInit = onInit;
    // interface
    // Functions for the UI sorted by name
    ctrl.hasEmails = hasEmails;
    ctrl.hasTelephons = hasTelephons;

    // ---------------------------------------------------- Event methods

    function onInit() {
        ctrl.user = session.user;

        // Sort the vm.user.roles in the vm.rolesSort
        ctrl.rolesSort = null;
        _setRolesSort();
    }

    // ---------------------------------------------------- Interface methods

    function hasEmails() {
        return (ctrl.user && ctrl.user.emails && ctrl.user.emails.length > 0);
    }

    function hasTelephons() {
        return (ctrl.user && ctrl.user.telephons && ctrl.user.telephons.length > 0);
    }

    function _setRolesSort() {
        if (session.user && session.user.roles) {
            ctrl.rolesSort = session.user.roles.sort();
        }
    }
}


export default SettingsProfile;
