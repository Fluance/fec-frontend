import angular from 'angular';
import { externalAccessFilter, config as configExternalAccessFilter } from './externalAccessFilter';
import { timeoutInterceptor, config as configTimeoutInterceptor } from './timeoutInterceptor';

angular
    .module('blocks.httpInterceptors', [])
    .factory('externalAccessFilter', externalAccessFilter)
    .factory('timeoutInterceptor', timeoutInterceptor)
    .config(configExternalAccessFilter)
    .config(configTimeoutInterceptor)

