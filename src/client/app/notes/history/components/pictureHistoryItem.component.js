import template from'./pictureHistoryItem.component.html';

const HISTORIES_LIMIT = 200;

const PictureHistoryItem = {
    bindings: {
        historyItem: '<',
        noteId: '<'
    },
    controller: ['dataservice.pictures', 'dataservice.history', '$filter', controller],
    templateUrl: template
};

function controller(dataservicePicture, dataServiceHistory, $filter) {
    var ctrl = this;

    ctrl.displayDetails = displayDetails;

    // ------------------------------------------------------------------- Interface operations

    function displayDetails() {
        // Load details when expanded
        if (ctrl.historyItem.isExpanded) {
            ctrl.historyItem.isLoadingDetails = true;
            _loadPictureHistoryItem();
        }
    }

    // --------------------------------------------------------------------------- Data loading

    function _getChanges(histories, picture) {
        var pictureChanges = {};
        var currentValues = {
            annotation: picture.annotation,
            deleted: picture.deleted,
            editedDate: picture.editedDate,
            fileName: picture.fileName,
            order: picture.order,
            pictureId: picture.pictureId,
            url: picture.url
        };
        if (histories && histories.length && picture) {
            dataservicePicture.getHistoryPicture(histories[0].historyId).then(function (history) {
                if (currentValues.annotation !== history.annotation) {
                    pictureChanges.annotation = history.annotation;
                }
                if (currentValues.order !== history.order) {
                    pictureChanges.order = history.order;
                }
                if (currentValues.deleted !== history.deleted) {
                    pictureChanges.deleted = history.deleted;
                }
                currentValues.previousValues = pictureChanges;

            }).finally(function () {
                ctrl.historyItem.noteId = ctrl.noteId;
                ctrl.historyItem.details = currentValues;
                ctrl.historyItem.isLoadingDetails = false;
            });
        } else {
            currentValues.isFirstItem = true;
            ctrl.historyItem.noteId = ctrl.noteId;
            ctrl.historyItem.details = picture;
            ctrl.historyItem.isLoadingDetails = false;
        }
    }

    function _loadPictureHistoryItem() {
        return dataservicePicture.getHistoryPicture(ctrl.historyItem.historyId).then(function (picture) {
            var params = {
                noteId: ctrl.noteId,
                resourcetype: ctrl.historyItem.resourceType,
                resourceid: picture.pictureId,
                beforedate: ctrl.historyItem.date,
                limit: HISTORIES_LIMIT
            };

            dataServiceHistory
                .getHistoryList(params)
                .then(function (data) {
                    _getChanges(data, picture);
                });
        });
    }
}

export default PictureHistoryItem;
