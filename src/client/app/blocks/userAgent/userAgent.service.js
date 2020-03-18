/**
 * @ngdoc service
 * @module blocks.userAgent
 * @name userAgentService
 * @description
 *
 * Functions about userAgent
 */

/* @ngInject */
function userAgentService() {
    var BROWSER_IE = 'ie',
        BROWSER_EDGE = 'edge',
        BROWSER_CHROME = 'chrome',
        BROWSER_SAFARI = 'safari',
        BROWSER_FIREFOX = 'firefox',
        BROWSER_UNKNOWN = 'unknown',

        OS_WINDOWS = 'windows',
        OS_MACOS = 'macos',
        OS_LINUX = 'linux',
        OS_IOS = 'ios',
        OS_ANDROID = 'android',
        OS_UNKNOWN = 'unknown',

        DEVICE_MOBILE = 'mobile',
        DEVICE_TABLET = 'tablet',
        DEVICE_DESKTOP = 'desktop',
        DEVICE_UNKNOWN = 'unknown';


    var service = {
        // Types
        BROWSER_IE: BROWSER_IE,
        BROWSER_EDGE : BROWSER_EDGE,
        BROWSER_CHROME: BROWSER_CHROME,
        BROWSER_SAFARI: BROWSER_SAFARI,
        BROWSER_FIREFOX: BROWSER_FIREFOX,
        BROWSER_UNKNOWN : BROWSER_UNKNOWN,
        OS_WINDOWS: OS_WINDOWS,
        OS_MACOS: OS_MACOS,
        OS_LINUX: OS_LINUX,
        OS_IOS: OS_IOS,
        OS_ANDROID: OS_ANDROID,
        OS_UNKNOWN: OS_UNKNOWN,
        DEVICE_MOBILE: DEVICE_MOBILE,
        DEVICE_TABLET: DEVICE_TABLET,
        DEVICE_DESKTOP: DEVICE_DESKTOP,
        DEVICE_UNKNOWN: DEVICE_UNKNOWN,

        // Methods
        isIE: isIE,
        isEdge: isEdge,
        isChrome: isChrome,
        isSafari: isSafari,
        isFirefox: isFirefox,
        getBrowser: getBrowser,
        getOS: getOS,
        isWindows: isWindows,
        isMacOS: isMacOS,
        isIOS: isIOS,
        getDeviceType: getDeviceType,
        isMobileSize: isMobileSize
    };

    return service;

    // -------------------------------------------------------------------------

    function _isIE() {
        return /MSIE (\d+\.\d+);/.test(navigator.userAgent) || navigator.userAgent.indexOf("Trident/") > -1;
    }

    function _isChrome() {
        return /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    }
    function _isFirefox() {
        return navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
    }

    // browser

    function isIE(userAgent) {
        var userAgent = userAgent ? userAgent : navigator.userAgent;
        return /MSIE (\d+\.\d+);/.test(userAgent) || userAgent.indexOf("Trident/") > -1;
    }

    function isEdge(userAgent) {
        var userAgent = userAgent ? userAgent : navigator.userAgent;
        return /Edge/.test(userAgent);
    }

    function isChrome(userAgent) {
        var userAgent = userAgent ? userAgent : navigator.userAgent;
        return /Chrome/.test(userAgent);
    }

    function isSafari(userAgent) {
        var userAgent = userAgent ? userAgent : navigator.userAgent;
        return /Safari/.test(userAgent) && !isChrome(userAgent);
    }

    function isFirefox(userAgent) {
        var userAgent = userAgent ? userAgent : navigator.userAgent;
        return userAgent.toLowerCase().indexOf('firefox') > -1;
    }

    function getBrowser(userAgent) {
        var userAgent = userAgent ? userAgent : navigator.userAgent;

        if(isIE(userAgent)) {
            return BROWSER_IE;
        };
        if(isEdge(userAgent)) {
            return BROWSER_EDGE;
        };

        if(isChrome(userAgent)) {
            return BROWSER_CHROME;
        };

        if(isSafari(userAgent)) {
            return BROWSER_SAFARI;
        };

        if(isFirefox(userAgent)) {
            return BROWSER_FIREFOX;
        };

        return BROWSER_UNKNOWN;
    }

    // OS

    function isMacOS(userAgent) {
        var userAgent = userAgent ? userAgent : navigator.userAgent;
        return /Mac OS X/.test(userAgent) && !/like Mac OS X/.test(userAgent);
    }

    function isWindows(userAgent) {
        var userAgent = userAgent ? userAgent : navigator.userAgent;
        return /Windows/.test(userAgent);
    }

    function isLinux(userAgent) {
        var userAgent = userAgent ? userAgent : navigator.userAgent;
        return /Linux/.test(userAgent);
    }

    function isIOS(userAgent) {
        var userAgent = userAgent ? userAgent : navigator.userAgent;
        return /iOS/.test(userAgent) || /like Mac OS X/.test(userAgent);
    }

    function isAndroid(userAgent) {
        var userAgent = userAgent ? userAgent : navigator.userAgent;
        return /Android/.test(userAgent);
    }

    function getOS(userAgent) {
        var userAgent = userAgent ? userAgent : navigator.userAgent;

        if(isMacOS(userAgent)) {
            return OS_MACOS;
        }
        if(isWindows(userAgent)) {
            return OS_WINDOWS;
        }
        if(isLinux(userAgent)) {
            return OS_LINUX;
        }
        if(isIOS(userAgent)) {
            return OS_IOS;
        }
        if(isAndroid(userAgent)) {
            return OS_ANDROID;
        }

        return OS_UNKNOWN;
    }

    // device type

    function isMobile(userAgent) {
        var userAgent = userAgent ? userAgent : navigator.userAgent;
        var isIPhone = (/Mobi/.test(userAgent) && /like Mac OS X/.test(userAgent) && /iPhone/.test(userAgent));
        var isAndroidPhone = /Mobi/.test(userAgent);
        return isIPhone || isAndroidPhone;
    }

    function isTablet(userAgent) {
        var userAgent = userAgent ? userAgent : navigator.userAgent;
        var isIPad = (/Mobi/.test(userAgent) && /like Mac OS X/.test(userAgent) && /iPad/.test(userAgent));
        var isAndroidTablet = /Android/.test(userAgent) && !/Mobi/.test(userAgent);
        return isIPad || isAndroidTablet;
    }

    function isDesktop(userAgent) {
        var userAgent = userAgent ? userAgent : navigator.userAgent;
        return isMacOS(userAgent) || isWindows(userAgent) || isLinux(userAgent);
    }

    function getDeviceType(userAgent) {
        var userAgent = userAgent ? userAgent : navigator.userAgent;

        if(isMobile(userAgent)) {
            return DEVICE_MOBILE;
        }

        if(isTablet(userAgent)) {
            return DEVICE_TABLET;
        }

        if(isDesktop(userAgent)) {
            return DEVICE_DESKTOP;
        }

        return DEVICE_UNKNOWN;
    }

    // Screen size

    function isMobileSize() {
        return window.innerWidth < 601;
    }
}

export default userAgentService;
