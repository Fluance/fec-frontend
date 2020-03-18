import angular from 'angular';
import noContentPlaceholder from './noContentPlaceholder';

angular
    .module('blocks.noContentPlaceholder', [])
    .filter('noContentPlaceholder', noContentPlaceholder);

