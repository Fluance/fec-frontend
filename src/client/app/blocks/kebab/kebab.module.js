import angular from 'angular';
import kebab from './kebab';

angular
    .module('blocks.kebab', [])
    .filter('kebab', kebab);

