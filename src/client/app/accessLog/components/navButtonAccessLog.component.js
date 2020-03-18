const NavButtonAccessLog = {
    bindings: {
        pid: '<',
        isEnabled: '<?'
    },
    controller: ['$q', 'dataservice.accessLogs', controller],
    controllerAs: 'vm',
    template: '<fec-nav-button text="{{\'accessLog.TITLE_LIST\' | translate}}" state="patientAccessLogs" state-params="{pid:vm.pid}" can-navigate="vm.canNavigate()" is-enabled="vm.isEnabled" />'
};

function controller($q, dataserviceAccessLogs) {
    var vm = this;
    vm.canNavigate = function () {
        return (vm.pid) ? dataserviceAccessLogs.hasAccessLogData(vm.pid) : $q.resolve(false);
    };
}

export default NavButtonAccessLog;
