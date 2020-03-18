import _ from 'lodash';
import template from './noteListItem.component.html';

const LAYOUT_DEFAULT = 'small';

const NoteListItem = {
    bindings: {
        noteItemLayout: '@',
        note: '<'
    },
    controller: ['dataservice.pictures', 'sessionService', 'config', controller],
    templateUrl: template
};

function controller(dataservicePictures, session, config) {
    var ctrl = this;

    ctrl.checkNoteItemLayout = checkNoteItemLayout;
    ctrl.getPictures = getPictures;
    ctrl.editionEnabled = editionEnabled;

    ctrl.$onInit = onInit;

    // ------------------------------------------------------------------------- Event handling

    function onInit() {
        // Initialize optional parameters
        if (!_.isString(ctrl.noteItemLayout)) { ctrl.noteItemLayout = LAYOUT_DEFAULT; }
    }

    // ------------------------------------------------------------------------- Helper methods
    function editionEnabled() {
        return !session.user.hasRole(config.accessControl.navigationComponents.fecNoteListItem.editonDisabledForRoles);
    }

    function checkNoteItemLayout(noteItemLayout) {
        return noteItemLayout === ctrl.noteItemLayout;
    }

    function getPictures() {
        return dataservicePictures.getPictures(ctrl.note.id);
    }
}

export default NoteListItem;
