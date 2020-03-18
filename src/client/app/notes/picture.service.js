import _ from 'lodash';

PictureService.$inject = ['$q', '$translate', 'dataservice.pictures', 'PictureStateHistoryService', 'AsyncPipelineBuilderService', 'AsyncPipelineFlowService', 'CheckListService'];

function PictureService($q, $translate, dataservicePictures, pictureStateHistoryService, asyncPipelineBuilder, asyncPipelineFlowService, checkListService) {
    var service = {
        processPictures: processPictures,
        getPicturesCount:getPicturesCount,
        getThumbnails: getThumbnails
    };

    return service;

    // ------------------------------------------------------------------ Interface functions

    function getThumbnails(noteId) {
        return dataservicePictures.getThumbnails(noteId);
    }

    function getPicturesCount(noteId) {
        return dataservicePictures.getPicturesCount(noteId);
    }

    function processPictures(note) {
        var element, pipeline;
        var flow = asyncPipelineFlowService.getFlow();

        if (!_.isObject(note) || !_.isNumber(note.id)) { return $q.reject(); }

        // no pictures to process
        if (!pictureStateHistoryService.hasHistory() && !pictureStateHistoryService.needsReordering()) {
            return $q.resolve();
        }

        element = {name: 'process-pictures-states', type: asyncPipelineBuilder.TYPE_IMPORT, fn: _processPicturesStates, params:[note] };
        asyncPipelineBuilder.processElement(element, flow);

        element = {name: 'process-pictures-order', type: asyncPipelineBuilder.TYPE_TASK, fn: _processPicturesOrder, params:[note.id] };
        asyncPipelineBuilder.processElement(element, flow);

        element = {name: 'process-pictures', type: asyncPipelineBuilder.TYPE_SEQUENCE, tasks:['process-pictures-states', 'process-pictures-order']};
        pipeline = asyncPipelineBuilder.processElement(element, flow);

        return pipeline;
    }

    // ------------------------------------------------------------------ Helper function

    function _processPicturesStates(note) {
        // no pictures to process
        if (!pictureStateHistoryService.hasHistory()) {
            return $q.resolve();
        }

        var pictureHistoryGrouped = pictureStateHistoryService.getHistoryGroupedByPictures(),
            flow = asyncPipelineFlowService.getFlow(),
            history, picture,
            tasksForPictureStatesByName = [],
            tasksForPicturesByName = [],
            element,
            pipeline;

        for (var i = 0; i < pictureHistoryGrouped.length; i++) {
            picture = pictureHistoryGrouped[i].picture;
            history = pictureHistoryGrouped[i].history;

            // create sequential pipeline for each picture (states)
            tasksForPictureStatesByName = [];
            for(var j = 0; j < history.length; j++) {
                element = {name:"process-picture-" + i + "-state-"+j, type: asyncPipelineBuilder.TYPE_TASK, fn:_processPicture, params:[note, picture, history[j].state]};
                asyncPipelineBuilder.processElement(element, flow);
                tasksForPictureStatesByName.push(element.name);
            }

            // create task per picture (from sequential pipeline for picture states)
            element = {name:"process-picture-" + i, type: asyncPipelineBuilder.TYPE_SEQUENCE, tasks:tasksForPictureStatesByName};
            asyncPipelineBuilder.processElement(element, flow);

            // list of tasks (with sequential pipelines) for pictures
            tasksForPicturesByName.push(element.name);

            // add to check list
            checkListService.addTask(element.name, $translate.instant('notes.CHECKLIST_SAVE_PICTURE'), picture);
        }

        // create group (parallel) pipeline with all pictures main tasks
        element = {name:"process-pictures-states-all", type: asyncPipelineBuilder.TYPE_GROUP, tasks: tasksForPicturesByName};
        pipeline = asyncPipelineBuilder.processElement(element, flow);

        return pipeline;
    }

    function _processPicturesOrder(noteId) {
        // no pictures to reorder
        if (!pictureStateHistoryService.needsReordering()) {
            return $q.resolve();
        }

        return _reorderPictures(noteId);
    }

    /**
     * Save a picture. Decide if picture needs to be created, updated, restored and/or deleted.
     * @param note
     * @param picture
     * @returns {*}
     * @private
     */
    function _processPicture(note, picture, state) {
        var promise;

        switch (state) {
            case pictureStateHistoryService.STATE_CREATED:
                var newPictureMetadata = {
                    noteId: note.id,
                    fileName: picture.file.name,
                    annotation: picture.annotation,
                    referenceDate: note.referenceDate,
                    order: picture.order
                };
                promise = dataservicePictures.createPicture(newPictureMetadata, picture.file)
                    .then(function(newPicture) {
                        // set id of new picture
                        picture.pictureId = newPicture.pictureId;
                        picture.noteId = newPicture.noteId;
                    });
                break;
            case pictureStateHistoryService.STATE_MODIFIED:
                // save metadata
                promise = dataservicePictures.updatePicture(picture);
                break;
            case pictureStateHistoryService.STATE_DELETED:
                // delete picture
                promise = dataservicePictures.deletePicture(picture);
                break;
            case pictureStateHistoryService.STATE_RESTORED:
                // restore picture
                promise = dataservicePictures.restorePicture(picture);
                break;
        }

        return promise;
    }

    function _reorderPictures(noteId) {
        var picturesOrder = pictureStateHistoryService.getPicturesOrder();
        return dataservicePictures.orderPictures(noteId, picturesOrder);
    }
}

export default PictureService;
