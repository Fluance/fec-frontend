// jscs:disable requireParenthesesAroundIIFE
/* jshint -W117, -W030 */
import angular from 'angular';
import firstLetter from './firstletter';
import firstLetterUpperCase from './firstletterUpperCase';

angular
    .module('blocks.firstletter', [])
    .filter('firstLetter', firstLetter)
    .filter('firstLetterUpperCase', firstLetterUpperCase);
