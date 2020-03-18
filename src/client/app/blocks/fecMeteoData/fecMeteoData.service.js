meteoDataService.$inject = ['dataservice.meteo'];
function meteoDataService(dataserviceMeteo) {
    var _config;
    var _isActive = false;

    var service;

    service = {
        init: init,
        isActive: isActive,
        getMeteoPreview: getMeteoPreview
    };

    return service;

    // ------------------------------------------------------------------- Configuration methods

    function init(config) {
        if (!_.isObject(config)) { return; }

        _config = config;
        service.isActive(!!config.isActive);
    }

    function isActive(value) {
        if (_.isUndefined(value)) {
            return _isActive;
        }
        else {
            var oldValue = _isActive;
            _isActive = value;
            return oldValue;
        }
    }

    // ----------------------------------------------------

    function getMeteoPreview(companyId, date) {
        return dataserviceMeteo.getMeteoPreview(companyId, date);
    }
}

export default meteoDataService;
