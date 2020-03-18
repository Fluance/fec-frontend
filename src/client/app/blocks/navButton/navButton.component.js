import template from './navButton.component.html';

const navButton = {
    bindings: {
        text: '@',
        state: '@',
        stateParams: '<',
        isEnabled: '<?',
        canNavigate: '&?',
        navName: '@?'
    },
    controller: ['$scope', '$state', '$q', '$element', controller],
    controllerAs: 'vm',
    templateUrl: template
};

function controller($scope, $state, $q, $element) {
    /*jshint validthis: true */
    var vm = this;
    vm.isBusy = false;
    vm.canNavigateResult = false;
    vm.navigateTo = navigateTo;

    vm.$onInit = onInit;
    vm.$onChanges = onChanges;

    // ------------------------------------------------------------------------ Lifecycle-hooks

    function onInit() {
        if (!_.isBoolean(vm.isEnabled)) { vm.isEnabled = true; }
        canNavigate();
    }

    function onChanges(changesObj) {
        if (changesObj.isEnabled) {
            canNavigate();
        }
    }

    // ------------------------------------------------------------------------- Public methods

    function navigateTo() {
        // emit event before navigation
        $scope.$emit('beforeNavigate', {element: $element, scope: $scope, navName: vm.navName, state: vm.state, stateParams: vm.stateParams});

        // navigate
        $state.go(vm.state, vm.stateParams);
    }

    // ------------------------------------------------------------------------- Helper methods

    function canNavigate() {
        if (vm.isEnabled !== true) { return; }

        var fnCanNavigate = (_.isFunction(vm.canNavigate)) ? vm.canNavigate() : true;

        vm.isBusy = true;
        $q.resolve(fnCanNavigate)
            .then(function(result) {
                vm.canNavigateResult = result;
            })
            .finally(function() {
                vm.isBusy = false;
            });
    }
}


export default navButton;


