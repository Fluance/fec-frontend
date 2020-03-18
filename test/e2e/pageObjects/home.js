var Home = function () {
    this.searchNavigationButton = element(by.xpath("//button[@ng-click='vm.toggleSidenavSearch()']"));
    this.menuButton = element(by.xpath("//button[@ng-click='vm.toggleSidenavMenu()']"));
    this.searchByMenu = element(by.id("searchMethodSelect"));
    this.searchByMenuCriteriaItem = element(by.xpath("//md-option[contains(.,'Criteria')]"));
    this.searchByMenuPidVnbItem = element(by.xpath("//md-option[contains(.,'Patient/Visit ID')]"));
    this.searchByMenuClinicsItem = element(by.xpath("//md-option[contains(.,'Clinics')]"));

    this.logoutButton = element(by.xpath("//button[@aria-label='Logout']"));

    this.languageSelection = element(by.xpath("//md-select[@ng-model='vm.selectedLanguage']"));

    this.logoutButton = element(by.xpath("//button[@aria-label='Logout']"));
    this.submitSearch = element(by.xpath("//button[contains(@ng-disabled,'!vm.selectedSearchMethod')]"));
    this.tutorialGuideButton = element(by.xpath("//fec-tutorial-guide[@id='menu-tutorial-guide']"));
    this.tutorialOverlay = element(by.css('.introjs-overlay'));
    this.pidField = element(by.xpath("//input[@ng-model='vm.params.pid']"));
    this.skipTutorialButton = element(by.xpath("//a[@class='introjs-button introjs-skipbutton']"));
    this.nextTutorialButton = element(by.xpath("//a[@class='introjs-button introjs-nextbutton']"));

    this.tutorialTooltip = element(by.css("div.introjs-tooltip"));

    this.homeButton = element(by.xpath("//a[@aria-label='Dashboard']"));

    this.tutorialBullets = element.all(protractor.by.css('.introjs-bullets ul li'));

    this.openSearchPanel = function () {
        browser.wait(EC.presenceOf(this.searchNavigationButton), TIMEOUT, "searchNavigationButton not present");
        browser.wait(EC.visibilityOf(this.searchNavigationButton), TIMEOUT, "searchNavigationButton not visible");
        this.searchNavigationButton.click();
    };

    // this.clickSearchNavigationButton = function () {
    //     browser.wait(EC.presenceOf(this.searchByIdButton), TIMEOUT, "searchByIdButton not present");
    //     this.searchByIdButton.click();
    // };

    this.goHome = function () {
        browser.wait(EC.presenceOf(this.homeButton), TIMEOUT, "homeButton not present");
        this.homeButton.click();
    }

    this.showMainMenu = function () {
        browser.wait(EC.presenceOf(this.menuButton), TIMEOUT, "menuButton not present");
        this.menuButton.click();
    }

    this.changeLanguageTo = function (language) {
        browser.wait(EC.presenceOf(this.languageSelection), TIMEOUT, "languageSelection not present");
        this.languageSelection.click();

        var languageMenuItem = element(by.xpath("//md-option[@value='" + language + "']"));
        browser.wait(EC.presenceOf(languageMenuItem), TIMEOUT, "languageMenuItem not present");

        languageMenuItem.click();
    }

    this.clickTutorialButton = function () {
        browser.wait(EC.presenceOf(this.tutorialGuideButton), TIMEOUT, "tutorialButton not present");
        this.tutorialGuideButton.click();
    };

    this.clickLogoutButton = function () {
        browser.wait(EC.presenceOf(this.logoutButton), TIMEOUT, "logoutButton not present");
        this.logoutButton.click();
    }

    this.waitForTutorialOverlay = function () {
        browser.wait(EC.visibilityOf(this.tutorialOverlay), TIMEOUT, "tutorialOverlay not visible");
    }

    this.searchForPidWithValue = function (value) {
        browser.wait(EC.presenceOf(this.searchByMenu), TIMEOUT, "searchByMenu not present");
        browser.wait(EC.visibilityOf(this.searchByMenu), TIMEOUT, "searchByMenu not visible");
        this.searchByMenu.click();
        browser.wait(EC.presenceOf(this.searchByMenuPidVnbItem), TIMEOUT, "searchByMenuPidVnbItem not present");
        browser.wait(EC.visibilityOf(this.searchByMenuPidVnbItem), TIMEOUT, "searchByMenuPidVnbItem not visible");
        this.searchByMenuPidVnbItem.click();
        this.pidField.clear();
        this.pidField.sendKeys(String(value));
        browser.wait(EC.presenceOf(this.pidField), TIMEOUT, "submitSearch not present");
        browser.wait(EC.visibilityOf(this.pidField), TIMEOUT, "submitSearch not visible");
        this.submitSearch.click();
    };

    this.clickNextTutorialButton = function () {
        //var nextTutorialButton = element(by.xpath("//a[@class='introjs-button introjs-nextbutton']"));
        browser.wait(EC.presenceOf(this.nextTutorialButton), TIMEOUT, "tutorialNextStepButton not present");
        browser.wait(EC.visibilityOf(this.nextTutorialButton), TIMEOUT, "tutorialNextStepButton not visible");
        this.nextTutorialButton.click();
    }
};

module.exports = Home;

