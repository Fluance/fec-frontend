import angular from 'angular';
import { httpBuffer, httpThrottlerProvider } from "./httpThrottler";

angular
    .module('blocks.http-interceptor-buffer', [])
    .factory('httpBuffer', httpBuffer);

angular
    .module('blocks.http-throttler', ['blocks.http-interceptor-buffer'])
    .provider('httpThrottler', httpThrottlerProvider);
