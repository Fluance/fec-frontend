
const NavButtonIcdChopList = {
    bindings: {
        vnb: '<',
        state: '@?',
        isEnabled: '<?',
        navName: '@?'
    },
    controller: [
        '$q',
        'dataservice.icd',
        'dataservice.interventions',
        'dataservice.chop',
        controller],
    template: '<fec-nav-button text="{{\'icdChop.TITLE_LIST\' | translate}}" state="{{$ctrl.state}}" state-params="{vnb:$ctrl.vnb}" can-navigate="$ctrl.canNavigate()" is-enabled="$ctrl.isEnabled" nav-name="{{$ctrl.navName}}" />'
};

function controller(
    $q,
    dataserviceICD,
    dataserviceInterventions,
    dataserviceCHOP) {

    var ctrl = this;

    ctrl.$onInit = onInit;
    ctrl.canNavigate = canNavigate;

    // -------------------------------------------------------

    function onInit() {
        ctrl.state = (!_.isUndefined(ctrl.state)) ? ctrl.state : 'icdChopList';
    }

    function canNavigate() {
        if (!ctrl.vnb) return $q.resolve(false);

        return $q
            .all([
                dataserviceICD.hasDiagnosisData(ctrl.vnb),
                dataserviceCHOP.hasTreatmentData(ctrl.vnb),
                dataserviceInterventions.hasInterventionData(ctrl.vnb)
            ])
            .then(function (results) {
                return results[0] || results[1] || results[2];
            });

    }

}

export default NavButtonIcdChopList;
