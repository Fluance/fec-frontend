import template from './dataPagingSort.component.html';

const fecDataPagerSort = {
        bindings: {
            filterCriteria: '<',
            selectedFilterCriteria: '=',
            sortCriteria: '<',
            selectedSortCriteria: '=',
            sortDirections: '<',
            selectedSortDirection: '=',
            onChanged: '&?'
        },
        controller: ['$scope', controller],
        controllerAs: 'vm',
        templateUrl: template
};

function controller($scope) {
    var deregisterWatchGroup;

    /*jshint validthis: true */
    var vm = this;

    vm.$onInit = onInit;
    vm.$onDestroy = onDestroy;
    vm.toggleSortDirection = toggleSortDirection;
    return vm;

    function toggleSortDirection () {
        if (vm.selectedSortDirection === 'asc') {
            vm.selectedSortDirection = 'desc';
        } else if (vm.selectedSortDirection === 'desc') {
            vm.selectedSortDirection = 'asc';
        }
    }

    // ------------------------------------------------------------------------ Lifecycle-hooks

    function onInit() {
        //Set default value on the init method
        vm.sortDirections = vm.sortDirections || [
            {key: 'asc', name: 'core.SORT_ASC', icon: 'sortAscending'},
            {key: 'desc', name: 'core.SORT_DESC', icon: 'sortDescending'}
        ];

        deregisterWatchGroup = $scope.$watchGroup(['vm.selectedFilterCriteria', 'vm.selectedSortCriteria', 'vm.selectedSortDirection'], onPropertyChanged);
    }

    function onDestroy() {
        if (deregisterWatchGroup) { deregisterWatchGroup(); }
    }

    function onPropertyChanged(newValue, oldValue) {
        var hasChanges = _.some(newValue, function (item, index) { return item !== oldValue[index]; });
        if (hasChanges && _.isFunction(vm.onChanged)) { vm.onChanged(); }
    }
}

export default fecDataPagerSort;
