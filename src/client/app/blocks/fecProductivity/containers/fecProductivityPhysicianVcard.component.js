
const fecProductivityPhysicianVcard = {
    bindings: {
        physicianId: '<',
        firstName: '<',
        lastName: '<'
    },
    controller: controller,
    template: '<fec-productivity-vcard url="$ctrl.url" first-name="$ctrl.firstName" last-name="$ctrl.lastName"></fec-productivity-vcard>'
};

controller.$inject = [
    '$element',
    'dataservice.productivity',
    'productivityService'
];

function controller($element, productivityDataservice, productivityService) {
    /*jshint validthis: true */
    var ctrl = this;

    // Remove tag if Productivity Tie-Ins feature is not activated
    if (!productivityService.isActive()) {
        $element.remove();
    }
    else {
        ctrl.$onInit = onInit;
    }

    // --------------------------------------------------------------- Events

    function onInit() {
        ctrl.url = productivityDataservice.getPhysicianVCardUrl(ctrl.physicianId);
    }
}

export default fecProductivityPhysicianVcard;

