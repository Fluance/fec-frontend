const fecProductivityVcard = {
    bindings: {
        url: '<',
        firstName: '<',
        lastName: '<'
    },
    controller: ['$element', 'productivityService', controller],
    template: '<fec-productivity-widget url="$ctrl.url" filename="$ctrl.filename" icon-type="$ctrl.ICON_VCARD"></fec-productivity-widget>'
};

function controller($element, productivityService) {
    /*jshint validthis: true */
    var ctrl = this;

    var FILE_PREFIX = 'contact';
    var FILE_EXTENSION = 'vcf';

    // Remove tag if Productivity Tie-Ins feature is not activated
    if (!productivityService.isActive()) {
        $element.remove();
    }
    else {
        // events
        ctrl.$onInit = onInit;
        ctrl.$onChanges = onChanges;
    }

    // ------------------------------------------------------------------- Events

    function onInit() {
        ctrl.ICON_VCARD = 'contact';
    }

    function onChanges(object) {
        ctrl.filename = FILE_PREFIX + '-' + ctrl.lastName + '-' + ctrl.firstName + '.' + FILE_EXTENSION;
    }
}

export default fecProductivityVcard;


