chatBotService.$inject = ['$rootScope'];

function chatBotService($rootScope) {
    var _config;
    var _isActive = false;
    var _isOpened = false;
    var _animation = false;

    var service;

    service = {
        EVENT_CHATBOT_OPENING_CHANGED: 'fec-chatbotOpeningChanged',
        EVENT_CHATBOT_ANIMATION_CHANGED: 'fec-chatbotAnimationChanged',

        init: init,
        isActive: isActive,
        isAnimated: isAnimated,
        getChatBotUrl: getChatBotUrl,
        getIsOpened: getIsOpened,
        toggleIsOpened: toggleIsOpened
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

    function isAnimated() {
        return _animation;
    }

    function toggleIsOpened() {
        _isOpened = !_isOpened;
        _activateAnimation();
        $rootScope.$broadcast(service.EVENT_CHATBOT_OPENING_CHANGED, _isOpened);
    }

    function _activateAnimation() {
        if (!_animation) {
            _animation = true;
            $rootScope.$broadcast(service.EVENT_CHATBOT_ANIMATION_CHANGED, _animation);
        }
    }
}

export default chatBotService;
