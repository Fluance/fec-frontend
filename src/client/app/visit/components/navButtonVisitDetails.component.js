
const NavButtonVisitDetails = {
    bindings: {
        vnb: '<',
        state: '@?',
        isEnabled: '<?',
        navName: '@?'
    },
    controller: [
        controller],
    template: '<fec-nav-button text="{{\'visit.VISIT_DET\' | translate}}" state="{{$ctrl.state}}" state-params="{vnb:$ctrl.vnb}" can-navigate="$ctrl.canNavigate()" is-enabled="$ctrl.isEnabled" nav-name="{{$ctrl.navName}}" />'
};

function controller() {

    var ctrl = this;

    ctrl.$onInit = onInit;
    ctrl.canNavigate = canNavigate;

    // -------------------------------------------------------

    function onInit() {
        ctrl.state = (!_.isUndefined(ctrl.state)) ? ctrl.state : 'details';
    }

    function canNavigate() {
        if (!ctrl.vnb) return $q.resolve(false);

        return true;

    }

}

export default NavButtonVisitDetails;
