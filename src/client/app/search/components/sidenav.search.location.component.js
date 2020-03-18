import template from './sidenav.search.location.component.html';

const SidenavSearchLocation = {
    controller: controller,
    controllerAs: 'vm',
    require: {
        sidenavSearch: '^fecSidenavSearch'
    },
    templateUrl: template
};

controller.$inject = [
    '$scope',
    '$filter',
    '$rootScope',
    '$stateParams',
    'logger',
    'datePicker',
    'dataservice.beds',
    'dataservice.companies',
    'dataservice.hospServices',
    'dataservice.rooms',
    'dataservice.units',
    //'tutorialService',
    'searchQueryService',
    'searchQuery',
    'searchQueryService',
    'sessionService'
];

/* @ngInject */
function controller(
    $scope,
    $filter,
    $rootScope,
    $stateParams,
    logger,
    datePicker,
    dataServiceBeds,
    dataServiceCompanies,
    dataServiceHospServices,
    dataServiceRooms,
    dataServiceUnits,
    //tutorialService,
    searchQueryService,
    SearchQuery,
    SearchQueryService,
    session) {

    var fnOrderBy = $filter('orderBy');
    var fnTranslate = $filter('translate');

    /*jshint validthis: true */
    var vm = this;
    vm.title = 'fecSidenavSearchLocation';

    vm.$onInit = onInit;
    $rootScope.$on('searchCriteriaRemoved', onInit);

    // ------------------------------------------------------------------------- Initialization

    function onInit() {
        _resetForm();
        // Initialize parent component
        vm.sidenavSearch.initializeForm = _initializeForm;
        vm.sidenavSearch.submit = _submit;
        //vm.sidenavSearch.tutorialChapterName = tutorialService.CHAPTER_NAME_SIDEBAR_SEARCH_LOCATION;
        vm.sidenavSearch.isValid = _isValid;

        _initializeForm();

        /*
        if (tutorialService.isActive()) {
            // Configure tutorials
            configureTutorial();
        }*/
    }

    function _initializeForm() {
        _initAdmissionDate();
        _loadAdmissionStatus();
        _loadCompanies()
            .then(function () {
                // Restore params from $stateParams
                _restoreParams();

                // Set default values
                if (!vm.admissionStatus.selectedId) { vm.admissionStatus.setSelectedId(vm.admissionStatus.items[0].key); }
                if (!vm.companies.selectedId) { vm.companies.setSelectedId(session.getSelectedCompany().id); }

                _cleanUpForm();
            });
    }

    function _initAdmissionDate() {
        if (!vm.admissionDate || !vm.admissionDate.value) {
            vm.admissionDate.value = moment().toDate();
        }
        vm.admissionDate.show = true;
    }

    function _resetForm() {
        vm.admissionDate = {};
        vm.admissionStatus = new FilterSelection(function () { _onSelectionChanged('admissionStatus'); });
        vm.beds = new FilterSelection(function () { _onSelectionChanged('beds'); });
        vm.companies = new FilterSelection(function () { _onSelectionChanged('companies'); });
        vm.hospServices = new FilterSelection(function () { _onSelectionChanged('hospServices'); });
        vm.rooms = new FilterSelection(function () { _onSelectionChanged('rooms'); });
        vm.units = new FilterSelection(function () { _onSelectionChanged('units'); });
        vm.companies = new FilterSelection(function () { _onSelectionChanged('companies'); });
    }
    function _restoreParams() {
        var searchQuery = new SearchQuery($stateParams);
        searchQuery.getCriteria().forEach(function (criterion) {
            switch (criterion.key) {
                case 'admitdt':
                    vm.admissionDate.value = criterion.getValue();
                    break;

                case 'admissionstatus':
                    vm.admissionStatus.setSelectedId(criterion.getValue());
                    break;

                case 'companyid':
                    vm.companies.setSelectedId(criterion.getValue());
                    break;

                case 'patientbed':
                    vm.beds.setSelectedId(criterion.getValue());
                    break;

                case 'hospservice':
                    vm.hospServices.setSelectedId(criterion.getValue());
                    break;

                case 'patientroom':
                    vm.rooms.setSelectedId(criterion.getValue());
                    break;

                case 'patientunit':
                    vm.units.setSelectedId(criterion.getValue());
                    break;
            }
        });
    }

    // --------------------------------------------------------------------------- Data loading

    function _loadAdmissionStatus() {
        vm.admissionStatus.items = [{
            key: '',
            displayName: 'core.ADMISSIONSTATUS_ALL'
        }, {
            key: 'preadmission',
            displayName: 'core.ADMISSIONSTATUS_PREADMITTED'
        }, {
            key: 'currentadmission',
            displayName: 'core.ADMISSIONSTATUS_PRESENT'
        }];
    }

    function _loadBeds() {
        var promise = dataServiceBeds.getBedList(
            vm.companies.selectedId,
            vm.rooms.selectedId,
            vm.hospServices.selectedId,
            vm.units.selectedId
        );
        return _loadList(promise, vm.beds, 'bedNumber');
    }

    function _loadCompanies() {
        var promise = dataServiceCompanies.getCompanyList();
        return _loadList(promise, vm.companies, 'code');
    }

    function _loadHospServices() {
        var promise = dataServiceHospServices.getServiceList(
            vm.companies.selectedId,
            vm.units.selectedId
        );
        return _loadList(promise, vm.hospServices);
    }

    function _loadRooms() {
        var promise = dataServiceRooms.getRoomList(
            vm.companies.selectedId,
            vm.hospServices.selectedId,
            vm.units.selectedId
        );
        return _loadList(promise, vm.rooms, 'room');
    }

    function _loadUnits() {
        var promise = dataServiceUnits.getUnitList(
            vm.companies.selectedId
        );
        return _loadList(promise, vm.units, 'code');
    }

    function _loadList(promise, collection, orderBy) {
        // Load data
        collection.isLoading = true;
        return promise
            .then(function (result) {
                collection.items = (orderBy) ? fnOrderBy(result, orderBy) : result;
                // collection.selectedId = undefined;
            })
            .finally(function () {
                // Clear selection
                // _cleanUpForm();

                collection.isLoading = false;
            });
    }

    // -------------------------------------------------------------------------- Form handling

    function _cleanUpForm() {
        if (!vm.companies.selectedId) {
            vm.units.items = [];
            vm.units.selectedId = undefined;
            vm.hospServices.items = [];
            vm.hospServices.selectedId = undefined;
        }
        if (!vm.hospServices.selectedId) {
            vm.rooms.items = [];
            vm.rooms.selectedId = undefined;
        }
        if (!vm.rooms.selectedId) {
            vm.beds.items = [];
            vm.beds.selectedId = undefined;
        }
    }

    function _onSelectionChanged(type) {
        switch (type) {
            case 'beds':
                // No action required
                break;

            case 'companies':
                _loadUnits();
                _loadHospServices();
                break;

            case 'hospServices':
                _loadRooms();
                break;

            case 'rooms':
                _loadBeds();
                break;

            case 'units':
                _loadHospServices();
                break;

            case 'admissionStatus':
                _showHideAdmissionDate();
                break;

            default:
                throw new Error('Invalid type for selectionChanged');
        }
    }

    function _submit() {
        var params = {
            admitdt: vm.admissionDate.value,
            admissionstatus: vm.admissionStatus.selectedId,
            patientbed: vm.beds.selectedId,
            companyid: vm.companies.selectedId,
            hospservice: vm.hospServices.selectedId,
            patientroom: vm.rooms.selectedId,
            patientunit: vm.units.selectedId
        };
        var searchQuery = new SearchQuery(params);

        try {
            if (searchQuery.isValid()) {
                SearchQueryService
                    .addEntryToHistory(searchQuery)
                    .then(function () {
                        SearchQueryService.performNavigation(searchQuery);
                    });
            } else {
                throw fnTranslate('search.ERROR_NO_PERSONAL_DATA') + fnTranslate('.');
            }
        } catch (errorMessage) {
            logger.info(errorMessage);
        }
    }

    function _isValid() {
        if ($scope.searchForm && $scope.searchForm.$valid) {
            return true;
        } else {
            return false;
        }
    }

    function _showHideAdmissionDate() {
        if (_.isString(vm.admissionStatus.selectedId) && vm.admissionStatus.selectedId === '') {
            _initAdmissionDate();
        } else if (vm.admissionDate.show) {
            vm.admissionDate.show = false;
            vm.admissionDate.value = undefined;
        }
    }

    // ------------------------------------------------------------------------------- Tutorial

    function configureTutorial() {
        tutorialService
            .setSteps(tutorialService.CHAPTER_NAME_SIDEBAR_SEARCH_LOCATION, 0, [{
                element: '[tutorial-step="company"]',
                introKey: 'layout.SEARCH_CLINIC',
                position: 'bottom'
            }, {
                element: '[tutorial-step="unit"]',
                introKey: 'layout.SEARCH_UNIT',
                position: 'bottom'
            }, {
                element: '[tutorial-step="hospService"]',
                introKey: 'layout.SEARCH_SERVICE',
                position: 'bottom'
            }, {
                element: '[tutorial-step="room"]',
                introKey: 'layout.SEARCH_ROOM',
                position: 'bottom'
            }, {
                element: '[tutorial-step="bed"]',
                introKey: 'layout.SEARCH_BED',
                position: 'bottom'
            }, {
                element: '[tutorial-step="admissionStatus"]',
                introKey: 'layout.SEARCH_FILTER',
                position: 'bottom'
            }, {
                element: '[tutorial-step="admissionDate"]',
                introKey: 'layout.SEARCH_ADMISSION_DATE',
                position: 'bottom'
            }]);
    }
}

function FilterSelection(fnSelectionChanged) {
    var self = this;
    this.canSelect = false;
    this.isLoading = false;
    this.items = [];
    this.selectedId = undefined;
    this.selectionChanged = fnSelectionChanged;

    this.setSelectedId = function (value) {
        self.selectedId = value;
        if (_.isFunction(self.selectionChanged)) { self.selectionChanged(); }
    };
}

export default SidenavSearchLocation;
