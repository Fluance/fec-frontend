var Home = require('./pageObjects/home');

describe('when the user click logout button', function () {
    it('URL should contain "service-discovery"', function () {
        var home = new Home();

        home.goHome();
        home.showMainMenu();
        home.clickLogoutButton();

        browser.wait(EC.urlContains('service-discovery'));
    }, TIMEOUT);
});
