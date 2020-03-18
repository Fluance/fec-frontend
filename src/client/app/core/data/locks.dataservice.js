// Turn off jshint rules:
/*jshint -W101*/  //  Line too long

const RESOURCE_NAME = 'lock';
const ENDPOINT_NAME = 'locks';

const run = ['config', 'DS', function(config, DS) {
    DS.defineResource({
        name: RESOURCE_NAME,
        endpoint: ENDPOINT_NAME,
        // basePath: config.apiServer,
        basePath: config.apiServerNotes
    });
}];

dataServiceLocks.$inject = ['DS', 'moment', '$q'];

/**
 * @ngdoc service
 * @module app.core
 * @name dataserviceLocks
 * @description
 * The dataservice for handling the resource locks.
 *
 */
function dataServiceLocks(DS, moment, $q) {

    var MAX_SECONDS_BEFORE_EXPIRATION = 30;
    var  locksCache = [];


    var service = {
        /**
         * @ngdoc method
         * @name dataserviceLocks#lock
         * @param {String} resourceId   The ID of the resource to lock.
         * @param {String} resourceType The type of the resource to lock.
         * @return {Promise}            Returns a promise that resolves when the lock is granted, or rejects when the lock is denied.
         * @description                 Requests a lock for a resource (optimistic locking).
         *                              The requesting user is identified implicitly by the access tolken in the http header.
         */
        lock: lock,
        /**
         * @ngdoc method
         * @name dataserviceLocks#unlock
         * @param {String} resourceId   The ID of the resource to unlock.
         * @param {String} resourceType The type of the resource to unlock.
         * @return {Promise}            void
         * @description                 Releases a lock on a resource.
         */
        unlock: unlock
    };

    return service;

    // ----------------------------------------------------------------------- Interface methods

    function lock(resourceId, resourceType) {
        var needNewLock = false;
        var lock = _findLock(resourceId, resourceType);

        // Lock on Resource found in cache (maybe already expired) or is requesting lock
        if (lock) {
            // Grant as long as lock is being refreshed
            if (lock.isRequesting) { return $q.resolve(); }

            // Grant new lock (refresh) as long as:
            // 1. Lock is about to expire or has expired
            needNewLock = moment().add(lock.maxTimeBeforeExpiration, 'minutes').isAfter(lock.expirationDate);
            console.info('Lock:', 'needNewLock: ' + needNewLock);
            if (!needNewLock) { return $q.resolve(); }
        }
        else {
            // Lock on Resource not found in cache -> initialize new lock
            lock = {
                resource: { id: resourceId, type: resourceType },
                lastRequest: moment().toDate()
            };
            locksCache.push(lock);
        }

        // Request new/refresh lock when:
        // 1. Lock on Resource not found in cache
        // 2. Lock is about to expire or expired
        lock.isRequesting = true;
        return _requestLock(resourceId, resourceType)
            .then(function(serverLock) {
                // Update lock
                lock.id = serverLock.id;
                lock.lastRequest = moment().toDate();
                lock.expirationDate = moment(serverLock.expirationDate).toDate();
                // dynamically calculate maximum time before expiration to request lock refresh
                lock.maxTimeBeforeExpiration = _maxTimeBeforeExpiration(lock.lastRequest, lock.expirationDate);
                lock.isRequesting = false;

                console.debug('Lock: Granted.', lock);
            })
            .catch(function(reason) {
                // Lock request rejected - delete lock
                _remove(locksCache, lock);
                console.debug('Lock: Rejected.');

                // TODO: Workaround. Improve by creating types of Exceptions
                reason.LockException = true;
                return $q.reject(reason);
            });
    }

    /**
     * Unlock resource.
     * If lock is found in cache, unlock Resource and remove lock from cache. Otherwise, do nothing.
     * @param resourceId
     * @param resourceType
     * @returns {*}
     */
    function unlock(resourceId, resourceType) {
        var lock = _findLock(resourceId, resourceType);
        if (lock) {
            return DS
                .find(RESOURCE_NAME, 'unlock', {
                    params: {
                        resourceid: resourceId,
                        resourcetype: resourceType
                    },
                    bypassCache: true,
                    cacheResponse: false
                })
                .then(function() {
                    // Delete lock
                    _remove(locksCache, lock);
                })
                .catch(function(err) {
                    // Delete lock
                    _remove(locksCache, lock);
                });
        }
        else {
            return $q.resolve();
        }
    }

    // ------------------------------------------------------------------ Helper methods

    /**
     * Lookup Resource lock in cache
     * @param resourceId
     * @param resourceType
     * @returns {*}
     * @private
     */
    function _findLock(resourceId, resourceType) {
        return _.find(locksCache, function(item) {
            return item.resource.id === resourceId && item.resource.type === resourceType;
        });
    }

    /**
     * Request lock of Resource
     * @param resourceId
     * @param resourceType
     * @returns {*}
     */
    function _requestLock(resourceId, resourceType) {
        console.warn('Lock: Requesting new lock.');

        return DS
            .find(RESOURCE_NAME, 'lock', {
                params: {
                    resourceid: resourceId,
                    resourcetype: resourceType
                },
                bypassCache: true,
                cacheResponse: false
            });
    }

    /**
     * Remove element from array
     * @param array array with elements
     * @param element element to remove
     * @private
     */
    function _remove(array, element) {
        var index = array.indexOf(element);

        if (index !== -1) {
            array.splice(index, 1);
        }
    }

    /**
     * Calculate time to wait before refreshing token locked by the user (in minutes).
     * @param now current MomentJS
     * @param expirationDate expiration MomentJS
     * @returns {number} max number of minutes before expiration
     * @private
     */
    function _maxTimeBeforeExpiration(now, expirationDate) {
        if(!_.isDate(now) || !_.isDate(expirationDate)) {
            return MAX_SECONDS_BEFORE_EXPIRATION / 60;
        }

        return moment(expirationDate).diff(moment(now), 'minutes') / 2;
    }
}

export {
    dataServiceLocks,
    run
}
