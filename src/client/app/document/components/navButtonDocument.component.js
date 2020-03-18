
const NavButtonDocument = {
    bindings: {
        pid: '<',
        isEnabled: '<?'
    },
    controller: ['$q', 'DocumentService', controller],
    controllerAs: 'vm',
    template: '<fec-nav-button text="{{\'document.TITLE_LIST\' | translate}}" state="patientDocuments" state-params="{pid:vm.pid}" can-navigate="vm.canNavigate()" is-enabled="vm.isEnabled" />'
};

function controller($q, documentService) {
    var vm = this;
    vm.canNavigate = function () {
        return (vm.pid) ? documentService.hasDocumentData(vm.pid) : $q.resolve(false);
    };
}

export default NavButtonDocument;
