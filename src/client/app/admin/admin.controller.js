import $ from 'jquery';

AdminController.$inject = ['$rootScope', '$scope', 'config', 'logger'];

/* @ngInject */
function AdminController($rootScope, $scope, config, logger) {
    var vm = this;
    vm.title = 'Admin';
    vm.logger = logger;

    vm.profileSelected = true;
    vm.logsSelected = false;
    vm.configSelected = false;
    // Functions for the UI sorted by name
    activate();

    // DEPRECATED??
    //Setup tooltips
    //$rootScope.$on('$viewContentLoaded', function() {
    //    $('ul.tabs').tabs();
    //});

    function activate() {
        // we reset scrolllTopLimit to 1000 pixels.
        $scope.$on('$destroy', function() {
            config.scrollTopLimit = 1000;
        });
    }
}

export default AdminController;
