import angular from 'angular';
import TabOpener from './tabOpener.service';

angular
    .module('blocks.tabOpener', [])
    .factory('TabOpenerService', TabOpener);

