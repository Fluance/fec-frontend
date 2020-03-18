import template from './fecUserAgentBar.component.html';

const userAgentBar = {
    bindings: {
        userAgent: '<'
    },
    controller: controller,
    templateUrl: template
};

controller.$inject = ['userAgentService'];
function controller(userAgentService) {
    var vm = this;

    vm.$onInit = onInit;

    // ------------------------------------------------
    function onInit() {
        vm.os = userAgentService.getOS(vm.userAgent);
        vm.deviceType = userAgentService.getDeviceType(vm.userAgent);
        vm.browser = userAgentService.getBrowser(vm.userAgent);
    }
}


export default userAgentBar;
