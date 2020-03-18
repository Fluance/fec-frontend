import angular from 'angular';
import SyncScopes from './virtualRepeatSyncScope.directive';

angular
    .module('blocks.virtualRepeatSyncScope', [])
    .directive('fecVirtualRepeatSyncScope', SyncScopes);


