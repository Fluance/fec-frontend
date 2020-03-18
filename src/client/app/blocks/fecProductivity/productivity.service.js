function productivityService() {
    var _config;
    var _isActive = false;

    var service;

    service = {
        init: init,
        isActive: isActive
    };

    return service;

    // ------------------------------------------------------------------- Configuration methods

    function init(config) {
        if (!_.isObject(config)) {
            return;
        }

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
}

export default productivityService;
