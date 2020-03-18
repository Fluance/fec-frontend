import template from './dashboardPatientInfo.component.html';

const DashboardPatientInfo = {
    bindings: {
        patientInfo: '<',
        hideAdmissionDate: '<',
        sortOrder: '<'
    },
    templateUrl: template
};

export default DashboardPatientInfo;
