/*jshint -W101*/ //  Line too long

imagingReportEmailingService.$inject = [
    '$http',
    'sessionService'
];

function imagingReportEmailingService($http, sessionService) {

    var _config;
    var _isActive = false;

    var service = {
        // Methods
        init: init,
        isActive: isActive,
        sendReportByEmail: sendReportByEmail
    };

    return service;

    // ------------------------------------------------------------------- Configuration methods

    function init(config) {
        if (!_.isObject(config)) { return; }

        _config = config;
        service.isActive(true);
    }

    function getChatBotUrl() {
        return _config.chatBotUrl;
    }

    function getIsOpened() {
        return _isOpened;
    }

    function isActive(value) {
        if (_.isUndefined(value)) {
            return _isActive;
        } else {
            var oldValue = _isActive;
            _isActive = value;
            return oldValue;
        }
    }

    function sendReportByEmail(uniqueStudyId, patientId, emailAddress) {

        var language = sessionService.user.preferredLanguage;

        return $http({
            method: 'GET',
            url: _config.apiReportEmail,
            params: {
                uid: uniqueStudyId,
                pid: patientId,
                email: emailAddress,
                lang: language
            }
        });
    }

}

export default imagingReportEmailingService;
