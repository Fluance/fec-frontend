import template from './profile.form.companies.component.html';

const ProfileCompaniesInput = {
    restrict: 'E',
    templateUrl: template,
    bindings: {
        model: '=',
        mode: '@',
    },
    controller: 'AdminProfileFormController',
    controllerAs: 'vm',
};

export default ProfileCompaniesInput;


