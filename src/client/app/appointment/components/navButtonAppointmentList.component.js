const NavButtonAppointmentList = {
    bindings: {
        pid: '<',
        isEnabled: '<?'
    },
    controller: ['$q', 'dataservice.appointments', controller],
    template: '<fec-nav-button text="{{\'appointment.TITLE_LIST\' | translate}}" state="appointmentList" state-params="{pid:$ctrl.pid}" can-navigate="$ctrl.canNavigate()" is-enabled="$ctrl.isEnabled" />'
};

function controller($q, dataserviceAppointments) {
    /*jshint validthis: true */
    var vm = this;
    vm.canNavigate = function() {
        if (this.pid) {
            var params = {
                pid: this.pid
            };
            return dataserviceAppointments.hasAppointmentData(params)
                .then(function(result) {
                    return result;
                });
        }
        else {
            return $q.resolve(false);
        }
    };
}

export default NavButtonAppointmentList;
