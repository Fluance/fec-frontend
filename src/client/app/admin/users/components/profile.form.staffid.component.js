import _ from 'lodash';
import template from './profile.form.staffid.component.html';

const ProfileStaffid = {
    restrict: 'E',
    templateUrl: template,
    bindings: {
        model: '=',
        mode: '@',
    },
    controller: ['dataservice.dataProviders', controller]
};

function controller(dataserviceDataProviders) {
    var vm = this;
    vm.dataProviders = [];
    vm.$onInit = onInit;
    return vm;

    function onInit() {
        getDataProviders()
            .then(function () {
                vm.model.staffInfos.map(function (staffInfo) {
                    var provider = _.find(vm.dataProviders, {'id': staffInfo.providerId});
                    staffInfo.providerName = (provider) ? provider.name : undefined;
                });
            });
    }

    function getDataProviders() {
        return dataserviceDataProviders.getDataProviderList()
            .then(function (result) {
                vm.dataProviders = result;
            });
    }
}

export default ProfileStaffid;
