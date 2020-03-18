
const NavButtonImagingList = {
    bindings: {
        pid: '<',
        isEnabled: '<?'
    },
    controller: ['$q', 'dataservice.imaging', controller],
    template: '<fec-nav-button ' +
    'text="{{\'imaging.TITLE_LIST\' | translate}}" ' +
    'state="imagingList" ' +
    'state-params="{pid:$ctrl.pid}" ' +
    'can-navigate="$ctrl.canNavigate()" ' +
    'is-enabled="$ctrl.isEnabled" />'
};

function controller($q, dataserviceImaging) {
    /*jshint validthis: true */
    var vm = this;
    vm.canNavigate = function () {
        return (vm.pid) ?
            // Calls both imaging and report counts MW-API methods
            $q.all([dataserviceImaging.hasImagingData(vm.pid), dataserviceImaging.hasReportData(vm.pid)])
                .then(function (results) {
                    // If one of them returns true, we resolve at true,
                    if (results[0] || results[1]) {
                        return true;
                    }

                    $q.resolve(false);
                })
            :
            // No PID ? Then resolve at false
            $q.resolve(false);
    };
}

export default NavButtonImagingList;
