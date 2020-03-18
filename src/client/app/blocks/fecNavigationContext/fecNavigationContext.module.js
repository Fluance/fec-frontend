import angular from 'angular';
import fecNavigationContextService from './fecNavigationContext.service';

angular
    .module('blocks.fecNavigationContext', [])
    .service('fecNavigationContextService', fecNavigationContextService);
