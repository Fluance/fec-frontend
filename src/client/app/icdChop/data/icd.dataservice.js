const RESOURCE_NAME = 'diagnosis';
const ENDPOINT_NAME = 'diagnosis';

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

dataServiceIcd.$inject = ['DS'];

/**
 * @ngdoc service
 * @module app.icdChop
 * @name dataService.icd
 */
function dataServiceIcd(DS) {

    var service = {
        getDiagnosisList: getDiagnosisList,
        hasDiagnosisData: hasDiagnosisData,
        getDiagnosisListCount: getDiagnosisListCount
    };
    return service;


    // --------------------------------------------------------------- Interface implementation

    /**
     * @ngdoc method
     * @name dataService.icd#getDiagnosisList
     * @param  {String}   visitId           The visit number to get the diagnosis (ICD) for
     * @param  {String}   language          The language in that the entries should be translated to
     * @return {Promise}                    Returns a pomise with the list of diagnosis (ICD) entries
     * @description
     *
     */
    function getDiagnosisList(parameters, language) {

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

    function getDiagnosisListCount(visitId) {
        return DS
            .findAll(RESOURCE_NAME, {}, {
                endpoint: 'visits/' + visitId + '/' + ENDPOINT_NAME + '/count',
                bypassCache: true,
                cacheResponse: false
            });
    }

    /**
     * @ngdoc method
     * @name dataService.icd#hasDiagnosisData
     * @param  {String}   visitId           The visit number to get the count of diagnosis (ICD) entries for
     * @return {Promise}                    Returns a pomise with the count of diagnosis (ICD) entries
     * @description
     *
     * Gets the value indicating whether there are treatments (CHOP) for the specified visit.
     */
    function hasDiagnosisData(visitId) {
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
    dataServiceIcd,
    run
}
