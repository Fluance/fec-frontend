MedLabService.$inject = ['dataservice.medlab'];

function MedLabService(dataServiceMedLab) {

    var _config,
        _isActive;
    var service = {
        init: init,
        isActive: isActive,
        getUrl: getUrl
    };

    return service;

    // ------------------------------------------------------------------- Configuration methods

    function init(config) {
        if (!_.isObject(config)) { return; }

        _config = config;
        service.isActive(true);
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

    function getUrl(visitNb) {
        return dataServiceMedLab.getUrl(visitNb);
    }
}

export default MedLabService;
