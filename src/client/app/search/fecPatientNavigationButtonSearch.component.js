import template from './fecPatientNavigationButtonSearch.component.html';

const PatientNavigationButtonSearch = {
    controller: ['$q', '$state', 'searchQuery', controller],
    templateUrl: template
};

function controller($q, $state, SearchQuery) {
    var ctrl = this;

    // state
    ctrl.isActive = true;

    // methods
    ctrl.$onInit = onInit;
    ctrl.canNavigate = canNavigate;
    ctrl.navigateTo = navigateTo;

    // ------------------------------------------------------ Public functions

    function onInit() {
        ctrl.requiredContext = 'patientId';
    }

    function canNavigate(context) {
        // Query object
        // TODO : harmonize the criterion names to avoid such cleaning , here we have "patientId" in the context and "pid" in the query object
        var cleanedContext = _.omit(context, ['patientId', 'visitId', '#']);
        ctrl.searchQuery = new SearchQuery(cleanedContext);

        if (ctrl.searchQuery.isValid()){
            return $q.resolve(true);
        } else {
            ctrl.isActive = false;
            return $q.resolve(false);
        }
    }

    function navigateTo(context) {
        var stateParams = ctrl.searchQuery.toStateParams();

        // Determine target state
        var targetState = _.has(stateParams, 'field') ? 'fullSearch' : 'searchpatient';
        $state.go(targetState, stateParams);
    }
}

export default PatientNavigationButtonSearch;
