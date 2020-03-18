AdminLogsController.$inject = ['logger', 'config', '$translate'];

/* @ngInject */
function AdminLogsController(logger, config, $translate) {
    /*jshint validthis: true */
    var vm = this;
    vm.title = 'Settings Controller';
    vm.logger = logger;
    vm.logWebInterfaceURL = config.logWebInterfaceURL;

    // Functions for the UI sorted by name
    vm.sendTestQuery = sendTestQuery;

    return vm;

    // --------------------------------------------------------------- Interface implementation

    function sendTestQuery(char) {
        switch (char) {
            case 'e':
                logger.error(
                    $translate.instant('admin.FAKE_ERROR'),
                    null,
                    $translate.instant('admin.TITLE_TEST_ERROR'),
                    false);
                break;
            case 'i':
                logger.info(
                    $translate.instant('admin.FAKE_LOGGER_INFO'),
                    $translate.instant('admin.TITLE_TEST_INFO'),
                    false);
                break;
            case 'w':
                logger.warning(
                    $translate.instant('admin.FAKE_WARNING'),
                    $translate.instant('admin.TITLE_FAKE_WARNING'),
                    false);
                break;
            case 's':
                logger.success(
                    $translate.instant('admin.FAKE_SUCCESS'),
                    $translate.instant('admin.TITLE_FAKE_SUCCESS'),
                    false);
                break;
        }
    }
}

export default AdminLogsController;
