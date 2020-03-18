import template from './logoutDialog.component.html';

const logoutDialog = {
    bindings: {
        openSessionList: '<',
        isDeviceLogoutEnabled: '<',
        onClose: '&',
        onLogout: '&'
    },
    controller: [controller],
    templateUrl: template
};

function controller() {
    var vm = this;

    vm.closeLogoutDialog = closeLogoutDialog;
    vm.userLogout = userLogout;

    // -----------------------------------------------------------------

    function closeLogoutDialog() {
        vm.onClose();
    }

    function userLogout() {
        vm.onLogout();
    }
}

export default logoutDialog;


