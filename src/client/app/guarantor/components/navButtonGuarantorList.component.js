import _ from 'lodash';

const NavButtonGuarantorList = {
    bindings: {
        vnb: '<',
        isEnabled: '<?',
        state: '@?',
        navName: '@?'
    },
    controller: [controller],
    template: '<fec-nav-button text="{{\'guarantor.TITLE_LIST\' | translate}}" state="{{$ctrl.state}}" state-params="{vnb: $ctrl.vnb}" is-enabled="$ctrl.isEnabled" nav-name="{{$ctrl.navName}}"/>'
};


function controller() {
    /*jshint validthis: true */
    var ctrl = this;

    ctrl.$onInit = onInit;

    // ------------------------------------------------------------------------------------

    function onInit() {
        ctrl.state = (!_.isUndefined(ctrl.state)) ? ctrl.state : 'guarantorList';
    }
}


export default NavButtonGuarantorList;
