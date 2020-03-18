import angular from 'angular';
import OrderByObjectPropertyFilter from './orderByObjectPropertyFilter';

angular
    .module('blocks.orderByObjectPropertyFilter', [])
    .filter('orderByObjectProperty', OrderByObjectPropertyFilter);

