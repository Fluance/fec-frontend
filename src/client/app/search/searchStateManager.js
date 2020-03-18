/**
 * module: searchStateManager
 * usage: a local, not persisted cache to handle and store certain states of the application
 * sample: setPatientSearchCache/getPatientSearchCache/clearPatientSearchCache -> use these three functions to store
 * and restore the current search results of a patient search. use 'setPatientSearchCache' to add search results to
 * the cache. use 'getPatientSearchCache' to check if there are any search results stored in the cache and to restore
 * a previous state (e.g. when navigating back to the patient search result page). use 'clearPatientSearchCache' to
 * reset the cache. this should be done when you start a new search with different criterias.
 */

searchStateManager.$inject = ['$timeout'];

/**
 * main function of the module
 * @param $timeout
 * @returns {{setPatientSearchCache: setPatientSearchCache, getPatientSearchCache: getPatientSearchCache,
 * clearPatientSearchCache: clearPatientSearchCache, setPatientSearchListPosition: setPatientSearchListPosition,
 * setPatientSearchParams: setPatientSearchParams, getPatientSearchParams: getPatientSearchParams,
 * setPatientSearchSelectedPid: setPatientSearchSelectedPid,
 * getPatientSearchSelectedPid: getPatientSearchSelectedPid}}
 */
function searchStateManager($timeout) {
    var patientSearchCache = null;
    var patientSearchScrollPosition = 0;
    var patientSearchParams = null;
    var patientSearchSelectedPid = 0;
    var patientSearchTotalRecords = 0;

    // publisher of the internal logic
    var cache = {
        setPatientSearchCache: setPatientSearchCache,
        getPatientSearchCache: getPatientSearchCache,
        clearPatientSearchCache: clearPatientSearchCache,
        setPatientSearchListPosition: setPatientSearchListPosition,
        setPatientSearchParams: setPatientSearchParams,
        getPatientSearchParams: getPatientSearchParams,
        setPatientSearchSelectedPid: setPatientSearchSelectedPid,
        getPatientSearchSelectedPid: getPatientSearchSelectedPid,
        setPatientSearchTotalRecords: setPatientSearchTotalRecords,
        getPatientSearchTotalRecords: getPatientSearchTotalRecords
    };

    return cache;

    /**
     * sets content of the patient search cache
     * @param dataToCache
     */
    function setPatientSearchCache(dataToCache) {
        patientSearchCache = dataToCache;
    }

    /**
     * gets the contents of the patient search cache and scroll to the position where the user left the list
     * @returns {*}
     */
    function getPatientSearchCache() {
        $timeout(function() {
            $(window).scrollTop(patientSearchScrollPosition);
        }, 250);

        return patientSearchCache;
    }

    /**
     * clears to contents of the patient search cache
     */
    function clearPatientSearchCache() {
        patientSearchCache = null;
        patientSearchScrollPosition = 0;
        patientSearchParams = null;
        patientSearchSelectedPid = 0;
    }

    /**
     * sets the current scroll position of the patient search result list
     */
    function setPatientSearchListPosition() {
        patientSearchScrollPosition = $(window).scrollTop();
    }

    /**
     * sets the current search params of the patient search
     * @param searchParams
     */
    function setPatientSearchParams(searchParams) {
        patientSearchParams = searchParams;
    }

    /**
     * gets the current search params of the patient search
     * @returns {*}
     */
    function getPatientSearchParams() {
        return patientSearchParams;
    }

    /**
     * sets the pid of the current selected patient
     * @param pid
     */
    function setPatientSearchSelectedPid(pid) {
        patientSearchSelectedPid = pid;
    }

    /**
     * gets the pid of the current selected patient
     * @returns {number}
     */
    function getPatientSearchSelectedPid() {
        return patientSearchSelectedPid;
    }

    /**
     * sets the pid of the current selected patient
     * @param pid
     */
    function setPatientSearchTotalRecords(totalRecords) {
        patientSearchTotalRecords = totalRecords;
    }

    /**
     * gets the pid of the current selected patient
     * @returns {number}
     */
    function getPatientSearchTotalRecords() {
        return patientSearchTotalRecords;
    }
}

export default searchStateManager;
