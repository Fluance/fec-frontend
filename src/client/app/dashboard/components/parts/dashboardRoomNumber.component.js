import template from './dashboardRoomNumber.component.html';

const DashboardRoomNumber = {
    bindings: {
        room: '<',
        bed: '<'
    },
    controllerAs: 'vm',
    templateUrl: template
};

export default DashboardRoomNumber;
