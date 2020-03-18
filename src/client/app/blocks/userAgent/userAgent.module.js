import angular from 'angular';
import { cssChrome, cssFirefox, cssIe, cssEdge, cssBrowser } from './userAgent.directive';
import userAgentService from './userAgent.service';
import iconBrowser from './components/fecIconBrowser.component';
import iconDeviceType from './components/fecIconDeviceType.component';
import iconOs from './components/fecIconOs.component';
import userAgentBar from './components/fecUserAgentBar.component';

angular
    .module('blocks.userAgent', [])
    .directive('cssChrome', cssChrome)
    .directive('cssFirefox', cssFirefox)
    .directive('cssIe', cssIe)
    .directive('cssEdge', cssEdge)
    .directive('cssBrowser', cssBrowser)
    .service('userAgentService', userAgentService)
    .component('fecIconBrowser', iconBrowser)
    .component('fecIconDeviceType', iconDeviceType)
    .component('fecIconOs', iconOs)
    .component('fecUserAgentBar', userAgentBar);


