// modules
import 'jquery';
import 'angular';
import 'angular-scroll';
import 'angular-animate';
import 'angular-cache';
//import 'angular-fqueue/angular-fqueue.min';
import 'angular-aria';
import 'angular-messages';
import 'angular-material';
import moment from 'moment';
window.moment = moment; // because Dashboard "components" (services) => lazy loaded
import 'angular-moment';
import 'angular-sanitize';
import 'angular-scroll';
import 'angular-translate';
import 'messageformat';
import 'angular-translate-interpolation-messageformat';
import 'angular-translate-loader-partial';
import 'angular-translate-loader-static-files';
import 'angular-ui-router';
import 'angularplus';
import 'jquery-ui';
import 'js-data/dist/js-data';
import 'js-data-angular';
import 'ng-infinite-scroll';
import 'toastr';
//import 'lodash'; // Injected as global
import 'angular-mocks';
import 'sortablejs';
import 'angular-legacy-sortablejs-maintained';
import 'bower-angular-dashboard'; // TODO: must change module dependency 'ng-sortable' => 'as.sortable'
import 'angular-scrollto';
//import 'fastclick'; // Injected as global

import 'hammerjs';
import 'angular-hammer';
import 'moment-timezone';

import 'iframe-resizer';
import 'angular-bind-html-compile';
import 'angular-utf8-base64';
import 'angular-img-http-src';
import 'scrollmonitor';
import 'ng-sortable';
import 'ng-wig';
import 'ng-quill';

import 'angular-local-storage';
import 'angular-ui-sortable';
import 'jquery-ui-touch-punch';

import 'smdatetimerangepicker'; // include css in index.js??

import 'handsontable';
import 'ng-handsontable/dist/ngHandsontable'; // ngHandsontable

import 'chart.js';
import 'chartjs-plugin-zoom';
import 'unorm';

// CSS
import 'angular-material/angular-material.css';
import 'angular-data-table/release/material.css';
import 'angular-data-table/release/dataTable.css';
import 'smdatetimerangepicker/src/picker.css';
import 'handsontable/dist/handsontable.css';
import 'quill/dist/quill.snow.css'


/*
require('angular-animate');
require('angular-cache');
//require('angular-fqueue/angular-fqueue.min');
require('angular-aria');
require('angular-messages');
require('angular-material');
require('moment');
require('angular-moment');
require('angular-sanitize');
require('angular-scroll');
require('angular-translate');
require('messageformat');
require('angular-translate-interpolation-messageformat');
require('angular-translate-loader-partial');
require('angular-translate-loader-static-files');
require('angular-ui-router');
require('angularplus');
require('jquery-ui');
require('js-data');
require('js-data-angular');
require('ng-infinite-scroll');
require('toastr');
require('lodash');
require('angular-mocks');
require('sortablejs');
require('angular-legacy-sortablejs-maintained');
require('bower-angular-dashboard');
require('angular-scrollto');
require('fastclick');

require('highcharts'); // highcharts, highcharts-more, exporting
require('highcharts/highcharts-more');
require('highcharts/modules/exporting');

require('hammerjs');
require('angular-hammer');
require('moment-timezone');

require('ng-wig');
require('angularjs-datetime-picker-v2');
require('ng-file-upload');

require('iframe-resizer');
require('angular-bind-html-compile');
require('angular-utf8-base64');
require('angular-img-http-src');
require('scrollmonitor');
require('ng-sortable');

require('chart.js');
require('angular-local-storage');
require('angular-ui-sortable');
require('jquery-ui-touch-punch');
require('numbro');
require('pikaday');
require('handsontable');
require('ng-handsontable/dist/ngHandsontable.js'); // no "main" in package.json
require('chartjs-plugin-zoom');
require('unorm');
require('oclazyload');
require('angular-touch');
require('angular-data-table');
require('md-pickers');

// CSS
require('angular-material/angular-material.css');
require('toastr/build/toastr.css');
// bower-angular-dashboard => from js import
require('ng-wig/dist/css/ng-wig.css');
require('components-font-awesome');
require('ng-sortable/dist/ng-sortable.css');
require('pikaday/css/pikaday.css');
require('handsontable/dist/handsontable.css');
require('angular-data-table/release/dataTable.css');
require('angular-data-table/release/material.css');
require('md-pickers/dist/mdPickers.css');

// moment locale
require('moment/locale/fr');
require('moment/locale/de');
require('moment/locale/it');

*/
