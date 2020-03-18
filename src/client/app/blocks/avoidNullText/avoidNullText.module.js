import angular from 'angular';
import avoidNullText from "./avoidNullText";

angular.module('blocks.avoidNullText', [])
    .filter('avoidNullText', avoidNullText);
