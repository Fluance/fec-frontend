//const EC = protractor.ExpectedConditions;
//const TIMEOUT = 10000;

function waitForRedirectionTo(expectedUrl) {
    browser.wait(EC.urlContains(expectedUrl), TIMEOUT);
}

var IdentityServer = function() {
    this.usernameField = element(by.id('username'));
    this.passwordField = element(by.id('password'));
    this.signInButton = element(by.buttonText('Sign In'));

    this.loginUser = function(username, password) {
        this.usernameField.sendKeys(username);
        this.passwordField.sendKeys(password);
        this.signInButton.click();
        this.waitForRedirectionTo = waitForRedirectionTo;
    };
}

module.exports = IdentityServer;