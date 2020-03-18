layoutService.$inject = ['$window'];

/**
 * @ngdoc       service
 * @module      app
 * @name        layoutService
 * @description
 *
 * Provides elements and other information about the current layout.
 */
function layoutService($window) {

    var service = {

        // Query selector of the container element that handles scrolling
        scrollableContainerSelector: undefined,

        // Container element that handles scrolling.
        // If not container selector is provided, $windows is returned.
        // (used by ng-infinite-scroll)
        getScrollableContainer: getScrollableContainer
    };

    return service;

    // ----------------------------------------------------------------------------------------

    function getScrollableContainer() {
        if (_.isString(service.scrollableContainerSelector) && service.scrollableContainerSelector.length > 0) {
            return document.querySelector(service.scrollableContainerSelector);
        }
        else {
            return $window;
        }
    }
}

export default layoutService;
