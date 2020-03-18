var Home = require('./pageObjects/home');

var ServiceProvider = require('./pageObjects/serviceProvider');
var IdentityServer = require('./pageObjects/identityServer');

describe('when user frkh logs in', function () {
    var serviceProvider = new ServiceProvider();
    var identityServer = new IdentityServer();

    it('should login and redirect user to home page', function () {
        var home = new Home();

        browser.get(browser.params.url);

        serviceProvider.clickProviderButton();
        browser.ignoreSynchronization = true;

        identityServer.loginUser('frkh', 'Fluance2015*');

        browser.ignoreSynchronization = false;
        identityServer.waitForRedirectionTo('home');

        expect(browser.getLocationAbsUrl()).toContain('home');
    });
});
