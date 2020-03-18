// SAMPLE USER AGENTS
const chrome_userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36";
const safari_userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/603.3.2 (KHTML, like Gecko) Version/10.1.2 Safari/603.3.2";
const firefox_userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.11; rv:55.0) Gecko/20100101 Firefox/55.0";
const ie_userAgent = "";
const edge_userAgent = "";

const iphone_userAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 7_0_3 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) Mobile/11B511";
const ipad_userAgent = "Mozilla/5.0 (iPad; U; CPU OS 3_2 like Mac OS X; en-us) AppleWebKit/531.21.10 (KHTML, like Gecko) Version/4.0.4 Mobile/7B334b Safari/531.21.10";
const android_userAgent = "Mozilla/5.0 (Linux; U; Android 2.3.1; en-us; MID Build/GINGERBREAD) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1";
const windows_userAgent = "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36";

// MOCK DATA
var openDeviceSessions = [];

// ----------------------------------------------------------

const RESOURCE_NAME = 'sessions';
const ENDPOINT_NAME = 'sessions';
let MultiSessions;

const run = ['config', 'DS', function(config, DS) {
    MultiSessions = DS.defineResource({
        name: RESOURCE_NAME,
        endpoint: ENDPOINT_NAME,
        basePath: config.apiAuth
    });
}];


MultiSessionDataService.$inject = ['$q', '$http', 'config', 'DS', 'helpers'];
function MultiSessionDataService($q, $http, config, DS, helpers) {

    // Wire-up data services
    MultiSessions.afterFind = function(Resource, data, cb) { return _deserialize(data); };
    MultiSessions.afterFindAll = function(Resource, data) { return _deserializeUserSessions(data, Resource.params.token); };

    var service = {
        getUserSessions: getUserSessions,
        getUserSessionsCount: getUserSessionsCount,
        logoutSession: logoutSession
    };

    return service;

    // --------------------------------------------------------------- Interface implementation

    function getUserSessions(token) {
        return MultiSessions
            .findAll({
                token: token
            }, {
                cacheResponse: false
            })
            .then(function(data) {
                return (_.isArray(data) && data.length > 0) ? data : [];
            })
            .catch(function (exception) {
                return [];
            });
    }

    function getUserSessionsCount(token) {
        return MultiSessions
            .findAll({
                token: token
            }, {
                endpoint: RESOURCE_NAME + '/count',
                cacheResponse: false
            })
            .then(function (data) {
                return !_.isNull(data) ? data : 0;
            })
            .catch(function (exception) {
                return 0;
            });
    }

    function logoutSession(token) {
        return $http({
            url: config.apiAuth + '/' + RESOURCE_NAME + '/logout',
            method: 'GET',
            params: {accessToken: token}
        });
    }

    // -------------------------------------------------------- Serialization / Deserialization

    function _deserializeUserSessions(data, token) {
        if (_.isArray(data)) {
            // Apply deserialization on all items in the array
            data.map(function (item) { return _deserializeUserSessions(item, token); });
        } else if (_.isObject(data)) {
            // Deserialize properties before data item is returned
            helpers.toDate(data, 'creationDate');
            helpers.toDate(data, 'expirationDate');
            if(data.id === token) {
                helpers.addProperty(data, 'current', true);
                helpers.addProperty(data, 'selected', true);
            } else {
                helpers.addProperty(data, 'selected', false);
            }
        }

        return data;
    }

}


export {
    MultiSessionDataService,
    run
};
