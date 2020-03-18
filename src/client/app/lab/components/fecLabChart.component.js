import angular from 'angular';
import _ from 'lodash';
import template from './fecLabChart.component.html';
import * as d3Base from 'd3';
import { lineChunked } from 'd3-line-chunked' // d3 plugin

const d3 = Object.assign(d3Base, { lineChunked });

const LabChart = {
    templateUrl: template,
    controller: controller,
    bindings: {
        datas: '<',
        dates: '<'
    }
};

controller.$inject = [
    '$q',
    '$mdDialog',
    '$filter',
    'moment'
];

function controller($q, $mdDialog, $filter, moment) {
    /*jshint validthis: true */
    var ctrl = this;

    // events
    ctrl.$onInit = onInit;

    // Chart settings
    const FE_BLUE = '#3399FF';
    const FE_RED = '#E3696E';
    const DATA_CIRCLE_RADIUS = 6;
    const DATA_CIRCLE_RADIUS_ACTIVE = 10;
    const SVG_MARGIN = { top: 30, right: 60, bottom: 30, left: 60 }
    const DATA_MODE = {
        range: 'range',
        low: 'low',
        high: 'high'
    }

    var mousePositionX, mousePositionY, activeDataCircle;

    // ------------------------------------- Event methods

    /**
     * Initialize the component
     */
    function onInit() {

        if (!_.isEmpty(ctrl.datas)) {
            ctrl.datas.datas = _.orderBy(ctrl.datas.datas, 'observationdate');
        }

        var datas = angular.copy(ctrl.datas);

        _splitReference(datas.reference).then(function (referenceObject) {
            _createChart(datas.datas, datas.unit, referenceObject);
        }).catch(() => { });
    }

    /**
     * Create the chart
     * @param {*} data chart data
     * @param {*} unit data unit
     * @param {*} reference data reference
     */
    function _createChart(data, unit, reference) {
        // Initialize variables
        var dialogWidth = document.getElementById('lab-chart-dialog').offsetWidth, // offset width of the dialog
            dialogHeight = document.getElementById('lab-chart-dialog').offsetHeight, // offset height of the dialog
            bodyHeight = document.body.scrollHeight, // body height
            chartHeight = bodyHeight == dialogHeight ? (bodyHeight * 0.8) : (bodyHeight * 0.5), // chart height
            width = dialogWidth - SVG_MARGIN.left - SVG_MARGIN.right, // svg width
            height = chartHeight - SVG_MARGIN.top - SVG_MARGIN.bottom, // svg height
            zoomExtentWidth = width + 3, // zoom extent width
            zoomExtentHeight = height + 3, // zoom extent height
            currentTransform = null, // current transformation
            lowReference, // reference of the lower part of the data
            highReference, // reference of the higher part of the data
            minValue = d3.min(data, (d) => (d.value ? Number(d.value) : null)), // min value to display in the chart
            maxValue = d3.max(data, (d) => (d.value ? Number(d.value) : null)), // max value to display in the chart
            newZoom = null, // variable to check if the current zoom process is a new one
            minMaxDate, // array of min and max date
            xScale, // scale of the x axis
            yScale, // scale of the y axis
            gX, // path of data X axis
            gY, // path of data Y axis
            gXGrid, // path of grid X axis
            gYGrid, // path of grid Y axis
            lineChunked, // dataline
            zoom, // zoom
            view, // view
            svg, // svg
            tooltipDiv; // tooltip div

        // Setup the view
        _setupView();

        // Set the extent values
        _setExtentValues();

        // Append viewport
        _appendViewport();

        // Append clip path
        _appendClipPath();

        // Manage data axis
        _manageDataAxis();

        // Add the zoom behavior
        _manageZoomBehavior();

        // Draw references if there are
        _manageReferences();

        // Manage grid axis
        _manageGridAxis();

        // Manage data line
        _manageDataLine();

        // Add the tooltip
        _appendTooltip();

        // Draw the data circles to the chart
        _drawCircles();

        // Call the zoom function on the chart
        view.call(zoom);

        /**
         * Append the clip path to hide everything outside of it (if element uses the clip path)
         */
        function _appendClipPath() {
            view.append("clipPath")
                .attr("id", "mask")
                .append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("height", height)
                .attr("width", width);
        }

        /**
         * Append the tooltip to the dialog
         */
        function _appendTooltip() {
            // Append the tooltip to the dialog
            tooltipDiv = d3.select("#lab-chart-dialog").append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);
        }

        /**
         * Append the viewport to the view
         */
        function _appendViewport() {
            view.append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("height", height)
                .attr("width", width)
                .attr("fill-opacity", "0")
                .style("fill", "white");
        }

        /**
         * Draw the data circles to the chart and append the listeners to show or hide the tooltip
         */
        function _drawCircles() {
            view.selectAll(".circle")
                .data(data.filter((d) => (d.value != null))).enter().append("circle")
                .attr("class", "circle")
                .attr("fill", FE_BLUE)
                .attr("clip-path", "url(#mask)")
                .attr("r", DATA_CIRCLE_RADIUS)
                .attr("cx", (d) => xScale(moment(d.observationdate)))
                .attr("cy", (d) => yScale(d.value))
                .on("mouseover", _showDataTooltip)
                .on("click", _showDataTooltip)
                .on("mouseout", (d) => _hideTooltip());
        }


        /**
         * Draw the X axis of the grid
         */
        function _drawGridXAxis() {
            gXGrid.call(d3.axisBottom(xScale).tickFormat("").tickSizeInner(-height));
            d3.select("#gridAxisX")
                .selectAll(".tick line")
                .attr("stroke-width", ".2");
        }

        /**
         * Draw the Y axis of the grid
         */
        function _drawGridYAxis() {
            gYGrid.call(d3.axisLeft(yScale).tickFormat("").tickSizeInner(-width));
            d3.select("#gridAxisY")
                .selectAll(".tick line")
                .attr("stroke-width", ".2");
        }

        /**
         * Draw the area in the chart for the high reference
         */
        function _drawHighReferenceArea() {
            let highReferenceArea = d3.area()
                .curve(d3.curveMonotoneX)
                .x((d) => xScale(moment(d.observationdate)))
                .y0(0)
                .y1((d) => yScale(highReference));

            view.append("path")
                .datum(data)
                .attr("fill", FE_RED)
                .attr("d", highReferenceArea);
        }

        /**
         * Draw the data line into the chart
         */
        function _drawLine() {
            view.append('g')
                .attr("class", "charts")
                .attr("clip-path", "url(#mask)")
                .datum(data)
                .call(lineChunked);
        }

        /**
         * Draw the area in the chart for the low reference
         */
        function _drawLowReferenceArea() {
            let lowReferenceArea = d3.area()
                .curve(d3.curveMonotoneX)
                .x((d) => xScale(moment(d.observationdate)))
                .y0(height)
                .y1((d) => yScale(lowReference));

            view.append("path")
                .datum(data)
                .attr("fill", FE_RED)
                .attr("d", lowReferenceArea);
        }

        /**
         * Draw the X axis of the chart
         */
        function _drawXAxis() {
            let xAxis = d3.axisBottom(xScale)
                .tickFormat((d) => $filter('formatDate')(moment(d), 'date'));
            gX.call(xAxis);
        }

        /**
         * Draw the Y axis of the chart
         */
        function _drawYAxis() {
            var yAxis = d3.axisLeft(yScale);
            gY.call(yAxis);
        }

        /**
         * Hide the tooltip div and reset the previous selected data circle radius
         */
        function _hideTooltip() {
            d3.select(activeDataCircle).attr("r", DATA_CIRCLE_RADIUS);
            activeDataCircle = null;
            tooltipDiv.transition()
                .duration(500)
                .style("opacity", 0);
        }

        /**
         * Setup and draw the X and Y axis for the data
         */
        function _manageDataAxis() {
            // Define the X axis
            xScale = d3.scaleTime()
                .domain(minMaxDate)
                .range([0, width]);

            gX = view.append("g")
                .attr("class", "axis axis--x")
                .attr("transform", "translate(0," + height + ")");

            // Draw the X axis to the chart
            _drawXAxis();

            // Define the Y axis
            yScale = d3.scaleLinear()
                .domain([minValue, maxValue])
                .range([height, 0]);

            gY = view.append("g")
                .attr("class", "axis axis--y");

            // Draw the Y axis to the chart
            _drawYAxis();
        }

        /**
         * Setup and draw the data line
         */
        function _manageDataLine() {
            // Define the data line
            lineChunked = d3.lineChunked()
                .x((d) => xScale(moment(d.observationdate)))
                .y((d) => yScale(d.value))
                .curve(d3.curveLinear)
                .defined((d) => (d.value != null))
                .lineStyles({
                    stroke: FE_BLUE,
                    'stroke-width': 2
                });

            // Draw the data line
            _drawLine();
        }

        /**
         * Setup and draw the X and Y axis for the grid
         */
        function _manageGridAxis() {
            // Define the Y axis of the grid
            gXGrid = view.append("g")
                .attr("class", "axis axis--x")
                .attr("id", "gridAxisX")
                .attr("transform", "translate(0," + height + ")");

            // Draw the X axis of the grid to the chart
            _drawGridXAxis();

            // Define the Y axis of the grid
            gYGrid = view.append("g")
                .attr("class", "axis axis--y")
                .attr("id", "gridAxisY");

            // Draw the Y axis of the grid to the chart
            _drawGridYAxis();
        }

        /**
         * Draw the references if there are any
         */
        function _manageReferences() {
            // Draw the low reference area, if needed
            if (lowReference != null) {
                _drawLowReferenceArea();
            }

            // Draw the high reference area, if needed
            if (highReference != null) {
                _drawHighReferenceArea();
            }
        }

        /**
         * Setup the zoom behavior
         */
        function _manageZoomBehavior() {
            // Define the zoom behavior
            zoom = d3.zoom()
                .scaleExtent([1, 100])
                .translateExtent([[0, 0], [zoomExtentWidth, zoomExtentHeight]])
                .extent([[0, 0], [zoomExtentWidth, zoomExtentHeight]])
                .on("zoom", _zoomed);
        }

        /**
         * Set the low- and high- reference and also set the min and max values of the chart
         */
        function _setExtentValues() {
            if (reference) {
                reference.mode
                switch (reference.mode) {
                    case DATA_MODE.range:
                        lowReference = Number(_.first(reference.data));
                        highReference = Number(_.last(reference.data));
                        minValue = minValue < lowReference ? minValue : lowReference;
                        maxValue = maxValue > highReference ? maxValue : highReference;
                        break;

                    case DATA_MODE.low:
                        highReference = Number(reference.data);
                        maxValue = maxValue > highReference ? maxValue : highReference;
                        break;

                    case DATA_MODE.high:
                        lowReference = Number(reference.data);
                        minValue = minValue < lowReference ? minValue : lowReference;
                        break;

                    default:
                        break;
                }
            }

            minValue = minValue - 10;
            maxValue = maxValue + 10;
            minMaxDate = d3.extent(data, (d) => moment(d.observationdate));
        }

        /**
         * Setup the view
         */
        function _setupView() {
            // Append the svg object to the dialog
            view = d3.select(".lab-chart-dialog")
                .append("svg")
                .attr("xmlns", 'http://www.w3.org/2000/svg')
                .attr("width", dialogWidth)
                .attr("height", chartHeight)
                .append("g")
                .attr("class", "view")
                .attr("transform", "translate(" + SVG_MARGIN.left + "," + SVG_MARGIN.top + ")")

            svg = d3.select("svg");

            if (currentTransform) svg.attr('transform', currentTransform);
        }

        /**
         * Show the tooltip next to the data circle which is selected/hovered by the user
         * @param {*} d Data of the current position
         */
        function _showDataTooltip(d) {
            // Reset previous activated data circle radius and set new one
            if (activeDataCircle) {
                d3.select(activeDataCircle).attr("r", DATA_CIRCLE_RADIUS);
            }
            activeDataCircle = this;
            d3.select(this).attr("r", DATA_CIRCLE_RADIUS_ACTIVE);

            // Calculate tooltip position
            mousePositionX = d3.event.pageX;
            mousePositionY = d3.event.pageY;

            let modalWidth = document.getElementById('lab-chart-dialog').offsetWidth;
            let modalHeight = document.getElementById('lab-chart-dialog').offsetHeight;

            let offsetX = (document.body.clientWidth - modalWidth) / 2;
            let offsetY = (document.body.clientHeight - modalHeight) / 2;

            let tooltipPositionX = (mousePositionX - offsetX + 10);
            let tooltipPositionY = (mousePositionY - offsetY - 10);

            tooltipPositionX = (mousePositionX + 150) > (document.body.clientWidth - offsetX - SVG_MARGIN.right) ? mousePositionX - offsetX - 170 : tooltipPositionX;

            // Write to the tooltip div
            tooltipDiv.html($filter('formatDate')(moment(d.observationdate), 'dateTime') + '<br />' + $filter('translate')('lab.MEASUREMENT') + ' (' + unit + '): ' + d.value)
                .style("left", tooltipPositionX + "px")
                .style("top", tooltipPositionY + "px");

            // Show the tooltip div
            tooltipDiv.transition()
                .duration(200)
                .style("opacity", .9);
        }

        /**
         * Rescale and redraw all the axis and data while zooming
         */
        function _zoomed() {
            let z = d3.event.transform.toString();
            if (z != newZoom) {
                _hideTooltip();
                newZoom = z;

                // Rescale axis
                let newXScale = d3.scaleTime().domain(minMaxDate).range([0, width]);

                let newXDomain = d3.event.transform.rescaleX(newXScale).domain();

                xScale.domain(newXDomain);

                // Redraw axis
                _drawXAxis();
                _drawGridXAxis();

                // Remove old elements
                d3.select('.charts').remove();
                view.selectAll(".circle").remove();

                // Draw new element
                _drawLine();
                _drawCircles();
            }
        }
    }

    // ------------------------------------ helper methods

    // Prepare the reference to display and handle it correct
    function _splitReference(reference) {
        var deferred = $q.defer();
        var returnValue;

        if (reference) {
            reference = reference.replace(/\s/g, '');

            if (reference.indexOf('-') !== -1) {
                returnValue = reference.split('-');
                deferred.resolve({
                    data: returnValue,
                    mode: DATA_MODE.range
                });
            } else if (reference.indexOf('<') !== -1) {
                returnValue = reference.split('<');
                deferred.resolve({
                    data: _.last(returnValue),
                    mode: DATA_MODE.low
                });
            } else if (reference.indexOf('>') !== -1) {
                returnValue = reference.split('>');
                deferred.resolve({
                    data: _.last(returnValue),
                    mode: DATA_MODE.high
                });
            } else {
                deferred.reject();
            }
        } else {
            deferred.resolve();
        }

        return deferred.promise;
    }
}

export default LabChart;
