

PolicyController.$inject = [
    '$stateParams',
    'dataservice.visits'
    //'tutorialService',
    //'LayoutPatientContextBox'
];

function PolicyController($stateParams, dataServiceVisits) {
    var vm = this;

    vm.title = 'PolicyController';
    vm.vnb = $stateParams.vnb;
    vm.guarantorid = $stateParams.gid;
    vm.priority = $stateParams.priority;
    vm.subpriority = $stateParams.subpriority;

    vm.policyDetails = null;
    vm.isExpanded = true;

    activate();

    function activate() {
        getPolicy(vm.vnb, vm.guarantorid, vm.priority, vm.subpriority);

        /*
        if (tutorialService.isActive()) {
            // Configure tutorials
            configureTutorial();
            tutorialService.current(vm.title);
        }*/
    }

    function getPolicy(visitNb, guarantorId, priority, subPriority) {

        var params = {
            visitnb: visitNb,
            guarantorid: guarantorId,
            priority: priority,
            subpriority: subPriority
        };

        return dataServiceVisits
            .getPolicy(params)
            .then(function(result) {
                vm.policyDetails = result;
                vm.policyDetails.vnb = visitNb;
            })
            .catch(function(exception) {
                if (exception.status === 404) {
                    vm.policyDetails = null;
                    vm.isEmpty = true;
                }
            });
    }

    function configureTutorial() {
        var contextBoxSteps = ContextBox.getTutorialSteps();
        var steps = [{
            element: '#btn-policy-area',
            introKey: 'policy.GUIDE_POLICIES_AREA',
            position: 'floating'
        }];

        tutorialService.setSteps(vm.title, 0, contextBoxSteps.concat(steps));
    }
}

export default PolicyController;
