
// desktop_mac, desktop_windows
// tablet_mac, tablet, tablet_android
// phone_iphone, phone_android, smartphone
const iconDeviceType = {
    bindings: {
        fecDeviceType: '<'
    },
    controller: controller,
    template: '<md-icon md-font-icon="{{::$ctrl.deviceTypeInfo.icon}}"><md-tooltip md-autohide="true">{{::$ctrl.deviceTypeInfo.tooltip}}</md-tooltop></md-icon>'
};

function controller() {
    var vm = this;

    // os => osInfo
    var mappings = {
        mobile: {icon: 'fa fa-mobile', tooltip: 'mobile' },
        tablet: {icon: 'fa fa-tablet', tooltip: 'tablet' },
        desktop: {icon: 'fa fa-desktop', tooltip: 'desktop' },
        unknown: {icon: 'fa fa-unknown', tooltip: 'unknown' }
    };

    vm.$onInit = onInit;

    // ------------------------------------------------------------------------ Lifecycle-hooks

    function onInit() {
        vm.fecDeviceType = vm.fecDeviceType || 'unknown';
        vm.deviceTypeInfo = mappings[vm.fecDeviceType] || mappings['unknown'];
    }

}

export default iconDeviceType;
