const Guarantors = {
    bindings: {
        vnb: '<'
    },
    controller: controller,
    template: '<div layout="column" flex="auto">' +
    '<fec-guarantors-list vnb="$ctrl.vnb" flex="auto"></fec-guarantors-list>' +
    '<span layout-padding></span>' +
    '<fec-policies-list vnb="$ctrl.vnb" flex="auto"></fec-policies-list>' +
    '</div>'
};

controller.$inject = ['$stateParams'];

function controller($stateParams) {
    var ctrl = this;
    ctrl.$onInit = onInit;

    // --------------------------------------- Events

    function onInit() {
        ctrl.vnb = $stateParams.vnb;
    }
}

export default Guarantors;
