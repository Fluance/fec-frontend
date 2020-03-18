import template from './fluanceAppointment.component.html';

const fluanceAppointment = {
    templateUrl: template,
    controller: function() { },
    bindings: {
        aid: '<',
        result: '='
    }
};

export default fluanceAppointment;

