
import _ from 'lodash';

ShiftNotesController.$inject = [
    '$scope',
    '$stateParams',
    'noteService',
    'noteCategoryService',
    'PictureService',
    'dataPager',
    'sessionService',
    //'LayoutPatientContextBox',
    //'tutorialService',
    'layoutService'
];

/* @ngInject */
function ShiftNotesController($scope, $stateParams, noteService,
    noteCategoryService, serviceNotePictures, DataPager,
    sessionService, layoutService) {

    /*jshint validthis: true */
    var vm = this;
    vm.title = 'ShiftNotesController';
    vm.categoryId;
    vm.filterUnread = false;

    // Filters
    var OWN_NOTE_FILTER = 'own_note_filter';
    var NOTE_CATEGORIES_FILTER = 'note_categories_filter';
    var READ_NOTE_FILTER = 'read_note_filter';

    // Paging
    vm.dataPager = new DataPager();
    vm.dataPager.pageSize = 20;
    vm.dataPager.loadPage = loadPage;

    // Operation methods
    vm.refresh = refresh;
    vm.canSort = function() {
        return vm.dataPager.items.length > 1;
    };

    vm.patientId = $stateParams.pid;
    vm.visitNb = $stateParams.vnb;

    vm.applyFilter = applyFilter;
    vm.getNoteThumbnailList = getNoteThumbnailList;

    activate();

    // ------------------------------------------------------------------- Interface operations

    function activate() {
        _setScrollableContainerForInfiniteScroll();

        /*
        if (tutorialService.isActive()) {
            // Configure tutorials
            configureTutorial();
            tutorialService.current(vm.title);
        }*/

        _configureFilter();

        // Load view
        refresh();
    }

    function applyFilter(filterId, filterModel) {
        switch (filterId) {
            case OWN_NOTE_FILTER:
                vm.filterOwn = filterModel;
                break;
            case NOTE_CATEGORIES_FILTER:
                vm.categoryId = filterModel !== 0 ? filterModel : undefined;
                break;
            case READ_NOTE_FILTER:
                vm.filterUnread = filterModel;
                break;
        }

        // Load view
        refresh();
        vm.dataPager.getNextPage();
    }

    function refresh() {
        vm.dataPager.reset();
    }

    function getNoteThumbnailList(noteId) {
        return serviceNotePictures.getThumbnails(noteId);
    }

    // --------------------------------------------------------------------------- Data loading

    function loadPage(pageIndex, pageSize, sortBy, sortDirection) {
        var offset = pageIndex * pageSize;
        var limit = pageSize;
        var creator;

        if (vm.filterOwn) {
            creator = sessionService.user.domain + '/' + sessionService.user.username;
        }

        _loadShiftNotesTotalCount();
        return noteService.getNotes(vm.patientId, vm.visitNb, vm.categoryId, false, offset, limit, (vm.filterUnread ? false : null), true, creator);
    }

    function _loadShiftNotesTotalCount() {
        var creator;
        if (vm.filterOwn) {
            creator = sessionService.user.domain + '/' + sessionService.user.username;
        }
        return noteService.getNotesCount(vm.patientId, vm.visitNb, vm.categoryId, false, (vm.filterUnread ? false : null), true, creator)
            .then(function(count) {
                vm.dataPager.setTotalItemsCount(count);
            })
            .catch(function() {
                vm.dataPager.setTotalItemsCount(0);
            });
    }

    // ------------------------------------------------------------------------------- Tutorial

    function configureTutorial() {
        var contextBoxSteps = ContextBox.getTutorialSteps();
        var steps = [{
            element: 'fec-nav-add-note',
            introKey: 'notes.GUIDE_ADD_NOTE',
            position: 'bottom-middle-aligned'
        }, {
            element: 'fec-note-read-button',
            introKey: 'notes.GUIDE_READ_BUTTON',
            position: 'bottom-middle-aligned'
        }, {
            element: 'expander-accordion',
            introKey: 'notes.GUIDE_SHIFT_NOTE_LIST',
            position: 'floating'
        }, ];

        tutorialService.setSteps(vm.title, 0, contextBoxSteps.concat(steps));
    }

    // ------------------------------------------------------------------- Helper methods

    function _configureFilter() {
        // Filters
        vm.filters = [];

        // Filter own notes
        vm.filters.push({
            id: OWN_NOTE_FILTER,
            label: 'notes.FILTER_OWN_NOTES',
            model: false,
            options: [{
                name: 'notes.ALL_NOTES',
                id: false
            }, {
                name: 'notes.OWN_NOTES',
                id: true
            }]
        });

        // Filter note categories
        noteCategoryService.getNoteCategories().then(function(noteCategories) {
            var noteCategoriesFilterOptions = [{
                name: 'notes.ALL_CATEGORIES',
                id: 0
            }];
            _.each(noteCategories, function(noteCategory) {
                noteCategoriesFilterOptions.push(noteCategory);
            });
            vm.filters.push({
                id: NOTE_CATEGORIES_FILTER,
                label: 'notes.FILTER_NOTES_CATEGORIES',
                model: 0,
                options: noteCategoriesFilterOptions
            });
        });

        // Filter read notes
        vm.filters.push({
            id: READ_NOTE_FILTER,
            label: 'notes.FILTER_READ_NOTES',
            model: false,
            options: [{
                name: 'notes.ALL_NOTES',
                id: false
            }, {
                name: 'notes.UNREAD_NOTES',
                id: true
            }]
        });
    }

    function _setScrollableContainerForInfiniteScroll() {
        // Scrollable container (relevant for infinite-scroll)
        vm.scrollableContainer = layoutService.getScrollableContainer();
    }

}


export default ShiftNotesController;
