import template from './search.query.component.html';

const SearchQuery = {
    bindings: {
        query: '<',
        userInteraction: '<?',
        delegate: '<?',
        navigateOnClick: '<?',
        mode: '@?'
    },
    controller: ['$rootScope', 'searchQueryService', controller],
    controllerAs: 'vm',
    templateUrl: template
};

function controller(
    $rootScope,
    searchQueryService
) {
    var vm = this;

    // events
    vm.$onInit = onInit;
    // interface
    vm.shouldRemoveCriterion = shouldRemoveCriterion;
    vm.launchRequest = launchRequest;
    vm.canShowIcon = canShowIcon;
    vm.canShowName = canShowName;

    // -------------------------------------- Event methods

    function onInit() {
        vm.navigateOnClick = _.isUndefined(vm.navigateOnClick) ? true : vm.navigateOnClick;
        vm.userInteraction = _.isUndefined(vm.userInteraction) ? true : vm.userInteraction;
        vm.removeCriterion = removeCriterion;

        vm.criteria = function () {
            return (_.isObject(vm.query)) ? vm.query.getCriteria() : [];
        };

        vm.fullname = _.find(vm.criteria(), {key: 'name'}) &&
            _.find(vm.criteria(), {key: 'firstname'});
    }

    // -------------------------------------- Interface methods

    function canShowIcon(criterion) {
        var noIconCriteria = ['firstname', 'maidenname'];
        return !(vm.fullname && _.includes(noIconCriteria, criterion.key));
    }

    function canShowName(criterion) {
        var noIconCriteria = ['maidenname'];
        return !(_.includes(noIconCriteria, criterion.key));
    }

    // ---------------------------------------------------- fecSearchCriterion delegate methods
    function shouldRemoveCriterion(aCriterion) {
        if (!vm.userInteraction) {
            return false;
        }
        if (!aCriterion.isOptional) {
            return false;
        }
        if (!aCriterion.isRemovable) {
            return false;
        }
        return true;
    }

    function removeCriterion(aCriterion) {
        vm.query.removeCriterion(aCriterion);
        if (!_.isUndefined(vm.delegate)) {
            vm.delegate.queryHasChanged(vm.query);
        }
        $rootScope.$broadcast('searchCriteriaRemoved');
    }

    function launchRequest() {
        if (vm.navigateOnClick) {
            searchQueryService.performNavigation(vm.query);
        }
    }
}

export default SearchQuery;
