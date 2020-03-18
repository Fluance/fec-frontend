eventService.$inject = ['$q'];

/**
* @ngdoc service
* @module app.core
* @name eventService
* @description
*
* The event service provides the constructor of the {@link event Event} object.
*/
function eventService($q) {
    return Event;
}

/**
* @ngdoc object
* @module app.core
* @name event
* @description
*
* The Event object provides a mechanism for event handling.
* Consumers can subscribe to this object and be notified when the event is raised.
* This provides a more direct way rather that using the AngularJS
* message bus.
*/
function Event() {
    var subscriptions = [];

    // Interface
    var self = this;
    self.subscribe = subscribe;
    self.unsubscribe = unsubscribe;
    self.raise = raise;
    return self;

    // ------------------------------------------------------- Interface implementation methods

    /**
     * @ngdoc method
     * @name event#subscribe
     * @description
     *
     * Subscribes a consumer to the event.
     */
    function subscribe(fnEventHandler) {
        subscriptions.push(fnEventHandler);
        return new EventSubscription(self, fnEventHandler);
    }

    /**
     * @ngdoc method
     * @name event#unsubscribe
     * @description
     *
     * Unsubscribes a consumer from the event.
     */
    function unsubscribe(fnEventHandler) {
        var index = _.indexOf(subscriptions, fnEventHandler);
        if (index > -1) { subscriptions.splice(index, 1); }
    }

    /**
     * @ngdoc method
     * @name event#raise
     * @description
     *
     * Raises the event and notifies all subscribers.
     */
    function raise(eventArgs) {
        for (var i = 0; i < subscriptions.length; i++) {
            subscriptions[i](eventArgs);
        }
    }
}

function EventSubscription(event, fnEventHandler) {
    // Interface
    var self = this;
    self.unsubscribe = unsubscribe;
    return self;

    function unsubscribe() {
        event.unsubscribe(fnEventHandler);
    }
}

export default eventService;
