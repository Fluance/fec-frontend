import angular from 'angular';
import DateParser from './dateParser';

angular
    .module('blocks.dateParser', [])
    .service('dateParser', DateParser);
