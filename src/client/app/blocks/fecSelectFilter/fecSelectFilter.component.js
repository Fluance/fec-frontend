import template from './fecSelectFilter.component.html';

const fecSelectFilter = {
    bindings: {
        filterId: '=',
        filterLabel: '@',
        filterModel: '=',
        filterOptions: '=',
        filterApply: '&'
    },
    controller: ['$q', controller],
    controllerAs: 'vm',
    templateUrl: template
};

function controller($q) {
    var vm = this;

    vm.filterChanged = filterChanged;

    function filterChanged() {
        vm.filterApply()(vm.filterId, vm.filterModel);
    }

    return vm;

    // ------------------------------------------------------------------------- Event handling
}

export default fecSelectFilter;

