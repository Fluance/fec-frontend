import template from './profile.form.service.component.html';

const ProfileService = {
    restrict: 'E',
    templateUrl: template,
    bindings: {
        model: '=',
        mode: '@',
    },
    controller: function () {
    }
};

export default ProfileService;
