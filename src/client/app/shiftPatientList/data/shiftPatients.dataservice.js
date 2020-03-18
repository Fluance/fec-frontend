/*jshint -W101*/ //  Line too long

const RESOURCE_NAME_SHIFTPATIENT = 'shiftPatient';
const RESOURCE_NAME_FOOD = 'food';
const RESOURCE_NAME_MOBILITY = 'mobility';
const RESOURCE_NAME_SHIFTLEADER = 'shiftLeader';
const ENDPOINT_NAME_PATIENTLIST = 'patientlist';
const ENTITY_KEY_SHIFTPATIENT = 'visitNb';
let ShiftPatient, Food, Mobility, ShiftLeader;


const run = ['config', 'DS', function(config, DS) {
    ShiftPatient = DS.defineResource({
        name: RESOURCE_NAME_SHIFTPATIENT,
        endpoint: ENDPOINT_NAME_PATIENTLIST,
        idAttribute: ENTITY_KEY_SHIFTPATIENT,
        basePath: config.apiServer
    });
    Food = DS.defineResource({
        name: RESOURCE_NAME_FOOD,
        endpoint: ENDPOINT_NAME_PATIENTLIST,
        basePath: config.apiServer
    });
    Mobility = DS.defineResource({
        name: RESOURCE_NAME_MOBILITY,
        endpoint: ENDPOINT_NAME_PATIENTLIST,
        basePath: config.apiServer
    });
    ShiftLeader = DS.defineResource({
        name: RESOURCE_NAME_SHIFTLEADER,
        idAttribute: 'compoundId',
        computed: {
            compoundId: ['companyId', 'patientUnit', 'listDate', function(companyId, patientUnit, listDate) {
                return companyId + '-' + patientUnit + '-' + listDate;
            }]
        },
        endpoint: ENDPOINT_NAME_PATIENTLIST + '/shiftleader',
        basePath: config.apiServer
    });
}];

dataServiceShiftPatients.$inject = ['config', '$http', '$q', 'DS'];

function dataServiceShiftPatients(config, $http, $q, DS) {
    var service = {
        checkAvailability: checkAvailability,
        getPatients: getPatientsList,
        getShiftLeader: getShiftLeader,
        getFood: getFood,
        getMobility: getMobility,
        getReport: getReport,
        updateShiftLeader: updateShiftLeader,
        updateFoodMobility: updateFoodMobility
    };

    Food.afterFindAll = function(Resource, data) { return _deserializeFood(data); };
    Mobility.afterFindAll = function(Resource, data) { return _deserializeMobility(data); };

    return service;

    // ---------------------------------------------------------- Interface functions

    function checkAvailability(companyId, patientUnit) {
        return DS.adapters.http
            .GET(config.apiServer + '/' + ENDPOINT_NAME_PATIENTLIST + '/enabled?companyid=' + companyId + '&patientunit=' + patientUnit, {});
    }

    function getShiftLeader(companyId, patientUnit) {
        return ShiftLeader.findAll({
            companyid: companyId,
            patientunit: patientUnit,
        }, {
            cacheResponse: false,
            bypassCache: true
        })
        .catch(function(error) {
            console.error('Error getShiftLeader: ', error);
        });
    }

    function getFood() {
        return Food.findAll({}, {
            endpoint: ENDPOINT_NAME_PATIENTLIST + '/food',
            cacheResponse: false,
            bypassCache: true
        })
        .catch(function(error) {
            console.error('Error getFood: ', error);
        });
    }

    function getMobility() {
        return Mobility.findAll({}, {
            endpoint: ENDPOINT_NAME_PATIENTLIST + '/mobility',
            cacheResponse: false,
            bypassCache: true
        })
        .catch(function(error) {
            console.error('Error getMobility: ', error);
        });
    }

    function getPatientsList(companyId, patientUnit, admissionState) {
        admissionState = admissionState === 'all' ? null : admissionState;
        return ShiftPatient.findAll({
            companyid: companyId,
            patientunit: patientUnit,
            admissionstatus: admissionState
        }, {
            cacheResponse: false,
            bypassCache: true
        })
        .catch(function(error) {
            console.error('Error getPatientsList: ', error);
        });
    }

    function updateShiftLeader(shiftLeader) {
        return ShiftLeader.updateAll(shiftLeader);
    }

    function updateFoodMobility(visitNb, food, mobility) {
        return ShiftPatient.update(visitNb, {
            food: food ? food : '',
            mobility: mobility ? mobility : ''
        }, {
            endpoint: ENDPOINT_NAME_PATIENTLIST + '/foodmobility'
        });
    }

    /**
     * Get PDF file with current Patient List report
     * @returns {*}
     */
    function getReport(companyId, patientUnit) {
        return $http({
            url: config.apiServer + '/' + ENDPOINT_NAME_PATIENTLIST + '/pdf/' + companyId + '/' + patientUnit,
            method: 'GET',
            headers: {
                'Content-type': 'application/pdf'
            },
            responseType: 'arraybuffer'
        });
    }

    // ---------------------------------------------------------- Helper functions

    /**
     * private method
     **/
    function remapGender(inGender) {
        if (inGender) {
            inGender = inGender.toLowerCase();
            return (inGender.indexOf('w') === 0 || inGender.indexOf('f') === 0) ? 'f' : 'm';
        } else {
            return null;
        }
    }

    /**
     * private method
     **/
    function normalizeName(name) {
        if (name !== null) {
            return name.replace(/([^\W_]+[^\s-]*) */g, function(txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });
        } else {
            return null;
        }
    }

    function _deserializeFood(data) {
        var returnValue = [];
        _.each(data, function(item) {
            returnValue.push({
                'id': item,
                'name': item
            });
        });
        return returnValue;
    }

    function _deserializeMobility(data) {
        var returnValue = [];
        _.each(data, function(item) {
            returnValue.push({
                'id': item,
                'name': item
            });
        });
        return returnValue;
    }
}

export {
    dataServiceShiftPatients,
    run
}
