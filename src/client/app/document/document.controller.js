DocumentController.$inject = ['$stateParams', '$translate', '$mdDialog', 'dataservice.documents', 'sessionService'];

function DocumentController($stateParams, $translate, $mdDialog, documentsDataService, session) {
    var ctrl = this;

    init();

    // -------------------------------------------------------------------

    function init() {
        ctrl.pid = $stateParams.pid;
        ctrl.resetResults = true;

        // Load view
        loadTotalCount();
    }

    // --------------------------------------------------------------------------- Data loading

    function loadTotalCount() {
        var params = {
            pid: ctrl.pid
        };

        ctrl.isLoading = true;
        return documentsDataService.getDocumentsCount(params)
            .then(function(count) {
                ctrl.totalItemsCount = count;
            })
            .catch(function(error) {
                ctrl.totalItemsCount = 0;
            })
            .finally(function() {
                ctrl.isLoading = false;
            });
    }
}

export default DocumentController;
