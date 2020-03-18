import template from '../shell.html';

const Layout = {
    controller: ['config', 'routerService', controller],
    controllerAs: 'vm',
    'template': '<div layout="row" flex ng-include="vm.layoutTemplateUrl"></div>'
};

function controller(config, routerService) {
    /*jshint validthis: true */
    var vm = this;
    vm.layoutTemplateUrl = undefined;
    vm.$onInit = _onInit;
    vm.$onDestroy = _onDestroy;
    return vm;

    function _onInit() {
        routerService.stateChangedSuccess.subscribe(_loadTemplate);
        _loadTemplate();
    }

    function _onDestroy() {
        routerService.stateChangedSuccess.unsubscribe(_loadTemplate);
    }

    function _loadTemplate() {
        vm.layoutTemplateUrl = (config.layoutTemplateURL) ? config.layoutTemplateURL : template;
    }
}

export default Layout;
