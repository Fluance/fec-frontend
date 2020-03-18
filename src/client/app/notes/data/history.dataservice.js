// Resources
const RESOURCE_NAME = 'history';
const ENDPOINT_NOTES_NAME = 'notes/history';
let History;

const run =['config', 'DS', function (config, DS) {
    History = DS.defineResource({
        name: RESOURCE_NAME,
        endpoint: ENDPOINT_NOTES_NAME,
        idAttribute: 'compoundId',
        basePath: config.apiServerNotes,
        computed: {
            compoundId: ['resourceType', 'historyId', function (resourceType, historyId) {
                return resourceType + '-' + historyId;
            }],
            editorName: ['editor', function (editor) {
                return editor.lastName + ' ' + editor.firstName;
            }]
        },
        bypassCache: true,
        cacheResponse: false
    });
}];

dataServiceHistory.$inject = ['$q'];

function dataServiceHistory($q) {

    var service = {
        countHistoryItems: countHistoryItems,
        getHistoryList: getHistoryList
    };

    return service;

    // --------------------------------------------------------------- Interface implementation

    function getHistoryList(params) {
        return History
            .findAll({
                noteid: params.noteId,
                resourcetype: params.resourcetype,
                resourceid: params.resourceid,
                beforedate: params.beforedate,
                offset: params.offset || 0,
                limit: params.limit || 5
            })
            .then(function (data) {
                return (_.isArray(data) && data.length > 0) ? data : [];
            });
    }

    function countHistoryItems(noteId) {
        return History
            .findAll({
                noteid: noteId
            }, {
                endpoint: ENDPOINT_NOTES_NAME + '/count'
            });
    }
}

export {
    dataServiceHistory,
    run
};
