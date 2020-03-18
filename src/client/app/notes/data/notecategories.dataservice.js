// Resources
const RESOURCE_NAME = 'category';
const ENDPOINT_NAME = 'notes/categories';
let Category;

const run = ['config', 'DS', function(config, DS) {
    Category = DS.defineResource({
        name: RESOURCE_NAME,
        endpoint: ENDPOINT_NAME,
        idAttribute: 'id',
        basePath: config.apiServerNotes,
    });
}];

dataServiceNoteCategories.$inject = [];

function dataServiceNoteCategories() {

    var service = {
        getNoteCategories: getNoteCategories,
        getNoteCategory: getNoteCategory
    };

    return service;

    // --------------------------------------------------------------- Interface implementation

    function getNoteCategories(offset, limit) {
        return Category
            .findAll({
                offset: offset || 0,
                limit: limit || 5
            })
            .then(function(data) {
                if (_.isArray(data) && data.length > 0) {
                    data = _.orderBy(data, 'name', 'asc');
                    return data;
                } else {
                    return [];
                }
            });
    }

    function getNoteCategory(noteCategoryId) {
        return Category
            .find(noteCategoryId);
    }
}

export {
    dataServiceNoteCategories,
    run
}
