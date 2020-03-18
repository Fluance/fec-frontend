/* @ngInject */
patientIdSelectionDialogService.$inject = ['$q'];

function patientIdSelectionDialogService($q) {
    var service = {
        select: select
    };

    return service;

    function select() {
        var selection = prompt('choose patient id');

        return $q.resolve(selection);
    }
}

export default patientIdSelectionDialogService;
