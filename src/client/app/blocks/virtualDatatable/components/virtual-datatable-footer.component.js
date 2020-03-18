import template from './virtual-datatable-footer.component.html';

const virtualDatatableFooter = {
    bindings: {
        topIndex: '<',
        numItems: '<',
        footerLabelCode: '<',
        virtualRepeatCurrentIndex: '&'
    },
    controller: ['$translate', controller],
    templateUrl: template
};

function controller($translate) {
    var ctrl = this;

    ctrl.$onInit = onInit;
    ctrl.translate = translate;

    // ------------------------------------------------------------

    function onInit() {
        ctrl.topIndex = ctrl.topIndex ? ctrl.topIndex : 1;
    }

    function translate(code) {
        return $translate.instant(code);
    }
}


export default virtualDatatableFooter;
