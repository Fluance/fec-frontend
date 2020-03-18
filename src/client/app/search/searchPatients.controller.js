// jscs:disable requireParenthesesAroundIIFE

SearchPatientsController.$inject = [
    '$scope',
    '$stateParams',
    //'LayoutPatientContextBox',
    'dataPager',
    'dataservice.patients',
    'layoutService',
    'searchQuery',
    //'tutorialService',
];

/* @ngInject */
function SearchPatientsController($scope, $stateParams,
    DataPager, dataservicePatients, layoutService, SearchQuery) {

    /*jshint validthis: true */
    var ctrl = this;
    ctrl.title = 'PatientsController';

    // Sorting
    ctrl.sortCriteria = dataservicePatients.sortCriteria;
    var DEFAULT_SORT_CRITERIA = ($stateParams.orderby) ? $stateParams.orderby : (ctrl.sortCriteria.length > 0) ? ctrl.sortCriteria[0].key : undefined;
    var DEFAULT_SORT_DIRECTION = ($stateParams.sortorder) ? $stateParams.sortorder : 'asc';

    // Paging
    ctrl.dataPager = new DataPager();
    ctrl.dataPager.pageSize = 20;
    ctrl.dataPager.loadPage = loadPage;
    ctrl.dataPager.sortBy = DEFAULT_SORT_CRITERIA;
    ctrl.dataPager.sortDirection = DEFAULT_SORT_DIRECTION;

    // Searching
    ctrl.searchQuery = new SearchQuery($stateParams);
    ctrl.queryHasChanged = refresh;

    // Operation methods
    ctrl.refresh = refresh;
    ctrl.canSort = function() { return ctrl.dataPager.items.length > 1; };

    // Events
    //$scope.$on('patient.stateChanged', onPatientStateChanged);

    activate();
    return ctrl;

    // ------------------------------------------------------------------- Interface operations

    function activate() {
        // Scrollable container (relevant for infinite-scroll)
        ctrl.scrollableContainer = layoutService.getScrollableContainer();

        /*
        if (tutorialService.isActive()) {
            // Configure tutorials
            configureTutorial();
            configureTutorialPatient();
            tutorialService.current(ctrl.title);
        }*/

        // Load view
        refresh();
    }

    function refresh() {
        ctrl.dataPager.reset();
        ctrl.dataPager
            .getNextPage()
            .then(function() {
                // Expand if only 1 item
                if (ctrl.dataPager.items.length === 1) {
                    ctrl.dataPager.items[0].isExpanded = true;
                }
            });
    }

    // --------------------------------------------------------------------------- Data loading

    function loadPage(pageIndex, pageSize, sortBy, sortDirection) {
        var params = ctrl.searchQuery.toStateParams();
        params.offset = pageIndex * pageSize;
        params.limit = pageSize;
        params.orderby = sortBy;
        params.sortorder = sortDirection;

        var promise;
        if (params.hospservice !== undefined) {
            promise = dataservicePatients.getPatientByLocation(params);
        } else {
            promise = dataservicePatients.getPatientByCriteria(params);
        }
        return promise
            .then(function(result) {
                // Initialize total record count
                ctrl.dataPager.setTotalItemsCount(result['nb_records']);

                // Convert items to viewmodel objects
                var items = _.isArray(result.patients) ? result.patients : [];
                return items.map(function(item) {
                    return {
                        patient: item.patient,
                        visit: item.visit,
                        isExpanded: false,
                        isLoadingDetails: false
                    };
                });
            });
    }

    // ------------------------------------------------------------------------------- Tutorial

    // function configureTutorial() {
    //     var contextBoxSteps = ContextBox.getTutorialSteps();
    //     var steps = [
    //         {
    //             element: '#patients-order-sort',
    //             introKey: 'core.GUIDE_ORDER_SORT',
    //             position: 'bottom-middle-aligned'
    //         }, {
    //             element: '#patients-list',
    //             introKey: 'patient.GUIDE_PATIENT_AREA',
    //             position: 'bottom-middle-aligned'
    //         },
    //     ];

    //     tutorialService.setSteps(ctrl.title, 0, contextBoxSteps.concat(steps));
    // }

    function configureTutorial() {
        var contextBoxSteps = ContextBox.getTutorialSteps();
        var steps = [{
            element: 'fec-data-pager-sort',
            introKey: 'core.GUIDE_ORDER_SORT',
            position: 'bottom-middle-aligned'
        }, {
            element: '#patients-list',
            introKey: 'patient.GUIDE_PATIENT_AREA',
            position: 'bottom-middle-aligned'
        }, ];

        tutorialService.setSteps(ctrl.title, 0, contextBoxSteps.concat(steps));
    }

    function configureTutorialPatient() {
        tutorialService
            .setSteps(tutorialService.CHAPTER_NAME_PATIENT, 0, [{
                element: '.expander.expanded fec-nav-button-notes',
                introKey: 'patient.GUIDE_NOTE',
                position: 'top-middle-aligned'
            }, {
                element: '.expander.expanded fec-nav-button-visit-list',
                introKey: 'patient.GUIDE_VISITS',
                position: 'top-middle-aligned'
            }, {
                element: '.expander.expanded fec-nav-button-imaging-list',
                introKey: 'patient.GUIDE_IMAGING',
                position: 'top-middle-aligned'
            }, {
                element: '.expander.expanded fec-nav-button-lab',
                introKey: 'patient.GUIDE_LAB',
                position: 'top-middle-aligned'
            }, {
                element: '.expander.expanded fec-nav-button-reporting',
                introKey: 'core.GUIDE_REPORTING',
                position: 'top-middle-aligned'
            }, {
                element: '.expander.expanded fec-nav-button-appointment-list',
                introKey: 'patient.GUIDE_APPOINTMENT',
                position: 'top-middle-aligned'
            }, {
                element: '.expander.expanded fec-nav-button-access-log',
                introKey: 'patient.GUIDE_ACCESS_LOGS',
                position: 'top-middle-aligned'
            }]);
    }

    /*
    function onPatientStateChanged(event, args) {
        // Set tutorial chapter
        var chapter = (_.some(ctrl.dataPager.items, function(r) {
            return r.isExpanded;
        })) ? tutorialService.CHAPTER_NAME_PATIENT : ctrl.title; // jshint ignore:line
        tutorialService.current(chapter);
    }*/
}

export default SearchPatientsController;

