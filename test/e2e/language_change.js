var Home = require('./pageObjects/home');

describe('when the user chooses a language', function () {
    it('URL should contain "logout"', function () {
        var home = new Home();

        home.goHome();
        home.showMainMenu();
        home.changeLanguageTo('en');

        expect(home.logoutButton.getText()).toContain('Logout');
    }, TIMEOUT);
});
