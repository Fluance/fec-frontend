import template from './noteReadFilter.component.html';

const NoteReadFilter = {
    bindings: {
        filterUnread: '='
    },
    controller: ['$q', 'dataservice.notes', 'noteService', controller],
    controllerAs: 'vm',
    templateUrl: template
};

function controller($q, dataserviceNotes, noteService) {
    var vm = this;
    vm.isFiltered = false;

    vm.getFilterLabel = getFilterLabel;
    vm.toggleFilterUnread = toggleFilterUnread;

    // ------------------------------------------------------------------------- Event handling

    function getFilterLabel() {
        return vm.isFiltered ? 'notes.UNREAD_NOTES' : 'notes.ALL_NOTES';
    }

    function toggleFilterUnread() {
        if (vm.filterUnread !== undefined) {
            vm.filterUnread = !vm.filterUnread;
            vm.isFiltered = !vm.isFiltered;
        }
    }
}

export default NoteReadFilter;
