// jscs:disable requireParenthesesAroundIIFE
// Turn off jshint rules:
/*jshint -W101*/ //  Line too long

const LOCK_RESOURCE_TYPE = 'Note';

noteCategoryService.$inject = ['$q', '$filter', 'dataservice.notecategories'];

function noteCategoryService($q, $filter, dataServiceNoteCategories) {
    var service = {

        // API Functions
        // notes
        getNoteCategories: getNoteCategories
    };

    return service;

    // -------------------------------------------------------- Interface methods

    function getNoteCategories() {
        return dataServiceNoteCategories.getNoteCategories();
    }

    // -------------------------------------------------------- Helper methods
}

export default noteCategoryService;
