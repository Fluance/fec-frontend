import template from './restoreNote.component.html';

const RestoreNote = {
    bindings: {
        note: '<',
        restoreNote: '&'
    },
    controller: ['$scope', function controller($scope) {}],
    templateUrl: template
};

export default RestoreNote;

