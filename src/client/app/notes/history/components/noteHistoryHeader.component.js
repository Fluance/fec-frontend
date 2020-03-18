import template from './noteHistoryHeader.component.html';

const NoteHistoryHeader = {
    bindings: {
        historyItem: '<'
    },
    controller: ['$filter', controller],
    templateUrl: template
};

function controller($filter) {
    var ctrl = this;

    ctrl.getEditorName = getEditorName;

    function getEditorName() {
        return (ctrl.historyItem && ctrl.historyItem.editor) ? $filter('avoidNullText')(ctrl.historyItem.editor.lastName) + ' ' + $filter('avoidNullText')(ctrl.historyItem.editor.firstName) : '-';
    }
}

export default NoteHistoryHeader;
