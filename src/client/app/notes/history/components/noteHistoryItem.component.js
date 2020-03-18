import template from './noteHistoryItem.component.html';

const HISTORIES_LIMIT = 200;

const NoteHistoryItem = {
    bindings: {
        historyItem: '<'
    },
    controller: ['dataservice.notes', 'dataservice.history', '$filter', controller],
    templateUrl: template
};

function controller(dataserviceNote, dataServiceHistory, $filter) {
    var ctrl = this;

    ctrl.displayDetails = displayDetails;

    // ------------------------------------------------------------------- Interface operations

    function displayDetails() {
        // Load details when expanded
        if (ctrl.historyItem.isExpanded) {
            ctrl.historyItem.isLoadingDetails = true;
            _loadNoteHistoryItem();
        }
    }

    // --------------------------------------------------------------------------- Data loading

    function _getChanges(histories, note) {
        var noteChanges = {};
        if (histories && histories.length && note) {
            dataserviceNote.getHistoryNote(histories[0].historyId).then(function (history) {
                if (note.shift !== history.shift) {
                    noteChanges.shift = history.shift;
                }
                if (note.title !== history.title) {
                    noteChanges.title = history.title;
                }
                if (note.description !== history.description) {
                    noteChanges.description = history.description;
                }

                if (note.editedDate !== history.editedDate) {
                    noteChanges.editedDate = history.editedDate;
                }
                if (note.category.name !== history.category.name) {
                    noteChanges.category = history.category;
                }
                note.previousValues = noteChanges;
            }).finally(function () {
                ctrl.historyItem.details = note;
                ctrl.historyItem.isLoadingDetails = false;
            });
        } else {
            note.isFirstItem = true;
            ctrl.historyItem.details = note;
            ctrl.historyItem.isLoadingDetails = false;
        }
    }

    function _loadNoteHistoryItem() {
        return dataserviceNote.getHistoryNote(ctrl.historyItem.historyId).then(function (note) {

            var params = {
                noteId: ctrl.historyItem.entityId,
                resourcetype: ctrl.historyItem.resourceType,
                beforedate: ctrl.historyItem.date,
                limit: HISTORIES_LIMIT
            };

            dataServiceHistory
                .getHistoryList(params)
                .then(function (data) {
                    _getChanges(data, note);
                });
        });
    }
}

export default NoteHistoryItem;
