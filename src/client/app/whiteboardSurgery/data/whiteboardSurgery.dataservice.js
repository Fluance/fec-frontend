const RESOURCE_ENDPOINT = 'surgeryboard';

DataServiceWhiteboardSurgery.$inject = ['$http', '$q', 'config'];
function DataServiceWhiteboardSurgery($http, $q, config) {

    var DEFAULT_REQUEST_TIMEOUT = 5000; // 5s
    var apiRequestTimeout = config.apiRequestTimeout || DEFAULT_REQUEST_TIMEOUT;
    var baseURL = config.apiServer;

    var service = {
        getSurgeryboard: getSurgeryboard,
        setSurgeryboard: setSurgeryboard,
    };

    return service;

    // --------------------------------------------------------------- Interface implementation

    /**
     * Get the surgery board from the api
     * @param {*} params
     */
    function getSurgeryboard(params) {
        var endpoint = RESOURCE_ENDPOINT + '/' + params.companyId;
        var url = baseURL + '/' + endpoint;

        var deferred = $q.defer();

        if (_.isUndefined(params.companyId) || _.isUndefined(params.date)) {
            deferred.reject('Missing params!');
            return deferred.promise;
        }

        $http({
            method: 'get',
            url: url,
            timeout: apiRequestTimeout,
            params: {noteDate: params.date}
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
     * Save the surgery board
     * @param {*} params
     */
    function setSurgeryboard(params) {
        var endpoint = RESOURCE_ENDPOINT + '/' + params.companyId;
        var url = baseURL + '/' + endpoint;

        var deferred = $q.defer();

        if (_.isUndefined(params.companyId) || _.isUndefined(params.date)) {
            deferred.reject('Missing params!');
            return deferred.promise;
        }

        $http({
            method: 'put',
            url: url,
            timeout: apiRequestTimeout,
            params: {
                note: params.note,
                noteDate: params.date
            }
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
}

export default DataServiceWhiteboardSurgery;
