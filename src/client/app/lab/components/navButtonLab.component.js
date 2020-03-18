
const NavButtonLab = {
    bindings: {
        pid: '<',
        isEnabled: '<?'
    },
    controller: ['$q', 'dataservice.lab', controller],
    template: '<fec-nav-button text="{{\'lab.TITLE_SHORT\' | translate}}" state="labList" state-params="{pid:$ctrl.pid}" is-enabled="$ctrl.isEnabled" />'
};

function controller($q, dataserviceLab) {
    /*jshint validthis: true */
    var vm = this;
    vm.canNavigate = function () {
        return (vm.pid) ? dataserviceLab.hasLabData(vm.pid) : $q.resolve(false);
    };
}

export default  NavButtonLab;
