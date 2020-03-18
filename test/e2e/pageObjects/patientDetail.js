var PatientDetail = function() {
    this.patientId = element(by.binding('vm.result.patient.pid'));
    this.patientName = element(by.binding('vm.result.patient.lastName'));
    this.imagingLink = element(by.css('fec-nav-button[state="imagingList"] a'));
};

module.exports = PatientDetail;
