import template from './profile.form.unit.component.html';

const ProfileUnit = {
    restrict: 'E',
    templateUrl: template,
    bindings: {
        model: '=',
        mode: '@',
    },
    controller: function () {
    }
};

export default ProfileUnit;
