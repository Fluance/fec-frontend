import template from './noteHistoryItemBody.component.html';

const NoteHistoryItemBody = {
    bindings: {
        noteId: '<',
        note: '<',
        notePictures: '<',
        pictureDisplayMode: '@',
        isDisabled: '<',
        hidePictures: '<',
        isExpanded: '<',
        isFirstItem: '<'
    },
    controller: [controller],
    templateUrl: template
};

function controller() {
    var ctrl = this;
}

export default NoteHistoryItemBody;
