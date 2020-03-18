import _ from 'lodash';

function PictureStateHistoryService() {

    // picture states
    const STATE_CREATED = 'created',
          STATE_MODIFIED = 'modified',
          STATE_DELETED = 'deleted',
          STATE_RESTORED = 'restored';

    let history,
        nextHistoryId,
        picturesOrder;

    var service = {
        STATE_CREATED: STATE_CREATED,
        STATE_MODIFIED: STATE_MODIFIED,
        STATE_DELETED: STATE_DELETED,
        STATE_RESTORED: STATE_RESTORED,
        resetHistory: resetHistory,
        getHistory: getHistory,
        getHistoryGroupedByPictures: getHistoryGroupedByPictures,
        hasHistory: hasHistory,
        removeFromHistory: removeFromHistory,
        created: created,
        deleted: deleted,
        modified: modified,
        restored: restored,
        reorderPictures: reorderPictures,
        getPicturesOrder: getPicturesOrder,
        needsReordering: needsReordering
    };

    init();

    return service;

    // ------------------------------------------------------------------

    function init() {
        resetHistory();
    }

    // ------------------------------------------------------------------

    function resetHistory() {
        history = [];
        nextHistoryId = 1;
        picturesOrder = null;

    }

    function getHistory() {
        return history;
    }

    function getHistoryGroupedByPictures() {
        var historyGrouped = [];

        // -- Create history grouped by picture --
        // value = {state: 'create', picture: picture}
        // eg:
        // P1 = {}
        // P2 = {}
        //
        // history = [
        //   {state: 'create', picture: P1 ,
        //   {state: 'create', picture: P2},
        //   {state: 'delete', picture: P1},
        //   {state: 'restore', picture: P1},
        //   {state: 'update', picture: P2},
        //   {state: 'update', picture: P1}
        // ]
        //
        // historyGrouped = [
        //   { picture: P1, states: ['create', 'delete', 'restore', 'update']},
        //   { picture: P2, states: ['create', 'update']}
        // }

        _.reduce(history, function(historyGroupedByPictures, value) {
            // look for picture in grouped history
            var historyItem = _.find(historyGroupedByPictures, {'picture': value.entity});

            // add picture to grouped history
            if(!historyItem) {
                historyItem = {
                    picture: value.entity,
                    history: []
                };
                historyGroupedByPictures.push(historyItem);
            }

            // add state to list of states of picture
            historyItem.history.push(
                {
                    'historyId': value.historyId,
                    'state' :value.state
                }
            );

            return historyGroupedByPictures;
        }, historyGrouped);

        return historyGrouped;
    }

    function removeFromHistory(historyId) {
        _removeByHistoryId(historyId);
    }

    function hasHistory() {
        return _.size(history) > 0;
    }

    function created(picture) {
        _add(picture, STATE_CREATED);
    }

    function deleted(picture) {
        // verify if "restore" is already in history => YES: remove "restore" from history, NO: add "delete" to history
        var restored = _findEntity(picture, STATE_RESTORED);
        if(!restored) {
            _add(picture, STATE_DELETED);
        } else {
            _removeByHistoryId(restored.historyId);
        }
    }

    function modified(picture) {
        // verify if already in history
        if(!_findEntity(picture, STATE_MODIFIED) && !_findEntity(picture, STATE_CREATED)) {
            _add(picture, STATE_MODIFIED);
        }
    }

    function restored(picture) {
        var deleted = _findEntity(picture, STATE_DELETED);
        if(!deleted) {
            _add(picture, STATE_RESTORED);
        }
        else {
            _removeByHistoryId(deleted.historyId);
        }
    }

    function reorderPictures(pictures) {
        picturesOrder = pictures;
    }

    function getPicturesOrder() {
        var pictureIds = [];

        // adjust picture ordering
        _.each(picturesOrder, function(picture) {
                pictureIds.push(picture.pictureId);
        });

        return pictureIds;
    }

    function needsReordering() {
        return _.isArray(picturesOrder) && _.size(picturesOrder) > 0;
    }

    // -------------------------------------------------------------- Helper methods

    function _findPosition(entity, state) {
        return _.findIndex(history, function(h) { return h.entity === entity && h.state === state});
    }

    function _findPositionByHistoryId(historyId) {
        return _.findIndex(history, { 'historyId': historyId });
    }

    function _findEntity(entity, state) {
        return _.find(history, function(h) { return h.entity === entity && h.state === state; });
    }

    function _findEntityByHistoryId(historyId) {
        return _.find(history, { 'historyId': historyId });
    }


    function _nextHistoryId() {
        return nextHistoryId++;
    }

    function _add(entity, state) {
        var historyId = _nextHistoryId();
        history.push({
            historyId: historyId,
            state: state,
            entity: entity
        });
        return historyId;
    }

    function _removeByHistoryId(historyId) {
        var pos = _findPositionByHistoryId(historyId);
        _.pullAt(history, [pos]);
    }
}

export default PictureStateHistoryService;
