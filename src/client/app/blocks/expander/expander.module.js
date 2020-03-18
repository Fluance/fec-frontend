import angular from 'angular';
import expander from './expander.component';
import expanderAccordion from './expanderAccordion.component';

angular.module('blocks.expander', [])
    .component('expander', expander)
    .component('expanderAccordion', expanderAccordion);
