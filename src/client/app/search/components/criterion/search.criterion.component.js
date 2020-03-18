import template from './search.criterion.component.html';

const SearchCriterion = {
    controller: [searchCriterionController],
    bindings: {
        criterion: '<',
        userInteraction: '<?',
        delegate: '<?',
        isIconVisible: '<?',
        isNameVisible: '<?',
        mode: '@?'
    },
    templateUrl: template
};

function searchCriterionController() {
    var vm = this;

    // events
    vm.$onInit = onInit;
    // interface
    vm.getIconName = getIconName;
    vm.clickOnCriterion = clickOnCriterion;

    // --------------------------------------------------------------- Event methods

    function onInit() {
        vm.userInteraction = _.isUndefined(vm.userInteraction) ? true : vm.userInteraction;
        var criterionKey = vm.criterion.key;
        var criterionValue = vm.criterion.value;
        var displayTransformation = vm.criterion.displayTransformation;

        // Default case
        vm.displayName = criterionKey;

        // We rely on a promise now to get a "display" value, because some of them are retrieve asynchronously from data services (i.e. Clinics name).
        var getDisplayValuePromise = vm.criterion.getDisplayValue();

        getDisplayValuePromise
            .then(function (valueToDisplay) {
                vm.displayValue = valueToDisplay;
            });

        // If it's available, apply the displaying transformation
        if (!!displayTransformation) {
            vm.displayName = _.isUndefined(displayTransformation.keyTransformation) ? criterionKey : displayTransformation.keyTransformation(criterionKey);
        }
    }

    // --------------------------------------------------------------- Interface implementation

    function clickOnCriterion() {
        if (_.isUndefined(vm.delegate)) {
            return;
        }
        if (vm.delegate.shouldRemoveCriterion(vm.criterion)) {
            vm.delegate.removeCriterion(vm.criterion);
        }
    }

    function getIconName() {
        var iconName;
        if (vm.criterion) {
            switch (vm.criterion.key) {
                case 'name':
                case 'firstname':
                    iconName = 'patient';
                    break;
                case 'birthdate': iconName = 'birthdate'; break;
                case 'admissionstatus': iconName = 'filter'; break;
                case 'pid': iconName = 'patientId'; break;
                case 'vnb': iconName = 'visit'; break;
                case 'companyid': iconName = 'clinic'; break;
                case 'hospservice': iconName = 'service'; break;
                case 'patientunit': iconName = 'unit'; break;
                case 'patientroom': iconName = 'door'; break;
                case 'patientbed': iconName = 'bed'; break;
                case 'admitdt': iconName = 'calendarClock'; break;
                case 'field': iconName = 'search'; break;
                default: iconName = undefined; break;
            }
        }
        return iconName;
    }
}

export default SearchCriterion;
