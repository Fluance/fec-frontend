import angular from 'angular';
import config from "./exception-handler.provider";

angular
    .module('blocks.exception', ['blocks.logger'])
    .config(config);

