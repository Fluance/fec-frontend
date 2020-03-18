var Home = require('./pageObjects/home');
var PatientDetail = require('./pageObjects/patientDetail');

describe('when the user search for pid 329007', function () {
	it('should display 329007 patient view', function () {
		browser.ignoreSynchronization = false;

		var home = new Home();

		home.goHome();

		home.openSearchPanel();
		home.searchForPidWithValue(329007);

		expect(browser.getLocationAbsUrl()).toContain('/patients/329007');
	});
});

describe('when the detail view of user 329007 is loaded', function () {
	it('should display patient name', function () {
		var patientDetail = new PatientDetail();

		expect(patientDetail.patientName.getText()).toContain('STEPANOVA Galina');
	});
});


describe('when the detail view of user 329007 is loaded', function () {
	it('should display an active imaging', function () {
		var patientDetail = new PatientDetail();

		expect(patientDetail.imagingLink.getAttribute('class')).not.toContain('disabled');
	});
});

describe('when the user search for pid 329006', function () {
	it('should display 329006 patient view', function () {
		var home = new Home();

		home.openSearchPanel();
		home.searchForPidWithValue(329006);

		expect(browser.getLocationAbsUrl()).toContain('/patients/329006');
	});
});

describe('when the detail view of user 329006 is loaded', function () {
	it('should display patient name', function () {
		var patientDetail = new PatientDetail();

		expect(patientDetail.patientName.getText()).toContain('SCILANGA MELISSA');
	});
});

describe('when the detail view of user 329006 is loaded', function () {
	it('should display a disabled imaging', function () {
		var patientDetail = new PatientDetail();

		expect(patientDetail.imagingLink.getAttribute('class')).toContain('disabled');
	});
});


