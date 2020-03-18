exports.config = {
    directConnect: true,
    //seleniumAddress: 'http://localhost:4445/wd/hub',
    specs: [
        'login.js',
        'language_change.js',
        //'check_imaging.js',
        //'tutorial.js',
        'logout.js',
    ],
    params: {
        url: 'http://localhost:3000'
    },
    onPrepare: function () {
        global.EC = protractor.ExpectedConditions;
        global.TIMEOUT = 5000; // milliseconds
    },
    plugins: [{
        // Inline protractor plugin that slows down tests execution. Helpful during tests debugging.
        inline: {
            setup: function () {
                var originalFunction = browser.driver.controlFlow().execute;

                browser.driver.controlFlow().execute = function () {
                    var args = arguments;

                    originalFunction.call(browser.driver.controlFlow(), function () {
                        return protractor.promise.delayed(10);
                    });

                    return originalFunction.apply(browser.driver.controlFlow(), args);
                };
            }
        }
    }]
};