import angular from 'angular';
import formatCurrency from './currencyFormatter';

angular
    .module('blocks.currencyFormatter', [])
    .filter('formatCurrency', formatCurrency);
