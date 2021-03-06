/**
 * @license AngularJS v1.2.25
 * (c) 2010-2014 Google, Inc. http://angularjs.org
 * License: MIT
 *
 *  Matthieu Riegler - Kyro
 *  Modified angular-mocks.js to make Integration tests with real backend async calls (but keeps E2E mocks)
 *  Works great with Jasmine 2.0.1
 */
(function(window, angular, undefined) {

    'use strict';

    /**
     * @ngdoc object
     * @name angular.mock
     * @description
     *
     * Namespace from 'angular-mocks.js' which contains testing related code.
     */
    angular.mock = {};

    /**
     * @ngdoc service
     * @name $timeout
     * @description
     *
     * This service is just a simple decorator for {@link ng.$timeout $timeout} service
     * that adds a "flush" and "verifyNoPendingTasks" methods.
     */

    angular.mock.$RootElementProvider = function() {
        this.$get = function() {
            return angular.element('<div ng-app></div>');
        };
    };

    /**
     * @ngdoc module
     * @name ngMock
     * @packageName angular-mocks
     * @description
     *
     * # ngMock
     *
     * The `ngMock` module provides support to inject and mock Angular services into unit tests.
     * In addition, ngMock also extends various core ng services such that they can be
     * inspected and controlled in a synchronous manner within test code.
     *
     *
     * <div doc-module-components="ngMock"></div>
     *
     */
    angular.module('ngMock', ['ng']).provider({
        $rootElement: angular.mock.$RootElementProvider
    })

    function createHttpBackendMock($rootScope, $delegate, $browser) {
        var definitions = [],
            expectations = [],
            responses = [],
            responsesPush = angular.bind(responses, responses.push),
            copy = angular.copy;

        function createResponse(status, data, headers, statusText) {
            if (angular.isFunction(status)) return status;

            return function() {
                return angular.isNumber(status)
                    ? [status, data, headers, statusText]
                    : [200, status, data];
            };
        }

        // TO DO(vojta): change params to: method, url, data, headers, callback
        function $httpBackend(method, url, data, callback, headers, timeout, withCredentials) {
            var xhr = new MockXhr(),
                expectation = expectations[0],
                wasExpected = false;

            function prettyPrint(data) {
                return (angular.isString(data) || angular.isFunction(data) || data instanceof RegExp)
                    ? data
                    : angular.toJson(data);
            }

            function wrapResponse(wrapped) {
                if (!$browser && timeout && timeout.then) timeout.then(handleTimeout);

                return handleResponse;

                function handleResponse() {
                    var response = wrapped.response(method, url, data, headers);
                    xhr.$$respHeaders = response[2];
                    callback(copy(response[0]), copy(response[1]), xhr.getAllResponseHeaders(),
                        copy(response[3] || ''));
                }

                function handleTimeout() {
                    for (var i = 0, ii = responses.length; i < ii; i++) {
                        if (responses[i] === handleResponse) {
                            responses.splice(i, 1);
                            callback(-1, undefined, '');
                            break;
                        }
                    }
                }
            }

            if (expectation && expectation.match(method, url)) {
                if (!expectation.matchData(data))
                    throw new Error('Expected ' + expectation + ' with different data\n' +
                    'EXPECTED: ' + prettyPrint(expectation.data) + '\nGOT:      ' + data);

                if (!expectation.matchHeaders(headers))
                    throw new Error('Expected ' + expectation + ' with different headers\n' +
                    'EXPECTED: ' + prettyPrint(expectation.headers) + '\nGOT:      ' +
                    prettyPrint(headers));

                expectations.shift();

                if (expectation.response) {
                    responses.push(wrapResponse(expectation));
                    return;
                }
                wasExpected = true;
            }

            var i = -1, definition;
            while ((definition = definitions[++i])) {
                if (definition.match(method, url, data, headers || {})) {
                    if (definition.response) {
                        // if $browser specified, we do auto flush all requests
                        ($browser ? $browser.defer : responsesPush)(wrapResponse(definition));
                    } else if (definition.passThrough) {
                        $delegate(method, url, data, callback, headers, timeout, withCredentials);
                    } else throw new Error('No response defined !');
                    return;
                }
            }
            throw wasExpected ?
                new Error('No response defined !') :
                new Error('Unexpected request: ' + method + ' ' + url + '\n' +
                (expectation ? 'Expected ' + expectation : 'No more request expected'));
        }

        /**
         * @ngdoc method
         * @name $httpBackend#when
         * @description
         * Creates a new backend definition.
         *
         * @param {string} method HTTP method.
         * @param {string|RegExp} url HTTP url.
         * @param {(string|RegExp|function(string))=} data HTTP request body or function that receives
         *   data string and returns true if the data is as expected.
         * @param {(Object|function(Object))=} headers HTTP headers or function that receives http header
         *   object and returns true if the headers match the current definition.
         * @returns {requestHandler} Returns an object with `respond` method that controls how a matched
         *   request is handled.
         *
         *  - respond â€“
         *      `{function([status,] data[, headers, statusText])
   *      | function(function(method, url, data, headers)}`
         *    â€“ The respond method takes a set of static data to be returned or a function that can
         *    return an array containing response status (number), response data (string), response
         *    headers (Object), and the text for the status (string).
         */
        $httpBackend.when = function(method, url, data, headers) {
            var definition = new MockHttpExpectation(method, url, data, headers),
                chain = {
                    respond: function(status, data, headers, statusText) {
                        definition.response = createResponse(status, data, headers, statusText);
                    }
                };

            if ($browser) {
                chain.passThrough = function() {
                    definition.passThrough = true;
                };
            }

            definitions.push(definition);
            return chain;
        };

        /**
         * @ngdoc method
         * @name $httpBackend#whenGET
         * @description
         * Creates a new backend definition for GET requests. For more info see `when()`.
         *
         * @param {string|RegExp} url HTTP url.
         * @param {(Object|function(Object))=} headers HTTP headers.
         * @returns {requestHandler} Returns an object with `respond` method that control how a matched
         * request is handled.
         */

        /**
         * @ngdoc method
         * @name $httpBackend#whenHEAD
         * @description
         * Creates a new backend definition for HEAD requests. For more info see `when()`.
         *
         * @param {string|RegExp} url HTTP url.
         * @param {(Object|function(Object))=} headers HTTP headers.
         * @returns {requestHandler} Returns an object with `respond` method that control how a matched
         * request is handled.
         */

        /**
         * @ngdoc method
         * @name $httpBackend#whenDELETE
         * @description
         * Creates a new backend definition for DELETE requests. For more info see `when()`.
         *
         * @param {string|RegExp} url HTTP url.
         * @param {(Object|function(Object))=} headers HTTP headers.
         * @returns {requestHandler} Returns an object with `respond` method that control how a matched
         * request is handled.
         */

        /**
         * @ngdoc method
         * @name $httpBackend#whenPOST
         * @description
         * Creates a new backend definition for POST requests. For more info see `when()`.
         *
         * @param {string|RegExp} url HTTP url.
         * @param {(string|RegExp|function(string))=} data HTTP request body or function that receives
         *   data string and returns true if the data is as expected.
         * @param {(Object|function(Object))=} headers HTTP headers.
         * @returns {requestHandler} Returns an object with `respond` method that control how a matched
         * request is handled.
         */

        /**
         * @ngdoc method
         * @name $httpBackend#whenPUT
         * @description
         * Creates a new backend definition for PUT requests.  For more info see `when()`.
         *
         * @param {string|RegExp} url HTTP url.
         * @param {(string|RegExp|function(string))=} data HTTP request body or function that receives
         *   data string and returns true if the data is as expected.
         * @param {(Object|function(Object))=} headers HTTP headers.
         * @returns {requestHandler} Returns an object with `respond` method that control how a matched
         * request is handled.
         */

        /**
         * @ngdoc method
         * @name $httpBackend#whenJSONP
         * @description
         * Creates a new backend definition for JSONP requests. For more info see `when()`.
         *
         * @param {string|RegExp} url HTTP url.
         * @returns {requestHandler} Returns an object with `respond` method that control how a matched
         * request is handled.
         */
        createShortMethods('when');


        /**
         * @ngdoc method
         * @name $httpBackend#expect
         * @description
         * Creates a new request expectation.
         *
         * @param {string} method HTTP method.
         * @param {string|RegExp} url HTTP url.
         * @param {(string|RegExp|function(string)|Object)=} data HTTP request body or function that
         *  receives data string and returns true if the data is as expected, or Object if request body
         *  is in JSON format.
         * @param {(Object|function(Object))=} headers HTTP headers or function that receives http header
         *   object and returns true if the headers match the current expectation.
         * @returns {requestHandler} Returns an object with `respond` method that control how a matched
         *  request is handled.
         *
         *  - respond â€“
         *    `{function([status,] data[, headers, statusText])
   *    | function(function(method, url, data, headers)}`
         *    â€“ The respond method takes a set of static data to be returned or a function that can
         *    return an array containing response status (number), response data (string), response
         *    headers (Object), and the text for the status (string).
         */
        $httpBackend.expect = function(method, url, data, headers) {
            var expectation = new MockHttpExpectation(method, url, data, headers);
            expectations.push(expectation);
            return {
                respond: function (status, data, headers, statusText) {
                    expectation.response = createResponse(status, data, headers, statusText);
                }
            };
        };


        /**
         * @ngdoc method
         * @name $httpBackend#expectGET
         * @description
         * Creates a new request expectation for GET requests. For more info see `expect()`.
         *
         * @param {string|RegExp} url HTTP url.
         * @param {Object=} headers HTTP headers.
         * @returns {requestHandler} Returns an object with `respond` method that control how a matched
         * request is handled. See #expect for more info.
         */

        /**
         * @ngdoc method
         * @name $httpBackend#expectHEAD
         * @description
         * Creates a new request expectation for HEAD requests. For more info see `expect()`.
         *
         * @param {string|RegExp} url HTTP url.
         * @param {Object=} headers HTTP headers.
         * @returns {requestHandler} Returns an object with `respond` method that control how a matched
         *   request is handled.
         */

        /**
         * @ngdoc method
         * @name $httpBackend#expectDELETE
         * @description
         * Creates a new request expectation for DELETE requests. For more info see `expect()`.
         *
         * @param {string|RegExp} url HTTP url.
         * @param {Object=} headers HTTP headers.
         * @returns {requestHandler} Returns an object with `respond` method that control how a matched
         *   request is handled.
         */

        /**
         * @ngdoc method
         * @name $httpBackend#expectPOST
         * @description
         * Creates a new request expectation for POST requests. For more info see `expect()`.
         *
         * @param {string|RegExp} url HTTP url.
         * @param {(string|RegExp|function(string)|Object)=} data HTTP request body or function that
         *  receives data string and returns true if the data is as expected, or Object if request body
         *  is in JSON format.
         * @param {Object=} headers HTTP headers.
         * @returns {requestHandler} Returns an object with `respond` method that control how a matched
         *   request is handled.
         */

        /**
         * @ngdoc method
         * @name $httpBackend#expectPUT
         * @description
         * Creates a new request expectation for PUT requests. For more info see `expect()`.
         *
         * @param {string|RegExp} url HTTP url.
         * @param {(string|RegExp|function(string)|Object)=} data HTTP request body or function that
         *  receives data string and returns true if the data is as expected, or Object if request body
         *  is in JSON format.
         * @param {Object=} headers HTTP headers.
         * @returns {requestHandler} Returns an object with `respond` method that control how a matched
         *   request is handled.
         */

        /**
         * @ngdoc method
         * @name $httpBackend#expectPATCH
         * @description
         * Creates a new request expectation for PATCH requests. For more info see `expect()`.
         *
         * @param {string|RegExp} url HTTP url.
         * @param {(string|RegExp|function(string)|Object)=} data HTTP request body or function that
         *  receives data string and returns true if the data is as expected, or Object if request body
         *  is in JSON format.
         * @param {Object=} headers HTTP headers.
         * @returns {requestHandler} Returns an object with `respond` method that control how a matched
         *   request is handled.
         */

        /**
         * @ngdoc method
         * @name $httpBackend#expectJSONP
         * @description
         * Creates a new request expectation for JSONP requests. For more info see `expect()`.
         *
         * @param {string|RegExp} url HTTP url.
         * @returns {requestHandler} Returns an object with `respond` method that control how a matched
         *   request is handled.
         */
        createShortMethods('expect');


        /**
         * @ngdoc method
         * @name $httpBackend#flush
         * @description
         * Flushes all pending requests using the trained responses.
         *
         * @param {number=} count Number of responses to flush (in the order they arrived). If undefined,
         *   all pending requests will be flushed. If there are no pending requests when the flush method
         *   is called an exception is thrown (as this typically a sign of programming error).
         */
        $httpBackend.flush = function(count) {
            $rootScope.$digest();
            if (!responses.length) throw new Error('No pending request to flush !');

            if (angular.isDefined(count)) {
                while (count--) {
                    if (!responses.length) throw new Error('No more pending request to flush !');
                    responses.shift()();
                }
            } else {
                while (responses.length) {
                    responses.shift()();
                }
            }
            $httpBackend.verifyNoOutstandingExpectation();
        };


        /**
         * @ngdoc method
         * @name $httpBackend#verifyNoOutstandingExpectation
         * @description
         * Verifies that all of the requests defined via the `expect` api were made. If any of the
         * requests were not made, verifyNoOutstandingExpectation throws an exception.
         *
         * Typically, you would call this method following each test case that asserts requests using an
         * "afterEach" clause.
         *
         * ```js
         *   afterEach($httpBackend.verifyNoOutstandingExpectation);
         * ```
         */
        $httpBackend.verifyNoOutstandingExpectation = function() {
            $rootScope.$digest();
            if (expectations.length) {
                throw new Error('Unsatisfied requests: ' + expectations.join(', '));
            }
        };


        /**
         * @ngdoc method
         * @name $httpBackend#verifyNoOutstandingRequest
         * @description
         * Verifies that there are no outstanding requests that need to be flushed.
         *
         * Typically, you would call this method following each test case that asserts requests using an
         * "afterEach" clause.
         *
         * ```js
         *   afterEach($httpBackend.verifyNoOutstandingRequest);
         * ```
         */
        $httpBackend.verifyNoOutstandingRequest = function() {
            if (responses.length) {
                throw new Error('Unflushed requests: ' + responses.length);
            }
        };


        /**
         * @ngdoc method
         * @name $httpBackend#resetExpectations
         * @description
         * Resets all request expectations, but preserves all backend definitions. Typically, you would
         * call resetExpectations during a multiple-phase test when you want to reuse the same instance of
         * $httpBackend mock.
         */
        $httpBackend.resetExpectations = function() {
            expectations.length = 0;
            responses.length = 0;
        };

        return $httpBackend;


        function createShortMethods(prefix) {
            angular.forEach(['GET', 'DELETE', 'JSONP'], function(method) {
                $httpBackend[prefix + method] = function(url, headers) {
                    return $httpBackend[prefix](method, url, undefined, headers);
                };
            });

            angular.forEach(['PUT', 'POST', 'PATCH'], function(method) {
                $httpBackend[prefix + method] = function(url, data, headers) {
                    return $httpBackend[prefix](method, url, data, headers);
                };
            });
        }
    }

    function MockHttpExpectation(method, url, data, headers) {

        this.data = data;
        this.headers = headers;

        this.match = function(m, u, d, h) {
            if (method != m) return false;
            if (!this.matchUrl(u)) return false;
            if (angular.isDefined(d) && !this.matchData(d)) return false;
            if (angular.isDefined(h) && !this.matchHeaders(h)) return false;
            return true;
        };

        this.matchUrl = function(u) {
            if (!url) return true;
            if (angular.isFunction(url.test)) return url.test(u);
            return url == u;
        };

        this.matchHeaders = function(h) {
            if (angular.isUndefined(headers)) return true;
            if (angular.isFunction(headers)) return headers(h);
            return angular.equals(headers, h);
        };

        this.matchData = function(d) {
            if (angular.isUndefined(data)) return true;
            if (data && angular.isFunction(data.test)) return data.test(d);
            if (data && angular.isFunction(data)) return data(d);
            if (data && !angular.isString(data)) return angular.equals(data, angular.fromJson(d));
            return data == d;
        };

        this.toString = function() {
            return method + ' ' + url;
        };
    }


    function MockXhr() {

        // hack for testing $http, $httpBackend
        MockXhr.$$lastInstance = this;

        this.open = function(method, url, async) {
            this.$$method = method;
            this.$$url = url;
            this.$$async = async;
            this.$$reqHeaders = {};
            this.$$respHeaders = {};
        };

        this.send = function(data) {
            this.$$data = data;
        };

        this.setRequestHeader = function(key, value) {
            this.$$reqHeaders[key] = value;
        };

        this.getResponseHeader = function(name) {
            // the lookup must be case insensitive,
            // that's why we try two quick lookups first and full scan last
            var header = this.$$respHeaders[name];
            if (header) return header;

            name = angular.lowercase(name);
            header = this.$$respHeaders[name];
            if (header) return header;

            header = undefined;
            angular.forEach(this.$$respHeaders, function(headerVal, headerName) {
                if (!header && angular.lowercase(headerName) == name) header = headerVal;
            });
            return header;
        };

        this.getAllResponseHeaders = function() {
            var lines = [];

            angular.forEach(this.$$respHeaders, function(value, key) {
                lines.push(key + ': ' + value);
            });
            return lines.join('\n');
        };

        this.abort = angular.noop;
    }


    /**
     * @ngdoc module
     * @name ngMockE2E
     * @module ngMockE2E
     * @packageName angular-mocks
     * @description
     *
     * The `ngMockE2E` is an angular module which contains mocks suitable for end-to-end testing.
     * Currently there is only one mock present in this module -
     * the {@link ngMockE2E.$httpBackend e2e $httpBackend} mock.
     */
    angular.module('ngMockE2E', ['ng']).config(['$provide', function($provide) {
        $provide.decorator('$httpBackend', angular.mock.e2e.$httpBackendDecorator);
    }]);



    angular.mock.e2e = {};
    angular.mock.e2e.$httpBackendDecorator =
        ['$rootScope', '$delegate', '$browser', createHttpBackendMock];


    angular.clearDataCache = function() {
        var key,
            cache = angular.element.cache;

        for(key in cache) {
            if (Object.prototype.hasOwnProperty.call(cache,key)) {
                var handle = cache[key].handle;

                handle && angular.element(handle.elem).off();
                delete cache[key];
            }
        }
    };


    if(window.jasmine || window.mocha) {

        var currentSpec = null,
            isSpecRunning = function() {
                return !!currentSpec;
            };


        (window.beforeEach || window.setup)(function() {
            currentSpec = this;
        });

        (window.afterEach || window.teardown)(function() {
            var injector = currentSpec.$injector;

            angular.forEach(currentSpec.$modules, function(module) {
                if (module && module.$$hashKey) {
                    module.$$hashKey = undefined;
                }
            });

            currentSpec.$injector = null;
            currentSpec.$modules = null;
            currentSpec = null;

            if (injector) {
                injector.get('$rootElement').off();
            }

            angular.clearDataCache();

            // clean up jquery's fragment cache
            angular.forEach(angular.element.fragments, function(val, key) {
                delete angular.element.fragments[key];
            });

            angular.forEach(angular.callbacks, function(val, key) {
                delete angular.callbacks[key];
            });
            angular.callbacks.counter = 0;
        });

        /**
         * @ngdoc function
         * @name angular.mock.module
         * @description
         *
         * *NOTE*: This function is also published on window for easy access.<br>
         * *NOTE*: This function is declared ONLY WHEN running tests with jasmine or mocha
         *
         * This function registers a module configuration code. It collects the configuration information
         * which will be used when the injector is created by {@link angular.mock.inject inject}.
         *
         * See {@link angular.mock.inject inject} for usage example
         *
         * @param {...(string|Function|Object)} fns any number of modules which are represented as string
         *        aliases or as anonymous module initialization functions. The modules are used to
         *        configure the injector. The 'ng' and 'ngMock' modules are automatically loaded. If an
         *        object literal is passed they will be registered as values in the module, the key being
         *        the module name and the value being what is returned.
         */
        window.module = function() {
            var moduleFns = Array.prototype.slice.call(arguments, 0);
            return isSpecRunning() ? workFn() : workFn;
            /////////////////////
            function workFn() {
                if (currentSpec.$injector) {
                    throw new Error('Injector already created, can not register a module!');
                } else {
                    var modules = currentSpec.$modules || (currentSpec.$modules = []);
                    angular.forEach(moduleFns, function(module) {
                        if (angular.isObject(module) && !angular.isArray(module)) {
                            modules.push(function($provide) {
                                angular.forEach(module, function(value, key) {
                                    $provide.value(key, value);
                                });
                            });
                        } else {
                            modules.push(module);
                        }
                    });
                }
            }
        };

        /**
         * @ngdoc function
         * @name angular.mock.inject
         * @description
         *
         * *NOTE*: This function is also published on window for easy access.<br>
         * *NOTE*: This function is declared ONLY WHEN running tests with jasmine or mocha
         *
         * The inject function wraps a function into an injectable function. The inject() creates new
         * instance of {@link auto.$injector $injector} per test, which is then used for
         * resolving references.
         *
         *
         * ## Resolving References (Underscore Wrapping)
         * Often, we would like to inject a reference once, in a `beforeEach()` block and reuse this
         * in multiple `it()` clauses. To be able to do this we must assign the reference to a variable
         * that is declared in the scope of the `describe()` block. Since we would, most likely, want
         * the variable to have the same name of the reference we have a problem, since the parameter
         * to the `inject()` function would hide the outer variable.
         *
         * To help with this, the injected parameters can, optionally, be enclosed with underscores.
         * These are ignored by the injector when the reference name is resolved.
         *
         * For example, the parameter `_myService_` would be resolved as the reference `myService`.
         * Since it is available in the function body as _myService_, we can then assign it to a variable
         * defined in an outer scope.
         *
         * ```
         * // Defined out reference variable outside
         * var myService;
         *
         * // Wrap the parameter in underscores
         * beforeEach( inject( function(_myService_){
   *   myService = _myService_;
   * }));
         *
         * // Use myService in a series of tests.
         * it('makes use of myService', function() {
   *   myService.doStuff();
   * });
         *
         * ```
         *
         * See also {@link angular.mock.module angular.mock.module}
         *
         * ## Example
         * Example of what a typical jasmine tests looks like with the inject method.
         * ```js
         *
         *   angular.module('myApplicationModule', [])
         *       .value('mode', 'app')
         *       .value('version', 'v1.0.1');
         *
         *
         *   describe('MyApp', function() {
   *
   *     // You need to load modules that you want to test,
   *     // it loads only the "ng" module by default.
   *     beforeEach(module('myApplicationModule'));
   *
   *
   *     // inject() is used to inject arguments of all given functions
   *     it('should provide a version', inject(function(mode, version) {
   *       expect(version).toEqual('v1.0.1');
   *       expect(mode).toEqual('app');
   *     }));
   *
   *
   *     // The inject and module method can also be used inside of the it or beforeEach
   *     it('should override a version and test the new version is injected', function() {
   *       // module() takes functions or strings (module aliases)
   *       module(function($provide) {
   *         $provide.value('version', 'overridden'); // override version here
   *       });
   *
   *       inject(function(version) {
   *         expect(version).toEqual('overridden');
   *       });
   *     });
   *   });
         *
         * ```
         *
         * @param {...Function} fns any number of functions which will be injected using the injector.
         */



        var ErrorAddingDeclarationLocationStack = function(e, errorForStack) {
            this.message = e.message;
            this.name = e.name;
            if (e.line) this.line = e.line;
            if (e.sourceId) this.sourceId = e.sourceId;
            if (e.stack && errorForStack)
                this.stack = e.stack + '\n' + errorForStack.stack;
            if (e.stackArray) this.stackArray = e.stackArray;
        };
        ErrorAddingDeclarationLocationStack.prototype.toString = Error.prototype.toString;

        window.inject = function() {
            var blockFns = Array.prototype.slice.call(arguments, 0);
            var errorForStack = new Error('Declaration Location');
            return isSpecRunning() ? workFn.call(currentSpec) : workFn;
            /////////////////////
            function workFn() {
                var modules = currentSpec.$modules || [];

                modules.unshift('ngMock');
                modules.unshift('ng');
                var injector = currentSpec.$injector;
                if (!injector) {
                    injector = currentSpec.$injector = angular.injector(modules);
                }
                for(var i = 0, ii = blockFns.length; i < ii; i++) {
                    try {
                        /* jshint -W040 *//* Jasmine explicitly provides a `this` object when calling functions */
                        injector.invoke(blockFns[i] || angular.noop, this);
                        /* jshint +W040 */
                    } catch (e) {
                        if (e.stack && errorForStack) {
                            throw new ErrorAddingDeclarationLocationStack(e, errorForStack);
                        }
                        throw e;
                    } finally {
                        errorForStack = null;
                    }
                }
            }
        };
    }


})(window, window.angular);
