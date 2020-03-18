import _ from 'lodash';

userService.$inject = ['$q', 'dataservice.companies', 'dataservice.users', 'Event'];

/**
 * @ngdoc service
 * @module app.core
 * @name userService
 * @description
 *
 * The user service creates and loads {@link user User} instances.
 */
function userService($q, dataserviceCompanies, dataserviceUsers, Event) {

    var ANONYMOUS_USER = {
        // /**
        //  * @ngdoc property
        //  * @name user#id
        //  * @description User full id, used to. Can be access using `user.id`.
        //  * Do not set directly, use `.initializeUserData()` method instead
        //  */
        // id: null,
        /**
         * @ngdoc property
         * @name user#username
         * @description short username of user. Can be access using `user.username`.
         * Do not set directly, use `.initializeUserData()` method instead
         */
        username: null,
        /**
         * @ngdoc property
         * @name user#firstName
         * @description The user's first name as given by the identity server.
         */
        firstName: null,
        /**
         * @ngdoc property
         * @name user#lastName
         * @description The user's last name as given by the identity server.
         */
        lastName: null,
        /**
         * @ngdoc property
         * @name user#domain
         * @description Domain for this user.
         * Used to know where this user lives in middleware
         */
        domain: null,
        /**
         * @ngdoc property
         * @name user#emails
         * @description User emails list
         */
        emails: null,
        /**
         * @ngdoc property
         * @name user#addresses
         * @description List of addresse element
         * [{type: '', value: ''}]
         */
        addresses: null,
        /**
         * @ngdoc property
         * @name user#profileLanguage
         * @description This is the user's' default profile language.
         */
        profileLanguage: null,
        /**
         * @ngdoc property
         * @name user#preferredLanguage
         * @description This is the user's currently selected language (from its preferences).
         */
        preferredLanguage: null,
        /**
         * @ngdoc property
         * @name user#preferredServices
         * @description This is the user's currently selected language (from its preferences).
         */
        preferredServices: null,
        /**
         * @ngdoc property
         * @name user#preferredUnits
         * @description This is the user's currently selected language (from its preferences).
         */
        preferredUnits: null,
        /**
         * @ngdoc property
         * @name user#companyId
         * @description Full company object. Is asynchroniously loaded during `initializeUserData()` method.
         * Contain full company object from {@link dataService.companies company service}.
         */
        companyId: undefined,
        /**
         * @ngdoc property
         * @name user#companies
         * @description List of all companies with units user is granted access to.
         *
         * To obtain an array of company, you can use underscore `_.values(user.companies)`
         */
        companies: null,
        /**
         * @ngdoc property
         * @name user#companiesUnitsServicesOrder
         * @description This is the user's' default order for the units and services in a company.
         */
        companiesUnitsServicesOrder: null,
        /**
         * @ngdoc property
         * @name user#cockpit
         * @description Cockpit description.
         * Contain full structure of cockpit.
         */
        cockpit: null,
        /**
         * @ngdoc property
         * @name user#roles
         * @description List of roles for current user
         */
        roles: null,
        /**
         * @ngdoc property
         * @name user#lastState
         * @description Object from the last state the user was
         */
        lastState: null,
        /**
         * @ngdoc property
         * @name user#searches
         * @description Last five searches do it by user
         * Contain searches object.
         */
        history: {
            favoriteSearches: [],
            lastSearches: []
        },
        /**
         * @ngdoc property
         * @name user#telephons
         * @description List of phones element
         * [{type: '', value: ''}]
         */
        telephons: null,
        /**
         * @ngdoc property
         * @name user#tutorials
         * @description Tutorial container, holding tutorials and their respective version
         * Contains a key, value pair for a chapterName of a tutorial and the last
         * version of the chapter the user has read
         */
        tutorials: {}
    };

    var service = {
        createUser: createUser,
        getUser: getUser,
        // Constants
        EVENT_USER_DATA_CHANGED: 'fec-userDataChanged',
        EVENT_USER_PROFILE_CHANGED: 'fec-userProfileChanged'
    };
    return service;

    // ------------------------------------------------------- Interface implementation methods

    /**
     * @ngdoc method
     * @name userService#createUser
     * @param  {String}   username  The username of the user to load
     * @param  {String}   domain    The domain of the user to load
     * @param  {String}   companies The list of companies the user is granted access to
     * @param  {String}   roles     The list of roles the user has access to
     * @param  {String}   language  The user profile language
     * @description
     *
     * Creats a new user profile on the server.
     */
    function createUser(username, domain, companies, roles, language) {
        return dataserviceUsers.createUserProfile(username, domain, companies, roles, language);
    }

    /**
     * @ngdoc method
     * @name userService#getUser
     * @param  {String}   [username=undefined]  The username of the user to load
     * @param  {String}   [domain=undefined]    The domain of the user to load
     * @description
     *
     * Gets a user pre-initialized with data from the server (profile and preferences).<br />
     * If no username and domain is specified, the server will return the user that is logged-in
     * (based on the authorization token).
     */
    function getUser(username, domain, blUseProfileGrants) {
        var user = new User($q, dataserviceCompanies, dataserviceUsers, Event);
        return user.initializeUserData(ANONYMOUS_USER)
            .then(function() {
                return _initializeUser(user, username, domain, blUseProfileGrants);
            });
    }

    // ------------------------------------------------------------------------- Helper methods

    function _initializeUser(user, username, domain, blUseProfileGrants) {
        // Validate
        if (!_.isObject(user)) { throw 'User cannot be empty.'; }

        return $q.resolve()
            .then(function() {
                // Load user profile and all companies
                var userProfile = dataserviceUsers.getUserProfile(username, domain, blUseProfileGrants);
                var companies = dataserviceCompanies.getCompanyList();
                return $q.all([userProfile, companies]);
            })
            .then(function(data) {
                // Continue loading user profile
                var userProfile = data[0];
                var companies = data[1];

                var grantedCompanies = (_.isArray(userProfile.companies)) ? userProfile.companies : [];

                var deferred = $q.defer();

                // Convert user access permissions to granted company objects and get User Preferences
                //
                // NOTE LB: Must not reject User data promise!
                // With $q.all() both promises are tied to each other.
                // If one is rejected, we cannot get the returned value of the other.
                // One promise relates to user profile (granted companies) and the other relates to user data preferences.
                // User data should not block (fail) getting user profile.
                $q.all([
                    _getGrantedCompanyObjects(companies, grantedCompanies),
                    dataserviceUsers.getUserData(userProfile.username, userProfile.domain)
                ]).then(function (data) {
                    //Set companies
                    userProfile.companies = data[0];

                    //sort companies
                    _sortCompanyUnitsServices(userProfile);

                    //Match user preferences to userProfile
                    userProfile.preferredLanguage = data[1].preferredLanguage;
                    userProfile.preferredUnits = data[1].preferredUnits;
                    userProfile.preferredServices = data[1].preferredServices;
                    userProfile.cockpit = data[1].cockpit;
                    userProfile.companyId = data[1].companyId;
                    userProfile.lastState = data[1].lastState;
                    userProfile.tutorials = data[1].tutorials;
                    userProfile.companiesUnitsServicesOrder = data[1].companiesUnitsServicesOrder;

                    //Set first company as default if needed
                    if (!userProfile.companyId && userProfile.companies.length > 0) {
                        userProfile.companyId = userProfile.companies[0].id;
                    }

                    deferred.resolve(userProfile);
                })
                .catch(function(data) {
                    // Handle error loading User granted companies
                    userProfile.companies = [];

                    userProfile.preferredLanguage = null;
                    userProfile.preferredUnits = null;
                    userProfile.preferredServices =null;
                    userProfile.cockpit = null;
                    userProfile.companyId = null
                    userProfile.lastState = null;
                    userProfile.tutorials = null;
                    userProfile.companiesUnitsServicesOrder = null;

                    //Set first company as default if needed
                    if (userProfile.companies.length > 0) {
                        userProfile.companyId = userProfile.companies[0].id;
                    }

                    deferred.resolve(userProfile);
                })

                return deferred.promise;
            })
            .then(function (data) {
                // Initialize user data
                return user.initializeUserData(data);
            })
            .then(function() {
                return user;
            });
    }

    function _sortCompanyUnitsServices(data) {
        _.each(data.companiesUnitsServicesOrder, function (companySetting) {
            var company = _.find(data.companies, ['id', companySetting.companyId]);
            company.units = _sortCompanyUnitsServicesEntries(company.units, companySetting.units);
            company.hospServices = _sortCompanyUnitsServicesEntries(company.hospServices, companySetting.services);
        })
    }

    function _sortCompanyUnitsServicesEntries(unsortedList, items) {
        var sortedList = [];
        _.each(items, function (item) {
            var partition = _.partition(unsortedList, ['code', item]);
            if (partition[0].length === 1) {
                sortedList.push(partition[0][0]);
            }
            unsortedList = partition[1];
        });
        if (unsortedList.length !== 0) {
            _.each(unsortedList, function (item) {
                sortedList.push(item);
            });
        }
        return sortedList;
    }

    function _getGrantedCompanyObjects(companies, grantedCompanies) {
        if (grantedCompanies.length > 0) {
                var grantedCompanyObjects = [];
                _.each(grantedCompanies, function(company) {
                    // Find company object the user has access to - skip all other companies
                    var companyObject = _.find(companies, { id: company.id });
                    if (!_.isUndefined(companyObject)) {
                        // Build granted company object
                        var grantedCompanyObject = _.assign({}, companyObject);

                        // Set granted sub-objects
                        grantedCompanyObject.hospServices = _getGrantedHospServices(company, companyObject);
                        grantedCompanyObject.units = _getGrantedUnits(company, companyObject);
                        grantedCompanyObject.staffInfos = company.staffInfos;

                        grantedCompanyObjects.push(grantedCompanyObject);
                    }
                });
                return $q.resolve(grantedCompanyObjects);
        } else {
            return $q.resolve([]);
        }
    }

    function _getGrantedUnits(grantedCompany, grantedCompanyObject) {
        var grantedCodes = _.values(grantedCompany.units);
        var units = _.filter(grantedCompanyObject.units, function(item) {
            return _.includes(grantedCodes, item.code);
        });
        return units;
    }

    function _getGrantedHospServices(grantedCompany, grantedCompanyObject) {
        var grantedCodes = _.values(grantedCompany.hospServices);
        var hospServices = _.filter(grantedCompanyObject.hospServices, function(item) {
            return _.includes(grantedCodes, item.code);
        });
        return hospServices;
    }
}

/**
 * @ngdoc object
 * @module app.core
 * @name user
 * @description
 *
 * A user model object representing a user with profile and preference settings.
 */
function User($q, dataserviceCompanies, dataserviceUsers, Event) {
    // Constants
    var PROPERTIES_USER_DATA = [
        'clientId',
        'history',
        'preferences'
    ];

    var PROPERTIES_USER_DATA_PREFERENCES = [
        'companyId',
        'cockpit',
        'tutorials',
        'lastState',
        'preferredLanguage',
        'preferredUnits',
        'preferredServices',
        'companiesUnitsServicesOrder'
    ];

    const PROPERTY_COMPANY_ID = 'companyId';


    var self = this;
    var isLogged = false;

    // Interface
    self.resetTutorials = resetTutorials;
    self.resetDashboardLayout = resetDashboardLayout;
    self.hasAccessToCompany = hasAccessToCompany;
    self.hasAccessToCompanies = hasAccessToCompanies;
    self.hasRole = hasRole;
    self.deleteUser = deleteUser;
    self.saveUserProfile = saveUserProfile;
    self.initializeUserData = initializeUserData;
    self.setUserData = setUserData;

    self.userDataChanged = new Event();
    self.userProfileChanged = new Event();
    self.selectedCompanyChanged = new Event();

    // ------------------------------------------------------- Interface implementation methods

    /**
     * @ngdoc method
     * @name user#resetDashboardLayout
     * @description
     *
     * Resets the layout of the dashboard components for all screen sizes.
     */
    function resetDashboardLayout() {
        return self.setUserData({ cockpit: null });
    }

    /**
     * @ngdoc method
     * @name user#resetTutorials
     * @description
     *
     * Resets the 'read' flag on all tutotials.
     */
    function resetTutorials() {
        return self.setUserData({ tutorials: {} });
    }

    /**
     * @ngdoc method
     * @name user#deleteUser
     * @description
     *
     * Deletes the user on the server.
     */
    function deleteUser() {
        return dataserviceUsers.deleteUserProfile(self);
    }

    /**
     * @ngdoc method
     * @name user#saveUserProfile
     * @description
     *
     * Saves the user profile to the server.
     */
    function saveUserProfile() {
        return dataserviceUsers
            .saveUserProfile(self)
            .then(function() {
                // Notify changes
                self.userProfileChanged.raise();
            });
    }

    /**
     * @ngdoc method
     * @name user#initializeUserData
     * @param {object}          dataToSet                        Dictionary of new values to set.
     * @param {string=}         dataToSet.id                     Id of the user entity
     *                                                           (required for post/put/delete operations)
     * @param {string=}         dataToSet.username               Username
     * @param {string=}         dataToSet.domain                 Domain of this user
     * @param {string=}         dataToSet.name                   Name opbject with givenName and familyName.
     * @param {string=}         dataToSet.fullUsername           Full username composed of domain + username.
     * @param {object=}         dataToSet.name                   Contain familyName and givenName. Should look like:
     * ```
     *      { familyName : 'BARBIER', givenName : 'Sébastien' }
     * ```
     * @param {Array<object>=}  dataToSet.emails                 The user's e-mail addresses.
     * ```
     *      [{type:'work', value:'FluanceTestUser2@fluance.ch'}, ...]
     * ```
     * @param {string=}         dataToSet.addresses              The user's postal addresses.
     * ```
     * [{type : 'postalCode', value : 4500 },
     *   {type : 'locality', value : 'Solothurn'}, ...]
     * ```
     * @param {string=}         dataToSet.companies              The list of companies the user has access to.
     * ```
     *   [{
     *       id: 5,
     *       units: ['1C', '1S', '2N', '3E'],
     *       hospServices: ['', '', ''],
     *       staffInfos: null
     *   },{
     *       id: 9,
     *       units: [11, 21, 22, 23, 24],
     *       hospServices: ['', '', ''],
     *       staffInfos: null
     *   }]
     * ```
     *
     * @param {string=}         dataToSet.preferredLanguage      Key of the selected language (i.e.: fr, en, de, it).
     * @param {integer=}        dataToSet.companyId              Id of the selected company.
     * @param {integer=}        dataToSet.lastUnit               Id of the last selected unit of the selected company.
     * @param {Array<String>=}  dataToSet.roles                  List of roles (also called policies) to define
     *                                                           authorization.
     * @param {Boolean=}        dataToSet.isLogged               A value indicating whether to log each modification in
     *                                                           the session.
     * @param {Boolean=}        blSendEventsAfterUserDataSaved   A value indicating whether to send events (eg: company changed)
     *                                                           only after data is saved (true) on the server or immediately (false).
     *
     * @return {promise}        Return a promise.
     *
     * @description
     *
     * Initialize User model with one or multiple properties in a single call. This call doesn't save data to the server.
     */
    function initializeUserData(dataToSet, blSendEventsAfterUserDataSaved) {

        // Set undefined optional parameters
        if (_.isUndefined(blSendEventsAfterUserDataSaved)) { blSendEventsAfterUserDataSaved = false; }

        // Determine if user data properties will be changed
        // (support for users working on different stations simultaneously)
        var allUserDataproperties = _.union(PROPERTIES_USER_DATA, PROPERTIES_USER_DATA_PREFERENCES);
        var hasUserDataChanged = _.some(allUserDataproperties, function(p) { return dataToSet.hasOwnProperty(p); });

        return $q.resolve()
            .then(function() {
                if(hasUserDataChanged) {
                    // Copy data to user object (assign new values)
                    self = _.assign(self, dataToSet);

                    // update selected company id
                    _updateSelectedCompanyId(self.companyId, self.companies, self.company)

                    // Update selected company object
                    _updateSelectedCompany(self.companyId, blSendEventsAfterUserDataSaved);
                }

            });
    }

    /**
     * @ngdoc method
     * @name user#setUserData
     * @param {object}          dataToSet                        Dictionary of new values to set.
     * @param {string=}         dataToSet.id                     Id of the user entity
     *                                                           (required for post/put/delete operations)
     * @param {string=}         dataToSet.username               Username
     * @param {string=}         dataToSet.domain                 Domain of this user
     * @param {string=}         dataToSet.name                   Name opbject with givenName and familyName.
     * @param {string=}         dataToSet.fullUsername           Full username composed of domain + username.
     * @param {object=}         dataToSet.name                   Contain familyName and givenName. Should look like:
     * ```
     *      { familyName : 'BARBIER', givenName : 'Sébastien' }
     * ```
     * @param {Array<object>=}  dataToSet.emails                 The user's e-mail addresses.
     * ```
     *      [{type:'work', value:'FluanceTestUser2@fluance.ch'}, ...]
     * ```
     * @param {string=}         dataToSet.addresses              The user's postal addresses.
     * ```
     * [{type : 'postalCode', value : 4500 },
     *   {type : 'locality', value : 'Solothurn'}, ...]
     * ```
     * @param {string=}         dataToSet.companies              The list of companies the user has access to.
     * ```
     *   [{
     *       id: 5,
     *       units: ['1C', '1S', '2N', '3E'],
     *       hospServices: ['', '', ''],
     *       staffInfos: null
     *   },{
     *       id: 9,
     *       units: [11, 21, 22, 23, 24],
     *       hospServices: ['', '', ''],
     *       staffInfos: null
     *   }]
     * ```
     *
     * @param {string=}         dataToSet.preferredLanguage      Key of the selected language (i.e.: fr, en, de, it).
     * @param {integer=}        dataToSet.companyId              Id of the selected company.
     * @param {integer=}        dataToSet.lastUnit               Id of the last selected unit of the selected company.
     * @param {Array<String>=}  dataToSet.roles                  List of roles (also called policies) to define
     *                                                           authorization.
     * @param {Boolean=}        dataToSet.isLogged               A value indicating whether to log each modification in
     *                                                           the session.
     *
     * @return {promise}        Return a promise since update need to save on server side and update values.
     *                          When promise resolves, data has been saved on server and all data are up to date.
     *                          (eg: company)
     *
     * @description
     *
     * Update User model with one or multiple properties in a single call. This call saves data to the server.
     */
    function setUserData(dataToSet) {
        let newCompanyId = dataToSet[PROPERTY_COMPANY_ID];
        const companyHasChanged = (!_.isNil(newCompanyId)) ? true : false;
        const SEND_NOTIFICATION_AFTER_USER_DATA_SAVED = true;

        // Determine if user data properties will be changed
        // (support for users working on different stations simultaneously)
        var allUserDataproperties = _.union(PROPERTIES_USER_DATA, PROPERTIES_USER_DATA_PREFERENCES);
        var hasUserDataChanged = _.some(allUserDataproperties, function(p) { return dataToSet.hasOwnProperty(p); });

        return $q.resolve()
            .then(function() {
                // Re-load user data before changing it
                // (support for users working on different stations simultaneously)
                if (hasUserDataChanged) {
                    return dataserviceUsers.getUserData(self.username, self.domain)
                        .then(function(data) {
                            data = _.assign(data, dataToSet);
                            return self.initializeUserData(data, SEND_NOTIFICATION_AFTER_USER_DATA_SAVED);
                        });
                }
            })
            .then(function() {
                // Save changes to user data immediately
                // (support for users working on different stations simultaneously)
                if (hasUserDataChanged) { return _saveUserData(); }
            })
            .then(function() {
                // send event(s) after user data is saved
                if (hasUserDataChanged && companyHasChanged) {
                    // emit event indicating the company has changed
                    self.selectedCompanyChanged.raise();
                }
            });

    }

    // ------------------------------------------------------- Query interface implementation methods

    /**
     * @ngdoc method
     * @name user#hasAccessToCompany
     * @param {int}         companyId       The company ID to check access for.
     * @description
     * Gets the value indicating whether the user has access to the specified company.
     */
    function hasAccessToCompany(companyId) {
        if (_.isArray(self.companies)) {
            return _.findIndex(self.companies, { 'id': companyId }) > -1;
        } else {
            return false;
        }
    }

    /**
     * @ngdoc method
     * @name user#hasAccessToCompanies
     * @description
     * Gets the value indicating whether the user has access to any company.
     */
    function hasAccessToCompanies() {
        return _.size(self.companies) > 0;
    }

    /**
     *
     * @ngdoc method
     * @name user#hasRole
     * @param {String|Array<String>}    role    User role as a string or an array of strings.<br />
     *                                          Possible values: admin, nurse, physician, anonymous, chef
     * @return {Boolean}                        Returns the value indicating whether the user has
     *                                          any specified role(s).
     * @description
     *
     * Gets the value indicating whether the user has any specified role(s).
     *
        // In this case, user is a nurse
        user.roles = ['nurse']

        user.hasRole('sysadmin');               // false
        user.hasRole(['sysadmin', 'nurse']);    // true
        user.hasRole(['nurse']);                // true
     *
     **/
    function hasRole(role) {
        var r = role;
        if (!Array.isArray(r)) {
            r = [r];
        }
        return _.intersection(self.roles, r).length > 0;
    }

    // -------------------------------------------------------- Helper methods

    /**
     * @private
     * @ngdoc method
     * @name user#_saveUserData
     * @description
     *
     * Saves the user data (application specific preferences) to the server.
     * This method must only be called by the `user.setUserData()` method; not from the outside of the user object.
     */
    function _saveUserData() {
        return dataserviceUsers
            .saveUserData(self)
            .then(function() {
                // Notify changes
                self.userDataChanged.raise();
            });
    }

    /**
     * @private
     * @ngdoc method
     * @name user#_updateSelectedCompanyId
     * @param {integer=} selectedCompanyId
     * @param {Array<Object>=} grantedCompanies
     * @param {Object=} selectedCompany
     *
     * @description
     *
     * Update selected company id.
     * Pick first company in list (alphabetical order) if user doesn't have access to selected company.
     */
    function _updateSelectedCompanyId(selectedCompanyId, grantedCompanies, selectedCompany) {
        // If user does not have access to the selected company,
        // fall-back to the first possible company (by alphabetical order)

        if (selectedCompanyId && !_.find(grantedCompanies, {id: selectedCompanyId})) {
            if (grantedCompanies.length > 0) {
                // fall-back to the first possible company (by alphabetical order)
                selectedCompanyId = _.sortBy(grantedCompanies, 'code')[0].id;
            }
        } else if (_.isUndefined(selectedCompanyId)) {
            if (!_.isUndefined(selectedCompany)) {
                selectedCompanyId = selectedCompany.id;
            } else {
                if (grantedCompanies && grantedCompanies.length > 0) {
                    // fall-back to the first possible company (by alphabetical order)
                    selectedCompanyId = _.sortBy(grantedCompanies, 'code')[0].id;
                }
            }
        }
    }

    /**
     * @private
     * @ngdoc method
     * @name user#_updateSelectedCompany
     * @param {integer=} selectedCompanyId selected company id
     * @param {Boolean=} blSendEventsAfterUserDataSaved emit events only after data is saved on server?
     *
     * @description
     *
     * Update selected company
     */
    function _updateSelectedCompany(selectedCompanyId, blSendEventsAfterUserDataSaved) {
        // get id of currently selected company
        var companyId = self.company ? self.company.id : undefined;

        // update omly if new company id !== id of currently selected company
        if (selectedCompanyId !== companyId && _.isNumber(selectedCompanyId)) {
            return dataserviceCompanies
                .getCompanyDetail(selectedCompanyId)
                .then(function (company) {
                    // update currently selected company object
                    self.company = company;
                    self.companyId = company.id;

                    // only initializing, not saving user data => can send event now
                    if (!blSendEventsAfterUserDataSaved) {
                        self.selectedCompanyChanged.raise({companyId: company.id});
                    }
                });
        }
    }

}


export default userService;
