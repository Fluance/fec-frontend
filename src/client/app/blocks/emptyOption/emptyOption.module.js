import angular from 'angular';
import emptyOption from "./emptyOption";

angular
    .module('blocks.emptyOption', [])
    .filter('emptyOption', emptyOption);
