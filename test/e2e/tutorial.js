var Home = require('./pageObjects/home');
//var PatientDetail = require('./pageObjects/patientDetail');


describe('when all the steps are clicked', function () {
	it('should display the -OK,I got it- button', function () {
		var home = new Home();

		home.clickTutorialButton();

		expect(home.tutorialOverlay.isPresent()).toBeTruthy();
		expect(home.tutorialTooltip.isPresent()).toBeTruthy();

		home.tutorialBullets.count().then(function (bulletsNumber) {
			while (--bulletsNumber) {
				home.clickNextTutorialButton();
			}
		}).then(function () {
			browser.wait(EC.presenceOf(home.skipTutorialButton), TIMEOUT, "skipTutorialButton not present");
			expect(home.skipTutorialButton.getText()).toContain('OK, I got it');
		});
	});
});
