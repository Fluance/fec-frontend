const iconOs = {
    bindings: {
        fecOs: '<'
    },
    controller: controller,
    template: '<md-icon md-font-icon="{{::$ctrl.osInfo.icon}}"><md-tooltip md-autohide="true">{{::$ctrl.osInfo.tooltip}}</md-tooltop></md-icon>'
};

function controller() {
    var vm = this;

    // os => osInfo
    var mappings = {
        macos: {icon: 'fa fa-apple', tooltip: 'apple' },
        windows: {icon: 'fa fa-windows', tooltip: 'windows' },
        linux: {icon: 'fa fa-linux', tooltip: 'linux' },
        android: {icon: 'fa fa-android', tooltip: 'android' },
        ios: {icon: 'fa fa-apple', tooltip: 'apple'},
        unknown: {icon: 'fa fa-unknown', tooltip: 'unknown' }
    };

    vm.$onInit = onInit;

    // ------------------------------------------------------------------------ Lifecycle-hooks

    function onInit() {
        vm.fecOs = vm.fecOs || 'unknown';
        vm.osInfo = mappings[vm.fecOs] || mappings['unknown'];
    }

}


export default iconOs;

