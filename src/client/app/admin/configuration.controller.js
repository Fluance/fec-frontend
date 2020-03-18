
AdminConfigurationController.$inject = ['config'];

/* @ngInject */
function AdminConfigurationController(config) {
    /*jshint validthis: true */
    var vm = this;
    var configArray = [];
    //vm.title = 'Settings Controller';
    _.each(config, function(value, key) {
        configArray.push({
            title: key,
            content: value
        });
    });
    vm.config = configArray;

    activate();

    function activate() {}
}

export default AdminConfigurationController;
