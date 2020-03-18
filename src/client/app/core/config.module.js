import angular from 'angular';
import configProvider from './config.provider';

/**
 *
 * @ngdoc module
 * @name config
 * @module config
 * @packageName config
 **/
angular
    .module('config', [])
    .provider('config', configProvider);
