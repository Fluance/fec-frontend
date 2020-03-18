import _ from 'lodash';

const NavButtonInvoiceList = {
    bindings: {
        vnb: '<',
        guarantorId: '<?',
        isEnabled: '<?'
    },
    controller: ['$q', 'dataservice.invoices', controller],
    template: '<fec-nav-button text="{{\'invoice.TITLE_LIST\' | translate}}" state="{{$ctrl.state}}" state-params="$ctrl.stateParams" can-navigate="$ctrl.canNavigate()" is-enabled="$ctrl.isEnabled" />'
};

function controller($q, dataserviceInvoices) {
    /*jshint validthis: true */
    var vm = this;

    // events
    vm.$onInit = onInit;
    // interface
    vm.canNavigate = canNavigate;

    // ----------------------------------- events

    function onInit() {
        if (_.isUndefined(vm.guarantorId)) {
            vm.state = 'invoiceListByVisit';
            vm.stateParams = { vnb: vm.vnb };
        } else {
            vm.state = 'invoiceListByGuarantor';
            vm.stateParams = { vnb: vm.vnb, guarantorid: vm.guarantorId };
        }
    }

    // ----------------------------------- interface

    function canNavigate() {
        if (vm.guarantorId && !_.isNumber(vm.guarantorId)) {
            vm.guarantorId = parseInt(vm.guarantorId);
        }
        return (vm.vnb && vm.guarantorId) ? dataserviceInvoices.hasInvoiceData(vm.vnb, vm.guarantorId) : $q.resolve(false);
    }
}

export default NavButtonInvoiceList;
