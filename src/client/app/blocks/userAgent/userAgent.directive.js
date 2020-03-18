cssChrome.$inject = ['userAgentService'];
cssFirefox.$inject = ['userAgentService'];
cssIe.$inject = ['userAgentService'];
cssEdge.$inject = ['userAgentService'];
cssBrowser.$inject = ['userAgentService'];

/**
* @cssChrome directive
* @module userAgent
* @name cssChrome
* @restrict 'A'
* @scope
* @param {string} element
* @return {Object} directive
*
* @description
* This is a directive to add a chrome style depending on the browser.
*/
function cssChrome(userAgentService) {
    var isChrome = userAgentService.isChrome();
    var directive = {
        restrict: 'A',
        link: function (scope, element) {
            if (isChrome) {
                element.addClass('chrome');
            }
        }
    };
    return directive;
}


/**
* @cssFirefox directive
* @module userAgent
* @name cssFirefox
* @restrict 'A'
* @scope
* @param {string} element
* @return {Object} directive
*
* @description
* This is a directive to add a firefox style depending on the browser.
*/
function cssFirefox(userAgentService) {
    var isFirefox = userAgentService.isFirefox();
    var directive = {
        restrict: 'A',
        link: function (scope, element) {
            if (isFirefox) {
                element.addClass('firefox');
            }
        }
    };
    return directive;
}


/**
* @cssIe directive
* @module userAgent
* @name cssIe
* @restrict 'A'
* @scope
* @param {string} element
* @return {Object} directive
*
* @description
* This is a directive to add a ie style depending on the browser.
*/
function cssIe(userAgentService) {
    var isIE = userAgentService.isIE();
    var directive = {
        restrict: 'A',
        link: function (scope, element) {
            if (isIE) {
                element.addClass('ie');
            }
        }
    };
    return directive;
}

/**
 * @cssIe directive
 * @module userAgent
 * @name cssEdge
 * @restrict 'A'
 * @scope
 * @param {string} element
 * @return {Object} directive
 *
 * @description
 * This is a directive to add a Edge style depending on the browser.
 */
function cssEdge(userAgentService) {
    var isEdge = userAgentService.isEdge();
    var directive = {
        restrict: 'A',
        link: function (scope, element) {
            if (isEdge) {
                element.addClass('edge');
            }
        }
    };
    return directive;
}


/**
* @cssBrowser directive
* @module userAgent
* @name cssBrowser
* @restrict 'A'
* @scope
* @param {string} element
* @return {Object} directive
*
* @description
* This is a directive to add a css depending on the browser.
*/
function cssBrowser(userAgentService) {
    var isChrome = userAgentService.isChrome();
    var isFirefox = userAgentService.isFirefox();
    var isIE = userAgentService.isIE();
    var directive = {
        restrict: 'A',
        link: function (scope, element) {
            if (isChrome) {
                element.addClass('chrome');
            } else if (isFirefox) {
                element.addClass('firefox');
            } else if (isIE) {
                element.addClass('ie');
            }
        }
    };
    return directive;
}


export {
    cssChrome,
    cssFirefox,
    cssIe,
    cssEdge,
    cssBrowser
}

