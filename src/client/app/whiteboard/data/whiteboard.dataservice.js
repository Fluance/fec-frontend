const RESOURCE_NAME = 'whiteboard';
const RESOURCE_ENDPOINT = 'whiteboards';
const RESOURCE_NAME_WHITEBOARDITEM = 'whiteboardItem';
const RESOURCE_NAME_CAPACITIES = 'capacities';
const RESOURCE_ENDPOINT_CAPACITIES = 'capacity';
const RESOURCE_NAME_WHITEBOARDDIET = 'dietCatalog';
const RESOURCE_ENDPOINT_WHITEBOARDDIET = '/diets';
const RESOURCE_NAME_ROOM_CONFIGURATION = 'roomConfiguration';
const RESOURCE_ENDPOINT_ROOM_CONFIGURATION = '/rooms-config';
const RESOURCE_NAME_ROOM_TYPES = 'roomConfigurationTypes';
const RESOURCE_ENDPOINT_ROOM_TYPES = '/room-types';

let Whiteboard, WhiteboardItem, Capacities, WhiteboardDiet, RoomConfiguration, RoomTypes;

const run = ['config', 'DS', function (config, DS) {
    Whiteboard = DS.defineResource({
        name: RESOURCE_NAME,
        endpoint: RESOURCE_ENDPOINT,
        basePath: config.apiServer,
        bypassCache: true,
        cacheResponse: false
    });
    WhiteboardItem = DS.defineResource({
        name: RESOURCE_NAME_WHITEBOARDITEM,
        endpoint: RESOURCE_ENDPOINT,
        basePath: config.apiServer,
        bypassCache: true,
        cacheResponse: false
    });
    Capacities = DS.defineResource({
        name: RESOURCE_NAME_CAPACITIES,
        endpoint: RESOURCE_ENDPOINT_CAPACITIES,
        basePath: config.apiServer,
        relations: {
            belongsTo: {
                company: {
                    localField: 'company',
                    localKey: 'companyId',
                    parent: true
                }
            }
        }
    });
    WhiteboardDiet = DS.defineResource({
        name: RESOURCE_NAME_WHITEBOARDDIET,
        endpoint: RESOURCE_ENDPOINT,
        basePath: config.apiServer,
        bypassCache: true,
        cacheResponse: false
    });
    RoomConfiguration = DS.defineResource({
        name: RESOURCE_NAME_ROOM_CONFIGURATION,
        endpoint: RESOURCE_ENDPOINT_ROOM_CONFIGURATION,
        basePath: config.apiServer,
        bypassCache: true,
        cacheResponse: false
    });
    RoomTypes = DS.defineResource({
        name: RESOURCE_NAME_ROOM_TYPES,
        endpoint: RESOURCE_ENDPOINT_ROOM_TYPES,
        basePath: config.apiServer,
        bypassCache: true,
        cacheResponse: false
    });

}];


dataServiceWhiteboard.$inject = ['$q', '$http', '$filter', 'config', 'DS', 'helpers'];
function dataServiceWhiteboard($q, $http, $filter, config, DS, helpers) {

    var DEFAULT_REQUEST_TIMEOUT = 5000; // 5s
    var apiRequestTimeout = config.apiRequestTimeout || DEFAULT_REQUEST_TIMEOUT;
    var baseURL = config.apiServer;

    // modify/adjust "Whiteboard" model
    Whiteboard.afterFindAll = function (Resource, data) {
        return _deserialize(data);
    };
    WhiteboardItem.beforeUpdate = function (Resource, data) {
        return _serialize(data);
    };
    WhiteboardItem.afterUpdate = function (Resource, data) {
        return _deserialize(data);
    };
    /*
    Whiteboard.beforeCreate = function(Resource, data) {
        return _serialize(data);
    };*/

    var service = {
        // Constants
        // Properties

        // Methods
        isWhiteboardAvailable: isWhiteboardAvailable,
        isRoomConfigurationAvailable: isRoomConfigurationAvailable,
        getWhiteboard: getWhiteboard,
        updateWhiteboardItem: updateWhiteboardItem,
        getNurses: getNurses,
        getAvailableServices: getAvailableServices,
        getWhiteboardPdf: getWhiteboardPdf,
        getRoomCapacities: getRoomCapacities,
        getPhysiciansArrayFromAutocompleteStorage: getPhysiciansArrayFromAutocompleteStorage,
        addPhysiciansToTheAutocompleteStorage: addPhysiciansToTheAutocompleteStorage,
        getDietCatalog: getDietCatalog,
        getAllRoomTypes: getAllRoomTypes,
        getRoomConfiguration: getRoomConfiguration,
        updateRoomConfiguration: updateRoomConfiguration
    };

    var _physicianAutoCompleteStorage = [];

    return service;

    // --------------------------------------------------------------- Interface implementation

    function addPhysiciansToTheAutocompleteStorage(physicianArray) {
        _.each(physicianArray, function (physician) {
            if (_.indexOf(_physicianAutoCompleteStorage, physician) === -1) {
                _physicianAutoCompleteStorage.push(physician);
            }
        });
    }

    function getPhysiciansArrayFromAutocompleteStorage() {
        return _physicianAutoCompleteStorage;
    }

    function getAvailableServices(companyId) {
        var endpoint = RESOURCE_ENDPOINT + '/companies/' + companyId + '/services';
        var url = baseURL + '/' + endpoint;

        var deferred = $q.defer();
        $http({
            method: 'get',
            url: url,
            timeout: apiRequestTimeout
        }).then(function (response) {
            try {
                deferred.resolve(response.data);
            } catch (error) {
                error.response = response.data;
                deferred.reject(error);
            }
        }).catch(function (error) {
            deferred.reject(error);
        });

        return deferred.promise;
    }

    function isWhiteboardAvailable(params) {
        var endpoint = RESOURCE_ENDPOINT + '/companies/' + params.companyId + '/services/' + params.hospService + '/enabled';
        var url = baseURL + '/' + endpoint;

        var deferred = $q.defer();
        $http({
            method: 'get',
            url: url,
            timeout: apiRequestTimeout
        }).then(function (response) {
            try {
                deferred.resolve(response.data);
            } catch (error) {
                error.response = response.data;
                deferred.reject(error);
            }
        }).catch(function (error) {
            deferred.reject(error);
        });

        return deferred.promise;
    }

    /**
     * Verify if Room Configuration is enabled for a given company and service
     * @param {*} params
     */
    function isRoomConfigurationAvailable(params) {
        var endpoint = RESOURCE_ENDPOINT + '/companies/' + params.companyId + '/services/' + params.serviceCode + '/rooms/configuration/enabled';
        var url = baseURL + '/' + endpoint;

        var deferred = $q.defer();
        $http({
            method: 'get',
            url: url,
            timeout: apiRequestTimeout
        }).then(function (response) {
            try {
                deferred.resolve(response.data);
            } catch (error) {
                error.response = response.data;
                deferred.reject(error);
            }
        }).catch(function (error) {
            deferred.reject(error);
        });

        return deferred.promise;
    }

    /**
     * Get PDF file with current Patient List report
     * @returns {*}
     */
    function getWhiteboardPdf(params) {
        var documentUrl;

        documentUrl = baseURL + '/' + RESOURCE_ENDPOINT + '/companies/' + params.companyId + '/services/' + params.hospService + '/print?language=' + params.language;
        if(params.date){
            documentUrl = documentUrl + '&date=' + params.date;
        }
        if(params.occupancy){
            documentUrl = documentUrl + '&occupancy=' + params.occupancy;
        }

        return $http.get(documentUrl, {
            responseType: 'blob'
        }).then(function (response) {
            var filename = _getFilename(response);
            return {
                data: response.data,
                filename: filename
            }
        }).catch(function (error) {
            console.log('Error loading pdf document:', error);
            return error;
        });
    }

    function getNurses(params) {
        var endpoint = RESOURCE_ENDPOINT + '/companies/' + params.companyId + '/services/' + params.hospService + '/nurses';
        var url = baseURL + '/' + endpoint;

        var deferred = $q.defer();
        $http({
            method: 'get',
            url: url,
            timeout: apiRequestTimeout
        }).then(function (response) {
            var data;
            try {
                data = _.filter(response.data, function (entry) {
                    return entry.length >= 1;
                });
                deferred.resolve(data);
            } catch (error) {
                error.response = response.data;
                deferred.reject(error);
            }
        }).catch(function (error) {
            deferred.reject(error);
        });

        return deferred.promise;
    }

    function getWhiteboard(params) {
        var LIMIT_MAX = 10000; // if no limit is defined, it is used 10 by default
        var endpoint = RESOURCE_ENDPOINT + '/companies/' + params.companyId + '/services/' + params.hospService;
        if (params && params.filterCriteria) {
            endpoint += '?occupancy=' + params.filterCriteria;
        }

        return Whiteboard
            .findAll({
                limit: LIMIT_MAX,
                date: params.date,
                offset: 0
            }, {
                    endpoint: endpoint,
                    bypassCache: true,
                    cacheResponse: false
                })
            .then(function (data) {
                // filter results
                // TODO: make it more "pluggable"
                _filterWhiteboardResults(params, data);

                // Create the array with physicians for the auto complete
                _createPhysiciansArrayForAutocomplete(data.entries);
                return data.entries;
            })
            .catch(function () {
                return null;
            });
    }

    function updateRoomConfiguration(params, roomConfiguration) {
        var endpoint = RESOURCE_ENDPOINT + '/companies/' + params.companyId + '/services/' + params.serviceCode + RESOURCE_ENDPOINT_ROOM_CONFIGURATION;
        var url = baseURL + '/' + endpoint;

        return $http.put(url, roomConfiguration, {
            timeout: apiRequestTimeout
        })
            .then(function (response) {
                return response.data;
            });
    }

    function getRoomCapacities(params) {
        return Capacities.findAll({
            companyId: params.companyId,
            hospservice: params.hospService,
            patientunit: params.patientUnit
        }, {
                bypassCache: true,
                cacheResponse: false
            })
            .then(function (response) {
                return response.capacities;
            })
            .catch(function (exception) {
                return $q.reject(exception.data);
            });
    }

    function updateWhiteboardItem(item, params) {
        var endpoint = RESOURCE_ENDPOINT + '/companies/' + params.companyId + '/services/' + params.hospService;

        return WhiteboardItem.update('', item, {
            endpoint: endpoint
        });
    }

    function getDietCatalog(params) {
        var endpoint = RESOURCE_ENDPOINT + '/companies/' + params.companyId + '/services/' + params.hospService + RESOURCE_ENDPOINT_WHITEBOARDDIET;

        var filter = {};
        if (params.lang) {
            filter['lang'] = params.lang;
        }

        return WhiteboardDiet
            .findAll(filter, { endpoint: endpoint })
            .then(function (data) {
                return data;
            })
            .catch(function () {
                return null;
            });
    }

    function getAllRoomTypes(params) {
        var endpoint = RESOURCE_ENDPOINT + '/companies/' + params.companyId + '/services/' + params.serviceCode + RESOURCE_ENDPOINT_ROOM_TYPES;

        return RoomTypes.findAll({}, {
            endpoint: endpoint,
            bypassCache: true,
            cacheResponse: false
        })
            .then(function (roomTypes) {
                return roomTypes;
            })
            .catch(function (exception) {
                return $q.reject(exception.data);
            });
    }

    function getRoomConfiguration(params) {
        var endpoint = RESOURCE_ENDPOINT + '/companies/' + params.companyId + '/services/' + params.serviceCode + RESOURCE_ENDPOINT_ROOM_CONFIGURATION;

        return RoomConfiguration.findAll({}, {
            endpoint: endpoint,
            bypassCache: true,
            cacheResponse: false
        })
            .then(function (roomConfiguration) {
                return roomConfiguration;
            })
            .catch(function (exception) {
                return $q.reject(exception.data);
            });
    }

    // -------------------------------------------------------- Helper functions

    function _createPhysiciansArrayForAutocomplete(whiteboardData) {
        _.each(whiteboardData, function (whiteboardEntry) {
            addPhysiciansToTheAutocompleteStorage(whiteboardEntry.physician);
            addPhysiciansToTheAutocompleteStorage(whiteboardEntry.editedPhysician);
        });
    }

    /**
     * Get filename from response (in the header)
     * @param response
     * @returns {string} Return filename in the response header, or a default value if not found.
     * @private
     */
    function _getFilename(response) {
        var DEFAULT_FILENAME = 'PatientList-' + $filter('formatDate')(moment(), 'date') + '.pdf';
        var filename = DEFAULT_FILENAME;
        var contentDisposition = response.headers('Content-Disposition');
        if (contentDisposition && contentDisposition.indexOf('attachment') !== -1) {
            var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
            var matches = filenameRegex.exec(contentDisposition);
            if (matches != null && matches[1]) {
                filename = matches[1].replace(/['"]/g, '');
            }
        }
        return filename;
    }

    /**
     * Filter Whiteboard results
     * (eg: for ... clinic, remove patients assigned to room 0
     * @param params
     * @param data
     * @private
     */
    function _filterWhiteboardResults(params, data) {
        // SPECIFIC TO
        var COMPANY_ID_ANY = 5;
        if (params.companyId === COMPANY_ID_ANY) {
            data.entries = data.entries.filter(function (item) {
                return item.room !== "0";
            });
        }
    }

    // -------------------------------------------------------- Serialization / Deserialization

    function _serialize(data) {
        if (_.isObject(data)) {
            // Serialize properties before data item is returned
            if (data.editedPhysician && data.editedPhysician.length == 0) data.editedPhysician = null;
        }
        return data;
    }

    function _deserialize(data) {
        if (data.entries && _.isArray(data.entries)) {
            // Apply deserialization on all items in the array
            data.entries.map(function (item) {
                return _deserialize(item);
            });
        } else if (_.isObject(data)) {
            // Deserialize properties before data item is returned
            if (data.admitDate) helpers.toDate(data, 'admitDate');
            if (data.dischargeDate) helpers.toDate(data, 'dischargeDate');
            if (data.operationDate) helpers.toDate(data, 'operationDate');
            if (data.birthDate) helpers.toDate(data, 'birthDate');
            if (data.editedDischargeDate) helpers.toDate(data, 'editedDischargeDate');
            if (data.editedOperationDate) helpers.toDate(data, 'editedOperationDate');
        }
        return data;
    }

}

export {
    dataServiceWhiteboard,
    run
}
