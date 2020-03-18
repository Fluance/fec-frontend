import template from './noteCategoryList.component-page.html';

const NoteCategoryPageList = {
    bindings: {
        pid: '<',
        vnb: '<'
    },
    controller: [
        '$q',
        '$translate',
        'noteService',
        'dataservice.notecategories',
        'sessionService',
        'userAgentService',
        controller
    ],
    templateUrl: template
};

function controller(
    $q,
    $translate,
    noteService,
    dataserviceNoteCategories,
    sessionService,
    userAgent
) {
    var ctrl = this;

    // events
    ctrl.$onInit = onInit;
    // interface
    ctrl.changeTab = changeTab;
    ctrl.isAllNotes = isAllNotes;
    ctrl.onChange = onChange;
    ctrl.markReadAll = markReadAll;
    ctrl.markUnreadAll = markUnreadAll;
    ctrl.isMobileSize = userAgent.isMobileSize;

    ctrl.categories = [];
    ctrl.categoryId = undefined;
    ctrl.currentTab = 'all-notes';
    ctrl.params = {};
    ctrl.totalRecords = 0;
    ctrl.hasNotesToRestore = false;

    // ------------------------------------------------------------------------- Event handling

    function onInit() {
        ctrl.isLoading = true;
        _loadCategories();
        _hasNotesToRestore();
    }

    function onChange(category) {
        ctrl.categoryId = category;
        ctrl.params.refreshTable();
    }

    // ------------------------------------------------------------------------- Helper functions
    /**
     *
     * @private
     */
    function _loadCategories() {
        var offset = 0;
        var limit = 1000;
        dataserviceNoteCategories
            .getNoteCategories(offset, limit)
            .then(function (categories) {
                var allCategory = {name: 'notes.ALL_CATEGORIES', id: undefined};
                ctrl.category = allCategory.id;
                ctrl.categories.push(allCategory);
                categories.forEach(function (category) {
                    ctrl.categories.push(category);
                });
            });
    }

    /**
     *
     * @private
     */
    function _hasNotesToRestore() {
        return noteService.getNotesToRestoreCount(ctrl.pid, ctrl.vnb)
            .then(function (count) {
                ctrl.hasNotesToRestore = (count && count >= 1) ? true : false;
            })
            .catch(function () {
                ctrl.hasNotesToRestore = false;
            });
    }

    /**
     *
     * @param selectedTab
     */
    function changeTab(selectedTab) {
        switch (selectedTab) {
            case 'all-notes':
                ctrl.currentTab = 'all-notes';
                break;
            case 'my-notes':
                ctrl.currentTab = 'my-notes';
                break;
        }
        ctrl.params.refreshTable();
    }

    /**
     * Return true if you are in tab 'All Notes'
     */
    function isAllNotes() {
        return ctrl.currentTab === 'all-notes' ? true : false;
    }

    /**
     * Mark all notes of one category as read
     */
    function markReadAll() {
        _markReadUnreadAll(true);
    }

    /**
     * Mark all notes of one category as unread
     */
    function markUnreadAll() {
        _markReadUnreadAll(false);
    }

    /**
     * Mark all notes of one category as unread
     */
    function _markReadUnreadAll(readAll) {
        $q.all([noteService.setNoteReadAll(ctrl.pid, ctrl.vnb, ctrl.categoryId, readAll, undefined, null),
                noteService.setNoteReadAll(ctrl.pid, ctrl.vnb, ctrl.categoryId, readAll, true, null)]
        ).then(function (data) {
            ctrl.params.refreshTable();
        });
    }
}

export default NoteCategoryPageList;
