/**
 * @license HTTP Throttler Module for AngularJS
 * (c) 2013 Mike Pugh
 * License: MIT
 */
const MAX_CONCURRENT_REQUESTS = 6;

function isIe11() {
    return (detectBrowserVersion() < 12);
}

const configIE11 = ['$httpProvider', function($httpProvider) {
    $httpProvider.interceptors.push('httpThrottler');
}];

function detectBrowserVersion() {
    var rv = -1; // Return value assumes failure.

    if (navigator.appName == 'Microsoft Internet Explorer') {

        var ua = navigator.userAgent,
            re = new RegExp("MSIE ([0-9]{1,}[\\.0-9]{0,})");

        if (re.exec(ua) !== null) {
            rv = parseFloat(RegExp.$1);
        }
    }
    else if (navigator.appName == "Netscape") {
        /// in IE 11 the navigator.appVersion says 'trident'
        /// in Edge the navigator.appVersion does not say trident
        if (navigator.appVersion.indexOf('Trident') === -1) rv = 12;
        else rv = 11;
    }

    return rv;
}

const httpThrottlerProvider = function() {
    var maxConcurrentRequests = MAX_CONCURRENT_REQUESTS;
    this.maxConcurrentRequests = function(val) {
        maxConcurrentRequests = val || maxConcurrentRequests;
        return maxConcurrentRequests;
    };
    this.$get = [
        '$q', '$log', 'httpBuffer', function($q, $log, httpBuffer) {
            var reqCount, service;

            reqCount = 0;

            var increment = function(config) {
                reqCount++;
                return config || $q.when(config);
            };

            var decrement = function() {
                reqCount--;
                httpBuffer.retryOne();
            };

            service = {
                request: function(config) {
                    var deferred;

                    $log.debug("Incoming Request - current count = " + reqCount);
                    if (reqCount >= maxConcurrentRequests) {
                        $log.warn("Too many requests");
                        deferred = $q.defer();
                        httpBuffer.append(deferred);
                        return deferred.promise.then(function() {
                            return increment(config);
                        });
                    } else {
                        return increment(config);
                    }
                },
                response: function(response) {
                    decrement();
                    $log.debug("Response received from server - new count = " + reqCount);
                    return response || $q.when(response);
                },
                responseError: function(rejection) {
                    decrement();
                    $log.debug("ResponseError received from server - new count = " + reqCount);
                    return $q.reject(rejection);
                }
            };
            return service;
        }
    ];
};

const httpBuffer = [
    '$log', function($log) {
        var buffer, service;

        buffer = [];

        service = {
            append: function(deferred) {
                $log.debug('Adding to buffer, current buffer size = ' + buffer.length);
                return buffer.push(deferred);
            },
            retryOne: function() {
                var deferred;

                if (buffer.length > 0) {
                    deferred = buffer.shift();
                    $log.debug('Removed from buffer, new buffer size = ' + buffer.length);
                    deferred.resolve();
                }
            }
        };
        return service;
    }
];


export {
    httpBuffer,
    httpThrottlerProvider,
    isIe11,
    configIE11
}

