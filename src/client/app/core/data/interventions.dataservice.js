
const RESOURCE_NAME = 'intervention';
const ENDPOINT_NAME = 'intervention';

const run =['config', 'DS', function (config, DS) {
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


dataServiceInterventions.$inject = ['DS'];

function dataServiceInterventions(DS) {

    var service = {
        getInterventionsByVisitId: getInterventionsByVisitId,
        hasInterventionData: hasInterventionData
    };

    return service;

    function getInterventionsByVisitId(visitId) {
        return DS
            .findAll(RESOURCE_NAME, {}, {
                endpoint: 'visits/' + visitId + '/' + ENDPOINT_NAME,
                bypassCache: true,
                cacheResponse: false
            });
    }

    function hasInterventionData(visitId) {
        return DS
            .findAll(RESOURCE_NAME, {}, {
                endpoint: 'visits/' + visitId + '/' + ENDPOINT_NAME,
                bypassCache: true,
                cacheResponse: false
            })
            .then(function (data) {
                return !!data;
            });
    }
}

export {
    dataServiceInterventions,
    run
};
