import template from './roomListAmb.component.html';

const RoomListAmb = {
    bindings: {
        params: '<',
        isLoading: '=',
        openExtended: '&',
        defaultSelect: '='
    },
    controller: [ '$q', '$rootScope', 'dataPager', 'dataservice.patients', 'dataservice.rooms', 'logger', 'sessionService', controller],
    templateUrl: template
};

function controller($q, $rootScope, DataPager, dataServicePatients, dataServiceRooms, logger, session) {
    let unsubscribeCompanyChanged;
    let unsubscribeSelectedServiceChanged;
    let unsubscribeSelectedUnitChanged;

    var PATIENTS_LIMIT = 10;
    var PATIENT_CLASS_OUT_PATIENT = 'O';

    var companyId, hospService, unit;

    var ctrl = this;
    ctrl.patientViewModels = [];
    ctrl.patientsGroups = {};
    ctrl.selectedGroup = null;
    ctrl.selectedLetter = null;

    ctrl.hasData = false;
    ctrl.onlyOneLetter = false;

    ctrl.$onInit = onInit;
    ctrl.$onDestroy = onDestroy;
    ctrl.selectLetter = selectLetter;
    ctrl.unSelectLetter = unSelectLetter;

    // ------------------------------------------------------------------------- Event handling
    function onInit() {
        // Init parameters
        companyId = session.user.companyId;
        hospService = undefined;
        unit = undefined;

        // Events and set parameters
        unsubscribeCompanyChanged = $rootScope.$on(session.EVENT_SELECTED_COMPANY_CHANGED, _onCompanyChanged);
        if (!_.isEmpty(ctrl.params)) {
            switch (ctrl.params.by) {
                case 'services':
                    hospService = ctrl.params.code;
                    unsubscribeSelectedServiceChanged = $rootScope.$on(session.EVENT_SELECTED_SERVICE_CHANGED, _onServiceChanged);
                    break;
                case 'units':
                    unit = ctrl.params.code;
                    unsubscribeSelectedUnitChanged = $rootScope.$on(session.EVENT_SELECTED_UNIT_CHANGED, _onUnitChanged);
                    break;
            }
        }

        _createLetterIndex();
    }

    function onDestroy() {
        if(unsubscribeCompanyChanged) {unsubscribeCompanyChanged();}
        if(unsubscribeSelectedServiceChanged) {unsubscribeSelectedServiceChanged();}
        if(unsubscribeSelectedUnitChanged) {unsubscribeSelectedUnitChanged();}
    }

    /**
     * Handle event when a given letter (for patient last name) is clicked.
     * Load and display patients whose last name starts with a given (selected) letter
     * @param letter first letter of the patient last name
     */
    function selectLetter(letter) {
        if (!_.isUndefined(letter)
            && letter !== null
            && !_.isUndefined(ctrl.letterGrid[letter])) {

            // create patient group VM and load data (for selected letter)
            if(_.isUndefined(ctrl.patientsGroups[letter])) {
                ctrl.isLoading = true;

                // create new VM for selected patient group (letter)
                var patientsByLetterVM = new PatientByLetterViewModel(letter, companyId, hospService, unit, dataServicePatients, $q, PATIENTS_LIMIT);
                ctrl.patientsGroups[letter] = patientsByLetterVM;
                // Reset view model
                patientsByLetterVM.reset()
                    .then(function () {
                        ctrl.selectedLetter = ctrl.defaultSelect = letter;
                        ctrl.selectedGroup = ctrl.patientsGroups[ctrl.selectedLetter];
                    })
                    .finally(function() {
                       ctrl.isLoading = false;
                    });
            }
            else {
                ctrl.selectedLetter = ctrl.defaultSelect = letter;
                ctrl.selectedGroup = ctrl.patientsGroups[ctrl.selectedLetter];
            }

        } else {
            ctrl.selectedLetter = ctrl.defaultSelect = null;
            ctrl.selectedGroup = null;
        }
    }

    function unSelectLetter() {
        ctrl.selectedGroup = null;
        ctrl.selectedLetter = ctrl.defaultSelect = null;
    }

    // ------------------------------------------------------------------------- Helper methods

    /**
     * Handle when company changes
     * @private
     */
    function _onCompanyChanged() {
        companyId = session.user.companyId;
        //It's not necessary load the rooms because the event for change service or unit will be fired
        //_createLetterIndex();
    }

    /**
     * Handle when service changes
     * @private
     */
    function _onServiceChanged() {
        hospService = ctrl.params.code;
        _createLetterIndex();
    }

    /**
     * Handle when unit changes
     * @private
     */
    function _onUnitChanged() {
        unit = ctrl.params.code;
        _createLetterIndex();
    }

    /**
     * Create the structure of letters
     * Letters are displayed in a grid
     * @private
     */
    function _createLetterIndex() {
        // initialize
        ctrl.isLoading = true;
        ctrl.hasData = false;
        ctrl.onlyOneLetter = false;

        ctrl.patientsGroups = {};
        unSelectLetter();

        ctrl.letterGrid = {};

        var options = {
            companyid: companyId,
            patientunit: unit,
            hospservice: hospService,
            patientclass: PATIENT_CLASS_OUT_PATIENT
        };

        dataServicePatients.getPatientsCountByName(options)
            .then(function(patientGroupsByName) {
                var totalLetters = 0;
                var lastLetter = null;
                _.forEach(patientGroupsByName, function (patientsGroup) {
                    // only add letters with patients
                    if (patientsGroup.count > 0) {
                        ctrl.hasData = true;
                        totalLetters++;
                        // get patient last name letter (patient group)
                        var letter = patientsGroup.lastName;
                        lastLetter = letter;
                        ctrl.letterGrid[letter] = {
                            id: 'letter' + letter,
                            letter: letter
                        };
                    }
                });

                // If only a letter has patients select that letter
                ctrl.onlyOneLetter = totalLetters === 1;
                if (ctrl.onlyOneLetter) {
                    ctrl.selectLetter(lastLetter);
                }

            })
            .finally(function () {
                ctrl.isLoading = false;
            });
    }



    /**
     * View Model Class for group patients by letter and manage
     * the logic for the amount of patients that will be show by default
     *
     * @param letter
     * @param companyId
     * @param hospService
     * @param unit
     * @param dataServicePatients
     * @param $q
     * @param limit
     * @returns {PatientByLetterViewModel}
     * @constructor
     */
    function PatientByLetterViewModel(letter, companyId, hospService, unit, dataServicePatients, $q, limit) {

        var DEFAULT_PATIENTS_LIMIT =  10;
        var vm = this;

        vm.letter = letter;
        vm.id = 'letter' + letter;
        vm.patients = [];
        vm.totalPatients = null;
        vm.isLoading = false;

        limit = limit || DEFAULT_PATIENTS_LIMIT;

        // Declaring all methods as "class" methods

        // API
        PatientByLetterViewModel.prototype.hasPatients = hasPatients;
        PatientByLetterViewModel.prototype.showMorePatients = showMorePatients;
        PatientByLetterViewModel.prototype.reset = reset;

        // helper methods
        PatientByLetterViewModel.prototype._loadNextPatientsData = _loadNextPatientsData;
        PatientByLetterViewModel.prototype._loadPatients = _loadPatients;
        PatientByLetterViewModel.prototype._removeShowMorePatients = _removeShowMorePatients;
        PatientByLetterViewModel.prototype._addShowMorePatients = _addShowMorePatients;

        // -------------------------------------------------------------------- API methods

        /**
         * Reset the status of this letter
         *
         * @returns {promise}
         */
        function reset() {
            vm.patients = [];
            vm.totalPatients = null;
            return _loadNextPatientsData();
        }

        /**
         * add the next amount of patient if there are more
         *
         * @returns {promise}
         */
        function showMorePatients() {
            return _loadNextPatientsData();
        }

        /**
         * Return true if there are patients depending off the totalPatients number
         *
         * @returns {boolean|*}
         */
        function hasPatients() {
            return vm.totalPatients && vm.totalPatients > 0;
        }

        // -------------------------------------------------------------------- Helper methods

        /**
         * Calculates the next limit and offset and makes the request
         *
         * @returns {*}
         * @private
         */
        function _loadNextPatientsData() {
            var deferred = $q.defer();
            vm.isLoading = true;

            // Note:
            // "vm.patients.length" = # of chips displayed = # of chips loaded + "..." chip (if there are more patients to load)
            // "vm.totalPatients = total # of patients in the group
            if (!vm.totalPatients || vm.patients.length <= vm.totalPatients) {
                _removeShowMorePatients();

                _loadPatients(vm.patients.length, limit)
                    .then(function (result) {
                        vm.totalPatients = result.nb_records;

                        if (result && result.patients && result.patients.length > 0) {
                            _.each(result.patients, function (patientInfo) {
                                vm.patients.push(patientInfo.patient);
                            });
                        }

                        _addShowMorePatients();
                        deferred.resolve();
                    })
                    .finally(function () {
                        vm.isLoading = false;
                    });
            } else {
                vm.isLoading = false;
                deferred.resolve();
            }

            return deferred.promise;
        }

        function _loadPatients(offset, limit) {
            var options = {
                companyid: companyId,
                patientunit: unit,
                patientclass: PATIENT_CLASS_OUT_PATIENT,
                hospservice: hospService,
                name: vm.letter,
                offset: offset,
                limit: limit,
                orderby: 'lastname',
                sortorder: 'asc'
            };

            return dataServicePatients.getPatientByRoomList(options);
        }

        function _removeShowMorePatients() {
            if (vm.patients && vm.patients.length &&
                vm.patients.length >= 1 &&
                vm.patients[vm.patients.length - 1].isLoadMore) {
                vm.patients.splice(-1, 1);
            }
        }

        function _addShowMorePatients() {
            if (vm.totalPatients > 0 && vm.patients.length < vm.totalPatients) {
                vm.patients.push({'isLoadMore': true})
            }
        }
    }
}

export default RoomListAmb;
