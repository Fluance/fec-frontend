const RESOURCE_NAME = 'treatment';
const ENDPOINT_NAME = 'treatments';

const run = ['config', 'DS', function (config, DS) {
    DS.defineResource({
        name: RESOURCE_NAME,
        endpoint: ENDPOINT_NAME,
        basePath: config.apiServer,
        relations: {
            belongsTo: {
                visit: {
                    localField: 'visit',
                    localKey: 'visitid'
                }
            }
        }
    });
}];

dataServiceChop.$inject = ['$http', 'DS'];

/**
 * @ngdoc service
 * @module app.icdChop
 * @name dataService.chop
 */
function dataServiceChop($http, DS) {

    var service = {
        getTreatmentList: getTreatmentList,
        hasTreatmentData: hasTreatmentData,
        getTreatmentListCount: getTreatmentListCount
    };

    return service;

    // --------------------------------------------------------------- Interface implementation

    /**
     * @ngdoc method
     * @name dataService.chop#getTreatmentList
     * @param  {String}   visitId           The visit number to get the treatments (CHOP) for
     * @param  {String}   language          The language in that the entries should be translated to
     * @return {Promise}                    Returns a pomise with the list of treatments (CHOP)
     * @description
     *
     * Returns a list of treatments (CHOP) for the specified visit.
     */
    function getTreatmentList(parameters, language) {
        return DS
            .findAll(RESOURCE_NAME, {
                lang: parameters.preferedLanguage,
                limit: parameters.pageSize,
                offset: parameters.pageOffset
            }, {
                endpoint: 'visits/' + parameters.visitNumber + '/' + ENDPOINT_NAME,
                bypassCache: true,
                cacheResponse: false
            });
    }

    function getTreatmentListCount(visitId) {
        return DS
            .findAll(RESOURCE_NAME, {}, {
                endpoint: 'visits/' + visitId + '/' + ENDPOINT_NAME + '/count',
                bypassCache: true,
                cacheResponse: false
            });
    }

    /**
     * @ngdoc method
     * @name dataService.chop#hasTreatmentData
     * @param  {String}   visitId           The visit number to get the count of treatments (CHOP) for
     * @return {Promise}                    Returns a pomise with the count of treatments (CHOP)
     * @description
     *
     * Gets the value indicating whether there are treatments (CHOP) for the specified visit.
     */
    function hasTreatmentData(visitId) {
        return DS
            .findAll(RESOURCE_NAME, {}, {
                endpoint: 'visits/' + visitId + '/' + ENDPOINT_NAME + '/count',
                bypassCache: true,
                cacheResponse: false
            })
            .then(function (data) {
                var hasData = false;
                hasData = _.isObject(data) && _.isNumber(data.count) && data.count > 0;

                return hasData;
            });
    }
}

export {
    dataServiceChop,
    run
}
