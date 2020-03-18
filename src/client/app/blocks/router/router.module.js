import angular from 'angular';
import routerServiceProvider from './router.service';

angular
    .module('blocks.router', [
        'ui.router',
        'blocks.logger'
    ])
    .provider('routerService', routerServiceProvider);

