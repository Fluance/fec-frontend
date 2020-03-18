import template from './fecMeteoDataList.component.html';

const fecMeteoDataList = {
    bindings: {
        meteoDate: '@',
        meteoDuration: '@',
        companyId: '@'
    },
    controller: ['moment', '$http', '$q', '$filter', 'config', 'dataservice.meteo', controller],
    controllerAs: 'vm',
    templateUrl: template
};

function controller(moment, $http, $q, $filter, config, dataserviceMeteo) {
    var ctrl = this;

    // Colors
    var colorSupernova = '#FFCC00';
    var colorBarleyWhite = '#FFF5CC';

    // Chart and chart data
    var chart;
    var chartHeight = 150;
    var lineData;
    var dateData;

    var chartLabel = $filter('translate')('core.METEO.TEMPERATURE');

    ctrl.days = [];

    // events
    ctrl.$onInit = onInit;
    // interface
    ctrl.isActive = isActive;
    ctrl.activateDay = activateDay;

    // ------------------------------------- Events

    function onInit() {
        ctrl.isLoading = true;
        var startDate = $filter('formatDate')(ctrl.meteoDate, 'englishDateTime');
        var endDate = $filter('formatDate')(moment(startDate).add(ctrl.meteoDuration, 'days'), 'englishDateTime');
        loadPreview(startDate, endDate, []).then(function(dailyPreviews) {
            ctrl.days = dailyPreviews;
            ctrl.hasData = ctrl.days && ctrl.days.length > 0;
            if (ctrl.hasData) {
                activateDay(startDate);
                createChart();
            }
        });
    }

    /**
     * Load the weather data preview
     */
    function loadPreview(startDate, endDate, dailyPreviews) {
        var deferred = $q.defer();
        var previewDate = $filter('formatDate')(startDate, 'englishDateTime');
        dataserviceMeteo.getMeteoPreview(ctrl.companyId, previewDate).then(function(preview) {
            dailyPreviews.push({
                date: previewDate,
                data: preview.data
            });
        }, function(reason) {
            deferred.reject(reason);
        }).then(function() {
            if (dailyPreviews.length > 0) {
                if (moment(endDate).diff(moment(startDate), 'days') > 1) {
                    startDate = moment(startDate).add(1, 'days');
                    loadPreview(startDate, endDate, dailyPreviews).then(function(previews) {
                        dailyPreviews = previews;
                        deferred.resolve(dailyPreviews);
                    });
                } else {
                    deferred.resolve(dailyPreviews);
                }
            }
        });
        return deferred.promise;
    }

    /**
     * Load the weather data
     */
    function loadDay(date) {
        var startDate = $filter('formatDate')(date, 'englishDate');
        dataserviceMeteo.getMeteoDay(ctrl.companyId, startDate).then(function(meteoDatas) {
            prepareWeatherData(meteoDatas.data);
        }, function(error) {
            console.error(error);
        });
    }

    /**
     * Prepare the received data that they fit into the chart structure
     * @param {Array} datas
     */
    function prepareWeatherData(datas) {
        // Create the same structure for all data
        var dayDatas = [];
        _.each(datas, function(data) {
            if (data) {
                if (data.type === 'report') {
                    dayDatas.push({
                        date: data.date,
                        temperature: data.meteodata.report.main.temperature
                    });
                }
                if (data.type === 'forecast') {
                    dayDatas.push({
                        date: data.date,
                        temperature: data.meteodata.forecast.main.temperature
                    });
                }
            }
        });

        // Sort the data within a day by the time
        ctrl.selectedDay.weatherData = _.sortBy(dayDatas, function(data) {
            return moment(data.date);
        });

        ctrl.isLoading = false;

        setWeatherChart();
    }

    function setWeatherChart() {
        var weatherData = ctrl.selectedDay.weatherData;

        // Set the temperature values to the y-Axis
        chart.data.datasets[0].data = _.map(weatherData, function(data) {
            return data.temperature;
        });

        // Set the date values to the x-Axis
        chart.data.labels = _.map(weatherData, function(data) {
            return $filter('formatDate')(data.date, 'time');
        });

        // Update the chart with the new data
        chart.update();
        ctrl.isLoading = false;
    }

    /**
     * Create and configure the chart for the weather data
     */
    function createChart() {
        var deferred = $q.defer();
        var ctx = document.getElementById('fec-meteo-data-day-chart').getContext('2d');

        chart = new Chart(ctx, {
            responsive: true,
            type: 'line',
            data: {
                datasets: [{
                    label: chartLabel,
                    data: lineData,
                    backgroundColor: colorBarleyWhite,
                    borderColor: colorSupernova,
                    borderWidth: 1,
                    pointBackgroundColor: colorSupernova,
                    pointBorderColor: colorSupernova,
                    pointHoverBackgroundColor: colorSupernova,
                    pointHoverBorderColor: colorSupernova,
                    pointHoverRadius: 7
                }],
                labels: dateData
            },
            options: {
                legend: {
                    display: false
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true,
                            // Include a dollar sign in the ticks
                            callback: function(value, index, values) {
                                return value + '°';
                            }
                        }
                    }]
                }
            }
        });
        deferred.resolve();
        return deferred.promise;
    }

    /**
     * Check if the selected day is active
     * @param {number} id
     */
    function isActive(date) {
        return ctrl.selectedDay.date === date;
    }

    /**
     * Activate the selected day and start setting the chart
     * @param {number} id
     */
    function activateDay(date) {
        if (date) {
            ctrl.isLoading = true;
            ctrl.selectedDay = _.find(ctrl.days, function(day) {
                return day.date === date;
            });
            loadDay(date);
        }
    }

    return ctrl;
}

export default fecMeteoDataList;
