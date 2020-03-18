import angular from 'angular';
import waitForRendering from './waitForRendering';

angular
    .module('blocks.waitForRendering', [])
    .service('waitForRendering', waitForRendering);


