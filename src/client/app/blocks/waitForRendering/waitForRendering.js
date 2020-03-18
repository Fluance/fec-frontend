waitForRendering.$inject = ['$timeout', '$http'];

function waitForRendering($timeout, $http) {

    var service = {
        wait: wait
    };

    function wait(callAfterRendering) {
        var waitForRendering = function() {
            if ($http.pendingRequests.length > 0) {
                $timeout(waitForRendering); // Wait for all templates to be loaded
            } else {
                callAfterRendering();
            }
        };
        $timeout(waitForRendering); // Waits for first digest cycle
    }

    return service;
}

export default waitForRendering;
