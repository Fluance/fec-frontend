// Include in index.html so that app level exceptions are handled.
// Exclude from testRunner.html which should run exactly what it wants to run


// Overide $exceptionHandler but old version is still triggered by $delegate object
config.$inject = ['$provide', 'configProvider'];

function config($provide, configProvider) {
    $provide.decorator('$exceptionHandler', extendExceptionHandler);

    // create a stacktrace on async calls ($q service), so it's easier to debug errors (breakpoint in catch() + angular.processQueue => see: 'stack' property in state object)
    if(configProvider.config.debugUnhandledRejections) {
        // Decorate the $q service when app starts
        $provide.decorator('$q', ["$delegate", function ($delegate) {
            // Create a new promise object
            var promise = $delegate.when();

            // Access the `Promise` prototype (nonstandard, but works in Chrome)
            var proto = promise.__proto__;

            // Define a setter for `$$state` that creates a stacktrace
            // (string) and assigns it as a property of the internal `$$state` object.
            Object.defineProperty(proto, '$$state', {
                enumerable: true,
                set: function (val) {
                    // creates stacktrace using Error() -- even when it's not (for debugging if there is an actual error)
                    val.stack = new Error().stack;
                    this._$$state = val;
                },
                get: function () {
                    return this._$$state;
                }
            });

            return $delegate;
        }]);
    }
}

// Redefine exception Hanlder with logger object.
extendExceptionHandler.$inject = ['$delegate', 'logger', '$injector'];
/**
*
* @ngdoc service
* @module blocks
* @name extendExceptionHandler
*
* @description
*
* Redefine `exceptionHandler` with a logger object.
*
* Use this service to add error message to a service's collection, add errors message to `rootScope`,
* log errors message to remote web server, log locally or throw hard.
*
* It is entirely up to you.

    throw { message: 'error message we added' };

**/
function extendExceptionHandler($delegate, logger, $injector) {
    var $translate;

    return function HandleException(exception, cause) {
        $translate = $translate || $injector.get('$translate');
        $delegate(exception, cause);
        if(!_.isString(exception)) {
            exception.cause = cause;
        }

        logger.error($translate.instant('error.UNHANDLED_ERROR'), exception, 'Error');
    };
}

export default config;
