import _ from 'lodash';

LabService.$inject = [
    '$window',
    'routerService',
    'SelectVisitDialogService',
    'dataservice.lab'
];

function LabService(
    $window,
    routerService,
    selectVisitDialogService,
    dataServiceLab
) {
    var SPLIT_STRING = '!%FLUDEV%!';
    var EVENT_LAB_TABLE_CHANGED = 'fec-labTableChanged';

    var service = {
        createPrescription: createPrescription,
        getLabDataByCategory: getLabDataByCategory
    };

    return service;

    // -------------------------------------------------------------------------------------------

    function createPrescription(openVisitsCount, vnb, visits, event) {
        var dlg;

        // 1 open visit
        if (openVisitsCount === 1) {
            dlg = $window.open(routerService.urlInfo.path + 'content/loading.html', '_blank');

            // TODO
            // issue in Safari - 'dlg' is null (macOS, iOS)
            selectVisitDialogService.navigateToVisit(event, vnb, dlg);
            // selectVisitDialogService.showDialog($event, ctrl.visits);
        }
        // multiple open visits
        else if (openVisitsCount > 1) {
            selectVisitDialogService.showDialog(event, visits, dlg);
        }
    }

    function getLabDataByCategory(patientId, categoryName) {
        return dataServiceLab.getLabDatasByCategory(patientId, categoryName).then(function (categoryData) {
            var data = {
                table: {},
                text: {},
            };
            if (categoryData && categoryData.length) {
                var tableData = [];
                var textData = [];
                _.each(categoryData, function (categoryDataEntry) {
                    if (categoryDataEntry.valuetype === 'NM') {
                        tableData.push(categoryDataEntry);
                    } else {
                        textData.push(categoryDataEntry);
                    }
                })
                data.table = _groupByAnalysisname(tableData);
                data.text = _groupByAnalysisname(textData);
            }
            return data;
        })
        .catch(function(error) {
            console.error(error);
        });
    }

    // Group the data by the analysisname
    function _groupByAnalysisname(categoryDatas) {
        var groupedByAnalysisname = _.groupBy(categoryDatas, function (data) {
            return data.analysisname + SPLIT_STRING + data.valuetype + data.unit + data.reference;
        });
        return _sortByObservationDate(groupedByAnalysisname);
    }

    // Sort the data by the observationdate
    function _sortByObservationDate(categoryDatas) {
        _.each(categoryDatas, function (datas) {
            datas = _.orderBy(datas, function (data) {
                return data.observationdate;
            }, ['desc']);
        });
        return _prepareObservationDateList(categoryDatas);
    }

    // Create the correct data structure that the template can easily handle it
    function _prepareObservationDateList(categoryDatas) {
        var currentCategoryDatas = [];
        var observationDates = [];
        _.each(categoryDatas, function (currentCategory) {
            _.each(currentCategory, function (categoryData) {
                observationDates.push(categoryData.observationdate);
            });
        });
        observationDates = _.orderBy(_.uniq(observationDates), function (date) {
            return date;
        }, ['desc']);
        _.each(_.keys(categoryDatas), function (analysisname) {
            var datas = categoryDatas[analysisname];
            var firstData = _.first(datas);
            currentCategoryDatas.push({
                analysisname: analysisname.split(SPLIT_STRING)[0],
                unit: firstData.unit,
                reference: firstData.refrange,
                datas: _fillDatas(datas, observationDates),
                displayChart: _hasNumericalMeasurement(datas)
            });
        });
        return {
            data: currentCategoryDatas,
            dates: observationDates
        };
    }

    // Fill datas with empty value if there are more dates than datas
    function _fillDatas(datas, observationDates) {
        var returnValue = [];
        var currentIndex;
        _.each(observationDates, function (date) {
            currentIndex = _.findIndex(datas, ['observationdate', date]);
            if (currentIndex >= 0) {
                returnValue.push(datas[currentIndex]);
            } else if (currentIndex = -1) {
                returnValue.push({
                    observationdate: date,
                    value: null
                });
            }
        });
        return returnValue;
    }

    // Check if the datas contains a numerical measurement
    function _hasNumericalMeasurement(datas) {
        var returnValue = false;
        _.each(datas, function (data) {
            if (!_.isNaN(parseInt(data.value)) && _.isFinite(parseInt(data.value))) {
                returnValue = true;
                return false;
            }
        });
        return returnValue;
    }
}

export default LabService;
