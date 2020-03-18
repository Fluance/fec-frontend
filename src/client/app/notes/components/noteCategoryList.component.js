import _ from 'lodash';
import template from './noteCategoryList.component.html';

const LAYOUT_DEFAULT = 'small';

const NoteCategoryList = {
    bindings: {
        pid: '<',
        vnb: '<'
    },
    controller: ['noteService', 'dataservice.notecategories', controller],
    controllerAs: 'vm',
    templateUrl: template
};

function controller(noteService, dataserviceNoteCategories) {
    var vm = this;
    vm.categories = [];
    vm.hasShiftNotes = false;

    vm.$onInit = onInit;

    // ------------------------------------------------------------------------- Event handling

    function onInit() {
        _loadCategories();
        _hasShiftNotes();
    }

    // ------------------------------------------------------------------------- Helper functions

    function _loadCategories() {
        var offset = 0;
        var limit = 1000;
        dataserviceNoteCategories
            .getNoteCategories(offset, limit)
            .then(function(categories) {
                vm.categories = _filterCategoriesWithoutNotes(categories);
            });
    }

    function _filterCategoriesWithoutNotes(categories) {
        var returnValue = [];
        if (_.isArray(categories)) {
            _.each(categories, function(category) {
                noteService
                    .getNotesCount(vm.pid, vm.vnb, category.id)
                    .then(function(notesCounter) {
                        if (notesCounter >= 1) {
                            returnValue.push(category);
                        }
                    });
            });
            returnValue = _.sortBy(returnValue, 'priority');
        }
        return returnValue;
    }

    function _hasShiftNotes() {
        noteService
            .getNotesCount(vm.pid, vm.vnb, null, null, null, true)
            .then(function(notesCounter) {
                vm.hasShiftNotes = (notesCounter > 0);
            });
    }
}

export default NoteCategoryList;
