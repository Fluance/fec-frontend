/*jshint -W040*/ //  Strict
/*jshint -W101*/ //  Line too long
import _ from 'lodash';
import template from './ShiftPatientList.component.html';

const ShiftPatientList = {
    bindings: {
        companyId: '<',
        unit: '<'
    },
    controller: controller,
    controllerAs: 'vm',
    templateUrl: template
};

controller.$inject = ['$timeout', '$filter', 'dataservice.shiftPatients', 'sessionService'];

function controller($timeout, $filter, dataserviceShiftPatients, session) {
    var vm = this;
    var oldShiftLeader = '';

    // events
    vm.$onInit = onInit;
    // interface
    vm.changeSelection = changeSelection;
    vm.changeShiftLeader = changeShiftLeader;
    vm.loadNext = loadNext;
    vm.loadPrev = loadPrev;
    vm.filterAdmissiondate = filterAdmissiondate;
    vm.filterEmptyfields = filterEmptyfields;

    // ----------------------------------------------------------------------------- Event methods

    function onInit() {
        vm.shiftLeader = {
            'companyId': vm.companyId,
            'patientUnit': vm.unit,
            'listDate': $filter('formatDate')(moment().toDate(), 'englishDate'),
            'shiftLeader': ''
        };
        vm.isLoading = false;

        // Admission state
        vm.admissionState = 'all';
        vm.admissionOptions = [{
            id: 'all',
            name: 'core.ADMISSIONSTATUS_ALL'
        }, {
            id: 'currentadmission',
            name: 'core.ADMISSIONSTATUS_PRESENT'
        }, {
            id: 'preadmission',
            name: 'core.ADMISSIONSTATUS_PREADMITTED'
        }];


        // Empty state
        vm.emptyState = 'ALL';
        vm.emptyOptions = [{
            id: 'ALL',
            name: 'shiftPatientList.ALL_NOTES'
        },{
            id: 'FILLED',
            name: 'shiftPatientList.FILLED_ONLY'
        }, {
            id: 'EMPTY',
            name: 'shiftPatientList.NOT_FILLED_ONLY'
        }];

        loadShiftLeader();
        loadFood();
        loadMobility();
        loadPatients();
    }

    // ----------------------------------------------------------------------------- Interface methods

    function changeSelection() {
        dataserviceShiftPatients.updateFoodMobility(vm.currentPatient.visitNb, vm.currentPatient.food, vm.currentPatient.mobility);
    }

    function changeShiftLeader() {
        if (oldShiftLeader !== vm.shiftLeader.shiftLeader) {
            dataserviceShiftPatients.updateShiftLeader(vm.shiftLeader).then(function(data) {
                oldShiftLeader = vm.shiftLeader.shiftLeader;
            });
        }
    }

    function filterAdmissiondate(filterId, filterModel) {
        vm.admissionState = filterModel;
        loadPatients();
    }

    function filterEmptyfields(filterId, filterModel) {
        vm.emptyState = filterModel;
        loadPatients();
    }

    function loadNext() {
        vm.currentPosition = vm.currentPosition < vm.maxPatients ? vm.currentPosition + 1 : 0;
        loadPatient();
    }

    function loadPrev() {
        vm.currentPosition = vm.currentPosition > 0 ? vm.currentPosition - 1 : vm.maxPatients;
        loadPatient();
    }

    // ----------------------------------------------------------------------------- Load data

    function loadShiftLeader() {
        dataserviceShiftPatients.getShiftLeader(vm.companyId, vm.unit).then(function(shiftLeader) {
            if (shiftLeader) {
                oldShiftLeader = shiftLeader.shiftLeader;
                vm.shiftLeader = shiftLeader;
            }
        });
    }

    function loadFood() {
        dataserviceShiftPatients.getFood().then(function(data) {
            if(data) {
                vm.foodOptions = data;
            }
        });
    }

    function loadMobility() {
        dataserviceShiftPatients.getMobility().then(function(data) {
            if(data) {
                vm.mobilityOptions = data;
            }
        });
    }

    function loadPatients() {
        vm.isLoading = true;
        dataserviceShiftPatients.getPatients(vm.companyId, vm.unit, vm.admissionState).then(function(patients) {
            vm.patients = _.filter(patients, function(patient) {
                var returnValue = false;
                if (vm.admissionState === 'all' || (vm.admissionState === 'currentadmission' && _.isEmpty(patient.admissionTime)) || (vm.admissionState === 'preadmission' && !_.isEmpty(patient.admissionTime))) {
                    returnValue = true;
                }
                if (!!returnValue && (vm.emptyState === 'ALL' || (vm.emptyState === 'EMPTY' && (_.isEmpty(patient.food) || _.isEmpty(patient.mobility))) || (vm.emptyState === 'FILLED' && !_.isEmpty(patient.food) && !_.isEmpty(patient.mobility)))) {
                    returnValue = true;
                } else {
                    returnValue = false;
                }
                return returnValue;
            });
            vm.currentPosition = 0;
            vm.maxPatients = vm.patients.length - 1;
            vm.currentPatient = vm.patients[vm.currentPosition];
        }).finally(function() {
            vm.isLoading = false;
        });
    }

    function loadPatient() {
        vm.currentPatient = vm.patients[vm.currentPosition];
    }
}

export default ShiftPatientList;
