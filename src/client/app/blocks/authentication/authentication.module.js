import angular from 'angular';

import authenticationService from './authentication.service';
import { authorizationInterceptor, config as configAuthorization } from "./authorization.interceptor";
import { dataServiceAuthentication, run as runDataServiceAuthentication } from "./data/authentication.dataservice";
import { dataServiceJWT, run as runDataServiceJWT } from "./data/jwt.dataservice";
//import authorizationInterceptor from "./authorization.interceptor";
//import dataServiceAuthentication from './data/authentication.dataservice';
//import dataServiceJWT from './data/jwt.dataservice';

// NOTE: issue with eg service registration in "module" and config/run in imported file
// => ERROR = no module defined in config/run

/**
 * @ngdoc           module
 * @name            blocks.authentication
 * @module          blocks.authentication
 * @packageName     Authentication
 **/
angular
    .module('blocks.authentication', [])
    .config(configAuthorization)
    .run(runDataServiceAuthentication)
    .run(runDataServiceJWT)
    .service('authenticationService', authenticationService)
    .factory('authorizationInterceptor', authorizationInterceptor)
    .factory('dataservice.authentication', dataServiceAuthentication)
    .factory('dataservice.jwt', dataServiceJWT);

