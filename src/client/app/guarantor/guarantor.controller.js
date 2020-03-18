// jscs:disable requireParenthesesAroundIIFE

GuarantorController.$inject = ['$stateParams',
    '$timeout',
    'dataservice.guarantors',
    'logger',
    '$translate',
    //'LayoutPatientContextBox',
    //'tutorialService',
    '$filter'
];

function GuarantorController($stateParams, $timeout, dataserviceGuarantor, logger,
    $translate, $filter) {
    /*jshint validthis: true */
    var vm = this;
    vm.title = 'GuarantorController';
    vm.vnb = $stateParams.vnb;
    vm.gid = $stateParams.gid;

    // Populate our scope (as vm)
    $.extend(vm, {
        singleResultSearch: false, // Is single result page
        isComplete: false,
        isEmpty: false
    });

    vm.result = null; // need to be initialized at null for IHM

    activate();

    function activate() {
        getGuarantor(vm.gid, vm.vnb);
        /*
        if (tutorialService.isActive()) {
            // Configure tutorials
            configureTutorial();
        }*/
    }

    function getGuarantor(guarantorId, visitId) {
        return dataserviceGuarantor
            .getGuarantorDetails(visitId, guarantorId)
            .then(function(result) {
                result.guarantor_id = vm.gid;
                vm.result = {
                    vnb: vm.vnb,
                    guarantor: result,
                    isExpanded: false
                };
            });
    }

    function configureTutorial() {
        var contextBoxSteps = ContextBox.getTutorialSteps();
        var steps = [{
            element: '#btn-guarantors-result',
            introKey: 'guarantor.GUIDE_GUARANTOR_RESULT',
            position: 'floating'
        }, {
            element: '#btn-contactus',
            introKey: 'guarantor.GUIDE_CONTACT_US',
            position: 'top-right-aligned'
        }, {
            element: '.active fec-nav-button-invoice-list',
            // element: 'fec-nav-button-invoice-list',
            introKey: 'guarantor.GUIDE_GUARANTORS_INVOICES',
            position: 'top-middle-aligned'
        }];

        tutorialService.setSteps(vm.title, 0, contextBoxSteps.concat(steps));
    }
}

export default GuarantorController;
