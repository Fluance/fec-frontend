// jscs:disable requireParenthesesAroundIIFE


ServiceFeeController.$inject = ['$stateParams',
    'dataservice.servicefees',
    //'LayoutPatientContextBox',
    //'tutorialService',
    'sessionService'
];

function ServiceFeeController($stateParams, dataserviceBenefits, session) {
    /*jshint validthis: true */
    var vm = this;
    vm.title = 'ServiceFeeController';
    var bid = $stateParams.bid;
    vm.result = null;

    var lang = session.getUILanguage();

    activate();

    function activate() {
        getBenefitDetails(bid);

        /*
        if (tutorialService.isActive()) {
            // Configure tutorials
            configureTutorial();
            tutorialService.current(vm.title);
        }*/
    }

    function getBenefitDetails(benefitId, lang) {

        return dataserviceBenefits
            .getServiceFeeDetails(benefitId, lang)
            .then(function(details) {
                //for the single item view the details are loaded (comprising header and detail data), but the directive has data bindings to the header variables.
                //These are loaded as "benefit", as opposed to "details"
                vm.result = {
                    bid: benefitId,
                    details: details, // expected when viewing benefit details -> expanded
                    benefit: details, // expected when viewing list of benefits -> collapsed
                    isExpanded: true
                };
            });
    }

    function configureTutorial() {
        var contextBoxSteps = ContextBox.getTutorialSteps();
        var steps = [{
            element: '.expander',
            introKey: 'servicefee.GUIDE_BENEFITS_RESULT',
            position: 'bottom-middle-aligned'
        }];

        tutorialService.setSteps(vm.title, 0, contextBoxSteps.concat(steps));
    }

    function onStateChanged() {
        $scope.$emit('benefit.stateChanged', {
            vnb: vm.result.visit.visitInfo.number,
            isExpanded: vm.result.isExpanded,
            hasDetails: angular.isObject(vm.result.details)
        });
    }
}

export default ServiceFeeController;
