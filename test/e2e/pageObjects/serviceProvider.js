var ServiceProvider = function() {
    this.providerButton = element(by.css('.card a'));

    this.clickProviderButton = function() {
        this.providerButton.click();
    };
};

module.exports = ServiceProvider;