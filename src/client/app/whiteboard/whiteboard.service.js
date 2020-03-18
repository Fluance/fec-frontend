/**
 * @ngdoc service
 * @module app.whiteboard
 * @name whiteboardService
 * @description
 *
 * The Whiteboard service is the interface all Whiteboard components talk to.
 */

const LOCK_RESOURCE_TYPE = 'whiteboard';

whiteboardService.$inject = ['$filter', '$rootScope', 'dataservice.whiteboard', 'dataservice.locks', 'sessionService', 'patientService'];

/* @ngInject */
function whiteboardService($filter, $rootScope, dataserviceWhiteboard, dataServiceLocks, session, patientService) {

    // isolation types


    var _config;
    var _isActive = false;
    var _state;

    var service = {
        // constants
        ISOLATION_TYPE_AEROSOL: "A",
        ISOLATION_TYPE_CONTACT: "C",
        ISOLATION_TYPE_DROPLETS: "G",
        ISOLATION_TYPE_PROTECTIVE: "P",

        // EVENTS
        EVENT_LEAVE_NURSE_EDIT_MODE: 'event_leave_nurse_edit_mode',

        // Methods
        init: init,
        isActive: isActive,

        isWhiteboardAvailable: isWhiteboardAvailable,
        getNurses: getNurses,
        setWhiteboardState: setWhiteboardState,
        getWhiteboardState: getWhiteboardState,
        getWhiteboard: getWhiteboard,
        updateWhiteboardItem: updateWhiteboardItem,
        getAvailableServices: getAvailableServices,
        getIsolationTypeText: getIsolationTypeText,
        getIsolationTypes: getIsolationTypes,
        getRoomCapacities: getRoomCapacities,
        getPatientNamePrefix: getPatientNamePrefix,
        getPhysiciansArrayFromAutocompleteStorage: dataserviceWhiteboard.getPhysiciansArrayFromAutocompleteStorage,
        addPhysiciansToTheAutocompleteStorage: dataserviceWhiteboard.addPhysiciansToTheAutocompleteStorage,
        getDietCatalog: dataserviceWhiteboard.getDietCatalog,
        getDietsCategories: getDietsCategories,
        getLangFromUILanguage: getLangFromUILanguage,
        getRoomTypes: getRoomTypes,
        // locking
        lockWhiteboardItem: lockWhiteboardItem,
        unlockWhiteboardItem: unlockWhiteboardItem,
        // refresh interval
        startAutoFresh: undefined,
        stopAutoRefresh: undefined
    };

    var _isolationTypes = [
        {value: service.ISOLATION_TYPE_AEROSOL, text: 'whiteboard.ISOLATION_TYPE_AEROSOL'},
        {value: service.ISOLATION_TYPE_CONTACT, text: 'whiteboard.ISOLATION_TYPE_CONTACT'},
        {value: service.ISOLATION_TYPE_DROPLETS, text: 'whiteboard.ISOLATION_TYPE_DROPLETS'},
        {value: service.ISOLATION_TYPE_PROTECTIVE, text: 'whiteboard.ISOLATION_TYPE_PROTECTIVE'}
    ];

    return service;


    // ------------------------------------------------------------------- Configuration methods

    function init(config) {
        if (!_.isObject(config)) { return; }

        _config = config;
        service.isActive(true);

        // Events and set parameters
        $rootScope.$on(session.EVENT_SELECTED_COMPANY_CHANGED, _resetState);
        $rootScope.$on(session.EVENT_SELECTED_SERVICE_CHANGED, _resetStateService);
    }

    function isActive(value) {
        if (_.isUndefined(value)) {
            return _isActive;
        }
        else {
            var oldValue = _isActive;
            _isActive = value;
            return oldValue;
        }
    }

    // --------------------------------------------------------------- API methods

    function isWhiteboardAvailable(params) {
        return dataserviceWhiteboard.isWhiteboardAvailable(params);
    }

    function getAvailableServices(companyId) {
        return dataserviceWhiteboard.getAvailableServices(companyId);
    }

    function getNurses() {
        return dataserviceWhiteboard.getNurses(_state);
    }

    function getWhiteboard(params) {
        return dataserviceWhiteboard.getWhiteboard(params);
    }

    function updateWhiteboardItem(item) {
        return dataserviceWhiteboard.updateWhiteboardItem(item, _state);
    }

    function setWhiteboardState(state) {
        _state = state;
    }

    function getWhiteboardState() {
        return _state;
    }

    function _resetState() {
        setWhiteboardState(undefined);
    }

    function _resetStateService(event, hospService) {
        setWhiteboardState({
            companyId: session.user.companyId,
            hospService: hospService
        });
    }

    function getIsolationTypes() {
        return _isolationTypes;
    }

    function getIsolationTypeText(isolationType) {
        var isolationTypeItem = _isolationTypes.find(function(el) { return el.value === isolationType} );

        if(isolationTypeItem) {
            return _translate(isolationTypeItem.text);
        }
        else {
            return '';
        }
    }

    function getRoomTypes(params) {
        return dataserviceWhiteboard.getAllRoomTypes(params);
    }

    function getRoomCapacities(params) {
        return dataserviceWhiteboard.getRoomCapacities(params);
    }

    function getPatientNamePrefix(patientGender) {
        var genderType = patientService.getGenderType(patientGender);
        var prefix;

        switch(genderType) {
            case patientService.GENDER_MALE: prefix = $filter('translate')('whiteboard.PATIENT_MALE_PREFIX'); break;
            case patientService.GENDER_FEMALE: prefix = $filter('translate')('whiteboard.PATIENT_FEMALE_PREFIX'); break;
            default: prefix = '';

        }
        return prefix;
    }

    function getDietsCategories(diets) {
        var categories = [];

        _.forEach(diets, function (diet) {
            if (diet.category) {
                var searchedCategory = _.find(categories, {category: diet.category})

                if (_.isUndefined(searchedCategory)) {
                    categories.push({category: diet.category});
                }
            }
        });

        return categories;
    }

    function getLangFromUILanguage(UILanguage) {
        switch (UILanguage) {
            case 'en':
                return 'EN';
            case 'it':
                return 'IT';
            case 'fr':
                return 'FR';
            case 'de':
                return 'DE';
            default:
                return 'EN';
        }
    }

    // locking

    function lockWhiteboardItem(itemId) {
        return dataServiceLocks
            .lock(itemId, LOCK_RESOURCE_TYPE)
            .catch(function (exception) {
                throw exception;
            });
    }

    function unlockWhiteboardItem(itemId) {
        return dataServiceLocks
            .unlock(itemId, LOCK_RESOURCE_TYPE)
            .catch(function (reason) {
                throw reason;
            });
    }

    // -------------------------------------------------------- Helper methods

    function _translate(code) {
        return $filter('translate')(code);
    }

    // --------------------------------------------------------------- Deep-link button methods


}

export default whiteboardService;
