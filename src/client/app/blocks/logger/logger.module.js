import angular from 'angular';
import logger from './logger';

angular
    .module('blocks.logger', [])
    .factory('logger', logger);

