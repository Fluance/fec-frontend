import angular from 'angular';
import navItem from './navItem.directive';
import navBar from './navBar.component';

angular
    .module('blocks.navBar', [])
    .directive('fecNavItem', navItem)
    .component('fecNavBar', navBar);

