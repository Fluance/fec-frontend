// jscs:disable requireParenthesesAroundIIFE


NoteCategoryController.$inject = [
    '$scope',
    '$stateParams',
    //'LayoutPatientContextBox',
    '$q',
    'dataservice.notes',
    'dataservice.notecategories',
    'dataservice.pictures',
    'noteService',
    'noteCategoryService',
    'logger',
    'dataPager',
    'sessionService',
    //'tutorialService',
    'layoutService'
];

/* @ngInject */
function NoteCategoryController($scope, $stateParams, $q, dataserviceNotes, dataserviceNoteCategories,
    dataserviceNotePictures, noteService, noteCategoryService, logger, DataPager, sessionService, layoutService) {

    /*jshint validthis: true */
    var vm = this;
    vm.title = 'NoteCategoryController';

    vm.filterUnread = false;
    vm.filterOwn = false;

    // Filters
    var OWN_NOTE_FILTER = 'own_note_filter';
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

    vm.categoryId = $stateParams.categoryId;
    vm.patientId = $stateParams.pid;
    vm.visitNb = $stateParams.vnb;

    vm.applyFilter = applyFilter;
    vm.getNoteThumbnailList = getNoteThumbnailList;

    activate();

    // ------------------------------------------------------------------- Interface operations

    function activate() {
        _setScrollableContainerForInfiniteScroll();

        getCategory(vm.categoryId);

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
        return dataserviceNotePictures.getThumbnails(noteId);
    }

    // --------------------------------------------------------------------------- Data loading

    function loadPage(pageIndex, pageSize, sortBy, sortDirection) {
        var offset = pageIndex * pageSize;
        var limit = pageSize;
        var creator;

        return _loadNotesCount().then(function() {

            if (vm.filterOwn) {
                creator = sessionService.user.domain + '/' + sessionService.user.username;
            }
            return noteService.getNotes(vm.patientId, vm.visitNb, vm.categoryId, false, offset, limit, (vm.filterUnread ? false : null), false, creator);
        });
    }

    function _loadNotesCount() {
        var creator;

        if (vm.filterOwn) {
            creator = sessionService.user.domain + '/' + sessionService.user.username;
        }
        return noteService.getNotesCount(vm.patientId, vm.visitNb, vm.categoryId, false, (vm.filterUnread ? false : null), false, creator)
            .then(function(count) {
                console.log(count);
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
            element: 'fec-nav-filter',
            introKey: 'core.GUIDE_ORDER_SORT',
            position: 'bottom-middle-aligned'
        }, {
            element: 'fec-nav-add-note',
            introKey: 'notes.GUIDE_ADD_NOTE',
            position: 'bottom-middle-aligned'
        }, {
            element: 'fec-note-read-button',
            introKey: 'notes.GUIDE_READ_BUTTON',
            position: 'bottom-middle-aligned'
        }, {
            element: 'expander-accordion',
            introKey: 'notes.GUIDE_CATEGORY_LIST',
            position: 'auto'
        }, {
            element: 'fec-nav-read-unread',
            introKey: 'notes.GUIDE_NOTE_STATUS',
            position: 'auto'
        }, {
            element: 'fec-edit-icon',
            introKey: 'notes.GUIDE_NOTE_EDIT',
            position: 'auto'
        }, {
            element: 'fec-history-icon',
            introKey: 'notes.GUIDE_HISTORY_BUTTON',
            position: 'auto'
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

    function getCategory(categoryId) {
        return dataserviceNoteCategories
            .getNoteCategory(categoryId)
            .then(function(category) {
                vm.category = category;
            });
    }

    function _setScrollableContainerForInfiniteScroll() {
        // Scrollable container (relevant for infinite-scroll)
        vm.scrollableContainer = layoutService.getScrollableContainer();
    }

}


export default NoteCategoryController;
