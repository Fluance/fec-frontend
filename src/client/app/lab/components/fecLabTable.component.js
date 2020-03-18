import angular from 'angular';
import _ from 'lodash';
import template from './fecLabTable.component.html';

const LabTable = {
    templateUrl: template,
    controller: controller,
    bindings: {
        tableData: '<',
        tableDates: '<'
    }
};

controller.$inject = [
    '$compile',
    '$filter',
    '$rootScope',
    '$scope',
    '$translate',
    '$window',
    'labChartDialogService',
    'userAgentService',
    'waitForRendering',
    'LabService'
];

function controller(
    $compile,
    $filter,
    $rootScope,
    $scope,
    $translate,
    $window,
    labChartDialogService,
    userAgentService,
    waitForRendering,
    labService
) {
    /*jshint validthis: true */
    var ctrl = this;

    // custom height for all rows
    var ROW_HEIGHTS = 36;

    ctrl.ABNORMALFLAG_HIGH = 'H';
    ctrl.ABNORMALFLAG_LOW = 'L';
    ctrl.RESULT_STATUS = 'F';

    ctrl.$onInit = _onInit;
    ctrl.$onDestroy = _onDestroy;

    ctrl.openLabChartDialog = openLabChartDialog;

    function _onInit() {
        ctrl.hotTable = {};
        ctrl.hotTable.dataChart = [];
        ctrl.hotTable.settings = {
            renderAllRows: true,
            stretchH: 'all',
            autoWrapRow: true,
            rowHeaders: false,
            colHeaders: false,
            rowHeights: ROW_HEIGHTS,
            afterInit: function () {
                if (this.getSettings().fixedRowsTop > 1) {
                    ctrl.hotTableVerticalInstance = this;
                    adjustTable();
                } else {
                    ctrl.hotTableHorizontalInstance = this;
                    adjustTable();
                }
            },
            cells: function (row, col, prop) {
                if (prop && 'number' === typeof (prop)) {
                    var cellProperties = {};

                    if (row === 1 && col) {
                        cellProperties.renderer = "renderDisplayChart";
                    }

                    if (row > 3 && col) {
                        cellProperties.renderer = "renderValues";
                    }

                    return cellProperties;
                }
            }
        };

        _registerCustomRenderers();

        waitForRendering.wait(function () {
            _refreshTable();

            $rootScope.$on(labService.EVENT_LAB_TABLE_CHANGED, _labTableChanged);
        });
    }

    function _onDestroy() {
        angular.element($window).unbind('resize', adjustTable);
    }

    /**
     * Redraw the table after resize screen
     * @private
     */
    function _resizeScreen() {
        angular.element($window).bind('resize', adjustTable);

        adjustTable();
    }

    function _labTableChanged(event, tableDataAndDates) {
        ctrl.tableData = tableDataAndDates.data;
        ctrl.tableDates = tableDataAndDates.dates;
        _refreshTable();
    }

    function _refreshTable() {
        _getDataHotTable();
        _setColumnsSetting();
        _resizeScreen();
    }

    function adjustTable() {
        var wHeight = $window.innerHeight;
        var wWidth = $window.innerWidth;
        var selectorPrefix;
        var selectedHot;

        // no numeric measurements
        if (!ctrl.tableData || ctrl.tableData.length <= 0) {
            return;
        }

        if (wWidth < 1280) {
            // -- vertical --
            selectorPrefix = '.stripedVertical';
            selectedHot = ctrl.hotTableVerticalInstance;
        }
        else {
            // -- horizontal --
            selectorPrefix = '.stripedHorizontal';
            selectedHot = ctrl.hotTableHorizontalInstance;
        }

        if (selectedHot) {
            waitForRendering.wait(function () {
                // Device height
                var windowHeight = wHeight;
                var flOverflowYHidden = true; // IE11 bug with "overflow:auto": element without width/height => overflow:visible
                var flOverflowXHidden = true;

                // Lab Results content data height (total height of all the rows of lab results)
                var contentHeight = Math.round(angular.element(selectorPrefix + ' .handsontable-container.handsontable .ht_master .wtHider').innerHeight());
                var containerElement = angular.element('#labDataTable')[0]; // DOM element: hot-table container
                var contentTop = Math.round(containerElement.getBoundingClientRect().top);
                var footerHeight = Math.round(angular.element('#footerbar').innerHeight());
                var totalUsedHeight = contentTop + footerHeight; // total height used by other elements

                // use maximum available height to display lab data
                if (windowHeight - totalUsedHeight < contentHeight) {
                    contentHeight = windowHeight - totalUsedHeight;
                    flOverflowYHidden = false;
                }

                // check width
                var contentWidth = angular.element(selectorPrefix + ' .handsontable-container.handsontable .ht_master .wtHider').innerWidth();
                var containerWidth = angular.element(selectorPrefix + ' .handsontable-container.handsontable .ht_master .wtHolder').innerWidth();

                // verify if there is horizontal scrollbar
                if (contentWidth > containerWidth) {
                    flOverflowXHidden = false;
                }

                // adjust height when there is horizontal scroll bar without vertical scrollbar (in Windows)
                if (flOverflowYHidden && !flOverflowXHidden && userAgentService.getOS(navigator.userAgent) === userAgentService.OS_WINDOWS) {
                    contentHeight += 10; // adjust for padding (Browser+scrollbar: add some height to be able to see contents)
                }

                // set container height (md-card)
                angular.element('#labDataTable').attr('style', 'height:' + contentHeight + 'px; width:' + containerWidth + '; padding: 0px;');

                // set table height
                selectedHot.updateSettings({ height: contentHeight });

                // IE11 overflow:auto fix (scrollbars): set overflow property manually
                if (userAgentService.isIE()) {
                    //  (overflow-y)
                    angular.element(selectorPrefix + ' .handsontable-container.handsontable .ht_master .wtHolder').css({
                        'height': contentHeight + 'px',
                        'overflow-y': flOverflowYHidden ? 'hidden' : 'visible'
                    });
                }
            });
        }
    }

    /**
     * Return true if the number is even
     * @param n
     * @returns {boolean}
     * @private
     */
    function _isEven(n) {
        n = Number(n);
        return n === 0 || !!(n && !(n % 2));
    }

    /**
     * Return true if the number is odd
     * @param n
     * @returns {boolean}
     * @private
     */
    function _isOdd(n) {
        return _isEven(Number(n) + 1);
    }

    // --------------------------------------------------------------------
    // HANDSONTABLE
    /**
     * Get data
     * @private
     */
    function _getDataHotTable() {
        _initializeDataHotTable();

        var item = {
            analysisname: '',
            displayChart: '',
            unit: $translate.instant('core.UNIT'),
            reference: $translate.instant('lab.REFERENCE')
        };

        _.each(ctrl.tableDates, function (date, index) {
            item['value' + index] = $filter('formatDate')(date, 'dateTimeYY');
        });

        ctrl.hotTable.data.push(item);

        _.each(ctrl.tableData, function (data) {
            item = {
                analysisname: data.analysisname,
                displayChart: data,
                unit: data.unit,
                reference: data.reference
            };
            _.each(data.datas, function (data, index) {
                item['value' + index] = data;
            });
            ctrl.hotTable.data.push(item);
        });

        _getDataInverseHotTable();
    }

    /**
     * Get data for inverse table
     * @private
     */
    function _getDataInverseHotTable() {
        _.each(ctrl.hotTable.data[0], function (data, index) {
            var item = [];
            for (var i = 0; i < ctrl.hotTable.data.length; i++) {
                item.push(ctrl.hotTable.data[i][index]);
            }
            ctrl.hotTable.dataReverse.push(item);
        });
    }

    /**
     * Initialize data
     * @private
     */
    function _initializeDataHotTable() {
        ctrl.hotTable.data = [];
        ctrl.hotTable.dataReverse = [];
    }

    /**
     * Set the column settings
     * @private
     */
    function _setColumnsSetting() {
        ctrl.hotTable.columnsHorizontal = [];

        _.each(ctrl.hotTable.data[0], function (data, index) {
            var setting = {
                data: index,
                type: 'text',
                readOnly: true
            };
            if (index === "displayChart") {
                setting['renderer'] = "renderDisplayChart";
            } else if (index.indexOf("value") === 0) {
                setting['renderer'] = "renderValues";
            }

            ctrl.hotTable.columnsHorizontal.push(setting);
        });
    }

    /**
     * Function to register renderers
     * @private
     */
    function _registerCustomRenderers() {
        Handsontable.renderers.registerRenderer('renderValues', _renderValues);
        Handsontable.renderers.registerRenderer('renderDisplayChart', _renderDisplayChart);
    }

    /**
     * Renderer for the displayChart column
     * @param instance
     * @param td
     * @param row
     * @param col
     * @param prop
     * @param value
     * @param cellProperties
     * @returns {*}
     * @private
     */
    function _renderDisplayChart(instance, td, row, col, prop, value, cellProperties) {
        var chartPos;
        var classes = '';
        var compiled;
        var icon;

        ctrl.CHART_POSITION = 1;
        if (value && !!value.displayChart && row) {
            if (_.isEqual(ctrl.CHART_POSITION, col)) {
                chartPos = row;
            } else if (_.isEqual(ctrl.CHART_POSITION, row)) {
                chartPos = col;
            }
            ctrl.hotTable.dataChart[chartPos] = value;
            compiled = $compile('<fec-icon type="insertChart" size="xs" color="fe-blue-icon" ng-click="$ctrl.openLabChartDialog($event,  $ctrl.hotTable.dataChart[' + chartPos + '], $ctrl.tableDates)"></fec-icon>')($scope);

            td.innerHTML = '';
            if (compiled) {
                icon = compiled[0];
                td.appendChild(icon);
            }
            classes += ' labNormal';
            if (_isOdd(row)) {
                classes += " backgroundColor";
            }
        } else {
            td.innerHTML = '';
            classes += ' htDimmed';
        }

        td.className = classes;
        return td;
    }

    /**
     * Renderer for the value columns
     * @param instance
     * @param td
     * @param row
     * @param col
     * @param prop
     * @param value
     * @param cellProperties
     * @returns {*}
     * @private
     */
    function _renderValues(instance, td, row, col, prop, value, cellProperties) {
        var data = '';
        var classes = '';
        var icon = undefined;

        if (value && row) {
            data = value.value;

            if (value.abnormalflag) {
                var compiled = undefined;
                if (ctrl.ABNORMALFLAG_LOW === value.abnormalflag) {
                    compiled = $compile('<fec-icon type="arrowDownward" size="xs"></fec-icon>')($scope);
                } else {
                    compiled = $compile('<fec-icon type="arrowUpward" size="xs"></fec-icon>')($scope);
                }

                icon = compiled[0];
                classes += ' labAbnormal';
            } else {
                classes += ' labNormal';
            }

            if (value.resultstatus && ctrl.RESULT_STATUS !== value.resultstatus) {
                data += '*';
                classes += " labResultstatus";
            }

            if (_isOdd(row)) {
                classes += " backgroundColor";
            }
        } else {
            data = value;
            classes += ' htDimmed';
        }

        td.className = classes;
        td.innerHTML = _.isNull(data) ? '' : data;
        if (icon) {
            td.appendChild(icon);
        }
        return td;
    }

    // Open the chart to display the data on a chart
    function openLabChartDialog(ev, result, observationDates) {
        labChartDialogService.showDialog(ev, result, observationDates);
    }
}

export default LabTable;
