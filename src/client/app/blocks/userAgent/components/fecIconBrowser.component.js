const iconBrowser = {
    bindings: {
        fecBrowser: '<'
    },
    controller: controller,
    template: '<md-icon md-font-icon="{{::$ctrl.browserInfo.icon}}"><md-tooltip md-autohide="true">{{::$ctrl.browserInfo.tooltip}}</md-tooltop></md-icon>'
};

function controller() {
    var vm = this;

    // os => osInfo
    var mappings = {
        chrome: {icon: 'fa fa-chrome', tooltip: 'chrome' },
        safari: {icon: 'fa fa-safari', tooltip: 'safari' },
        firefox: {icon: 'fa fa-firefox', tooltip: 'firefox' },
        ie: {icon: 'fa fa-internet-explorer', tooltip: 'ie' },
        unknown: {icon: 'fa fa-unknown', tooltip: 'unknown' }
    };

    vm.$onInit = onInit;

    // ------------------------------------------------------------------------ Lifecycle-hooks

    function onInit() {
        vm.fecBrowser = vm.fecBrowser || 'unknown';
        vm.browserInfo = mappings[vm.fecBrowser] || mappings['unknown'];
    }

}

export default iconBrowser;

