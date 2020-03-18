import angular from 'angular';
import HighlightTextFilter from './highlightTextFilter';

angular
    .module('blocks.highlightTextFilter', [])
    .filter('highlightText', HighlightTextFilter);


