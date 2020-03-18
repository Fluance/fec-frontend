const themingExport = ['$mdThemingProvider', theming];

toastrConfig.$inject = ['toastr'];

/* @ngInject */
function toastrConfig(toastr) {
    toastr.options.timeOut = 4000;
    toastr.options.preventDuplicates = true;
    toastr.options.progressBar = true;
    toastr.options.positionClass = 'toast-bottom-right';
}

configure.$inject = ['$logProvider', 'routerServiceProvider', 'configProvider'];
/* @ngInject */
function configure($logProvider, routerServiceProvider, configProvider) {
    if ($logProvider.debugEnabled) {
        $logProvider.debugEnabled(true);
    }

    routerServiceProvider.configure({
        docTitle: configProvider.config.appTitle + ': '
    });
}

setHashPrefix.$inject = ['$locationProvider'];
function setHashPrefix($locationProvider) {
    $locationProvider.hashPrefix('');
}

//theming.$inject = [];
/* @ngInject */
function theming($mdThemingProvider) {

    var fluancePrimary = {
        '50': '#b3d9ff',
        '100': '#99ccff',
        '200': '#80bfff',
        '300': '#66b2ff',
        '400': '#4da6ff',
        '500': '#3399FF',
        '600': '#198cff',
        '700': '#007fff',
        '800': '#0073e5',
        '900': '#0066cc',
        'A100': '#cce5ff',
        'A200': '#e5f2ff',
        'A400': '#ffffff',
        'A700': '#0059b3',
        'contrastDefaultColor': 'light'
    };
    $mdThemingProvider
        .definePalette('fluancePrimary',
            fluancePrimary);

    var fluanceAccent = {
        '50': '#a1a1a1',
        '100': '#aeaeae',
        '200': '#bbbbbb',
        '300': '#c8c8c8',
        '400': '#d4d4d4',
        '500': '#e1e1e1',
        '600': '#fbfbfb',
        '700': '#ffffff',
        '800': '#ffffff',
        '900': '#ffffff',
        'A100': '#fbfbfb',
        'A200': '#EEEEEE',
        'A400': '#e1e1e1',
        'A700': '#ffffff'
    };
    $mdThemingProvider
        .definePalette('fluanceAccent',
            fluanceAccent);

    var fluanceWarn = {
        '50': '#f7d4d6',
        '100': '#f3bfc1',
        '200': '#efa9ac',
        '300': '#eb9498',
        '400': '#e77e83',
        '500': '#E3696E',
        '600': '#df5359',
        '700': '#db3e44',
        '800': '#d72930',
        '900': '#c2242b',
        'A100': '#fbeaeb',
        'A200': '#ffffff',
        'A400': '#ffffff',
        'A700': '#ac2026'
    };
    $mdThemingProvider
        .definePalette('fluanceWarn',
            fluanceWarn);

    var fluanceBackground = {
        '50': '#ffffff',
        '100': '#ffffff',
        '200': '#ffffff',
        '300': '#ffffff',
        '400': '#ffffff',
        '500': '#FBFBFB',
        '600': '#eeeeee',
        '700': '#e1e1e1',
        '800': '#d5d5d5',
        '900': '#c8c8c8',
        'A100': '#ffffff',
        'A200': '#ffffff',
        'A400': '#ffffff',
        'A700': '#bbbbbb'
    };
    $mdThemingProvider
        .definePalette('fluanceBackground',
            fluanceBackground);

    $mdThemingProvider.theme('default')
        .primaryPalette('fluancePrimary')
        .accentPalette('fluanceAccent')
        .warnPalette('fluanceWarn');
        //.backgroundPalette('fluanceBackground');

}

export {
    toastrConfig,
    configure,
    setHashPrefix,
    themingExport as theming
};
