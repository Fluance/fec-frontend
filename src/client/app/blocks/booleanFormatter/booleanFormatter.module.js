import angular from 'angular';
import formatBoolean from "./booleanFormatter";

angular
    .module('blocks.booleanFormatter', [])
    .filter('formatBoolean', formatBoolean);
