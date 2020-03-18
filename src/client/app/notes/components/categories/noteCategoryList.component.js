import _ from 'lodash';
import template from './noteCategoryList.component.html';

const NoteCategoriesList = {
    bindings: {
        pid: '<',
        vnb: '<',
        params: '<',
        currentTab: '<',
        totalRecords: '=',
        isLoading: '=',
        unreadRecords: '=',
        shiftNotes: '@'
    },
    require: {
        fecNoteCategoryPageList: '^fecNoteCategoryPageList'
    },
    controller: [
        '$q',
        '$translate',
        'noteService',
        'sessionService',
        'PictureService',
        'userAgentService',
        'config',
        controller
    ],
    templateUrl: template
};

function controller(
    $q,
    $translate,
    noteService,
    session,
    pictureService,
    userAgent,
    config
) {
    var ctrl = this;

    ctrl.ALL_NOTES = 'allnotes';
    ctrl.MY_NOTES = 'my-notes';
    ctrl.UNREAD = 'unread';
    ctrl.SHIFT = 'shift';
    ctrl.HAS_PICTURES = 'hasPictures';

    ctrl.categoryId = 0;
    ctrl.filterNotes = undefined;
    ctrl.statusOptions = [
        {text: 'notes.UNREAD_NOTES', value: ctrl.UNREAD},
        {text: 'notes.SHIFT_NOTES', value: ctrl.SHIFT},
        {text: 'notes.NOTES_WITH_PICTURES', value: ctrl.HAS_PICTURES}
    ];
    ctrl.statusOptionsMobile = [
        {text: 'notes.UNREAD', value: ctrl.UNREAD},
        {text: 'notes.SHIFT', value: ctrl.SHIFT},
        {text: 'notes.WITH_PICTURES', value: ctrl.HAS_PICTURES}
    ];
    ctrl.isMobileSize = userAgent.isMobileSize;

    ctrl.filterUnread = false;
    ctrl.filterOwn = false;
    ctrl.filterShift = false;
    ctrl.filterHasPictures = false;

    ctrl.maxItemsBeforeScroll = 5;

    // events
    ctrl.$onInit = onInit;
    // interface
    ctrl.sortTable = sortTable;
    ctrl.applyFilter = applyFilter;
    ctrl.getCreatorName = getCreatorName;
    ctrl.getCountUnreadNotes = getCountUnreadNotes;
    ctrl.isAllNotes = isAllNotes;
    ctrl.isAllCategories = isAllCategories;
    ctrl.editionEnabled = editionEnabled;

    // ------------------------------------------------------------------------- Event handling
    function onInit() {
        ctrl.params.refreshTable = changeCategory;
        ctrl.isShiftNotes = !_.isUndefined(ctrl.shiftNotes);

        _buildDynamicItems(ctrl.pid);
    }

    // ------------------------------------------------------------------------- Helper functions
    function editionEnabled() {
        return !session.user.hasRole(config.accessControl.navigationComponents.fecNoteCategoryListActions.editonDisabledForRoles);
    }

    /**
     * Return the number of unread notes
     * @param notes
     */
    function getCountUnreadNotes(notes) {
        var count = 0;
        notes.forEach(function (note) {
            if (note && !note.read) {
                count++;
            }
        });
        return count;
    }

    /**
     * Return the name of creator note
     * @param user
     * @returns {string}
     */
    function getCreatorName(user) {
        var displayName = '-';
        if (user) {
            displayName = user.lastName;
            if (user.lastName && user.firstName && user.firstName[0]) {
                displayName = user.firstName[0].toUpperCase() + '. ' + user.lastName;
            } else if (user.firstName){
                displayName = user.firstName;
            } else {
                displayName = '-';
            }
        }
        return displayName;
    }

    /**
     * Return true if you are in 'All Categories'
     */
    function isAllCategories() {
        if (ctrl.fecNoteCategoryPageList && (!ctrl.fecNoteCategoryPageList.categoryId || ctrl.fecNoteCategoryPageList.categoryId === '0')) {
            ctrl.categoryId = 0;
            return true;
        } else {
            ctrl.categoryId = ctrl.fecNoteCategoryPageList.categoryId;
            return false;
        }
    }

    /**
     * Return true if you are in tab 'All Notes'
     */
    function isAllNotes() {
        return ctrl.currentTab === 'all-notes' ? true : false;
    }

    /**
     *  Events after change filter
     * @param filterId
     */
    function applyFilter(filterId) {
        switch (filterId) {
            case ctrl.UNREAD:
                ctrl.filterUnread = true;
                ctrl.filterShift = false;
                ctrl.filterHasPictures = false;
                break;
            case ctrl.SHIFT:
                ctrl.filterShift = true;
                ctrl.filterUnread = false;
                ctrl.filterHasPictures = false;
                break;
            case ctrl.HAS_PICTURES:
                ctrl.filterShift = false;
                ctrl.filterUnread = false;
                ctrl.filterHasPictures = true;
                break;
            default:
                ctrl.filterUnread = false;
                ctrl.filterShift = false;
                ctrl.filterHasPictures = false;
        }

        _buildDynamicItems(ctrl.pid);
    }

    /**
     *  Events after change category
     */
    function changeCategory() {
        var currentTab = ctrl.fecNoteCategoryPageList.currentTab;

        if (ctrl.MY_NOTES === currentTab) {
            ctrl.filterOwn = true;
            if (ctrl.filterNotes === ctrl.UNREAD) {
                ctrl.filterNotes = ctrl.ALL_NOTES;
            }
        } else {
            ctrl.filterOwn = false;
        }
        applyFilter(ctrl.filterNotes);
    }

    /**
     * Event after click in each column name
     * @param params
     */
    function sortTable(params) {
        _buildDynamicItems(ctrl.pid, params);
    }

    // ------------------------------------------------------------------------------------------
    // Getters used by the view to set the values of the placeholders and links in translations
    // ------------------------------------------------------------------------------------------
    function _buildDynamicItems(pid, params) {
        var DynamicItems = function (pid, params) {
            /**
             * @type {!Object<?Array>} Data pages, keyed by page number (0-index).
             */
            this.loadedPages = {};

            /** @type {number} Total number of items. */
            this.numItems = 0;

            /** @const {number} Number of items to fetch per request. */
            this.PAGE_SIZE = 20;

            this.fetchNumItems_();
        };

        // Required.
        DynamicItems.prototype.getItemAtIndex = function (index) {
            var pageNumber = Math.floor(index / this.PAGE_SIZE);
            var page = this.loadedPages[pageNumber];

            if (page) {
                return page[index % this.PAGE_SIZE];
            } else if (page !== null) {
                ctrl.isScrolling = true;
                this.fetchPage_(pageNumber, params);
            }
        };

        // Required.
        DynamicItems.prototype.getLength = function () {
            return this.numItems;
        };

        DynamicItems.prototype.fetchPage_ = function (pageNumber, params) {
            var self = this;
            ctrl.isLoading = true;
            // Set the page to null so we know it is already being fetched.
            this.loadedPages[pageNumber] = null;

            var currentCategory = ctrl.fecNoteCategoryPageList.categoryId;
            var creator;
            if (ctrl.filterOwn) {
                creator = session.user.domain + '/' + session.user.username;
            }

            var offset = pageNumber * this.PAGE_SIZE;
            var limit = this.PAGE_SIZE;


            var orderBy = undefined;
            var sortOrder = undefined;
            if (params) {
                orderBy = params.name;
                sortOrder = params.sortDesc ? 'desc' : 'asc';
            }

            var dataNotes;

            //TODO: parameter for the request methods "hasPictures" is pending
            if (ctrl.filterShift) {
                dataNotes = noteService.getNotes(ctrl.pid, null, currentCategory > 0 ? currentCategory : undefined, false, offset, limit, (ctrl.filterUnread ? false : null), (ctrl.filterHasPictures ? true : null), true, creator, orderBy, sortOrder);
            } else {
                dataNotes = noteService.getNotesWithoutTemporaryFilter(ctrl.pid, null, currentCategory > 0 ? currentCategory : undefined, false, offset, limit, (ctrl.filterUnread ? false : null), (ctrl.filterHasPictures ? true : null), creator, null, orderBy, sortOrder);
            }

            dataNotes.then(function (notes) {
                self.loadedPages[pageNumber] = notes;
                ctrl.isLoading = false;
                ctrl.isScrolling = false;
            }).catch(function () {
                self.loadedPages[pageNumber] = [];
                ctrl.isLoading = false;
                ctrl.isScrolling = false;
            });
        };

        DynamicItems.prototype.fetchNumItems_ = function () {
            var self = this;
            var creator;
            var currentCategory = ctrl.fecNoteCategoryPageList.categoryId;

            var serviceCallsCount = [];

            if (ctrl.filterOwn) {
                creator = session.user.domain + '/' + session.user.username;
            }

            //TODO: parameter for the count method "hasPictures" is pending

            if (ctrl.filterShift) {
                serviceCallsCount.push(noteService.getNotesCount(ctrl.pid, null, currentCategory > 0 ? currentCategory : undefined, false, (ctrl.filterUnread ? false : null), (ctrl.filterHasPictures ? true : null), true, creator));
                if (!ctrl.filterUnread) {
                    serviceCallsCount.push(noteService.getNotesCount(ctrl.pid, null, currentCategory > 0 ? currentCategory : undefined, false, false, true, (ctrl.filterHasPictures ? true : null), creator));
                }
            } else {
                serviceCallsCount.push(noteService.getNotesCountWithoutTemporaryFilter(ctrl.pid, null, currentCategory > 0 ? currentCategory : undefined, false, (ctrl.filterUnread ? false : null), (ctrl.filterHasPictures ? true : null), creator));
                if (!ctrl.filterUnread) {
                    serviceCallsCount.push(noteService.getNotesCountWithoutTemporaryFilter(ctrl.pid, null, currentCategory > 0 ? currentCategory : undefined, false, false, (ctrl.filterHasPictures ? true : null), creator));
                }
            }

            serviceCallsCount[0].then(function (count) {
                self.numItems = count;

                //Update the total records variables bind to component
                ctrl.totalRecords = count;

                if (ctrl.filterUnread) {
                    ctrl.unreadRecords = count;
                }
            }).catch(function () {
                self.numItems = null;
                ctrl.totalRecords = 0;
                if (ctrl.filterUnread) {
                    ctrl.unreadRecords = 0;
                }
            }).finally(function () {
                ctrl.isLoading = false;
            });

            if (!ctrl.filterUnread) {
                serviceCallsCount[1].then(function (count) {
                    ctrl.unreadRecords = count;
                }).catch(function () {
                    ctrl.unreadRecords = 0;
                });
            }

        };
        ctrl.dynamicItems = new DynamicItems(pid, params);
    }
}

export default NoteCategoriesList;
