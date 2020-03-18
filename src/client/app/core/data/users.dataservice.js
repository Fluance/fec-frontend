/*
   Notice:
   To avoid potential security risk, data caching must be disabled for all dataservice calls.
   This ensures that user-profile or user-data data always come directly from the server.
 */
import _ from 'lodash';

const SESSION_USER_PROFILE = 'fec-user-profile';

const RESOURCE_NAME_USER_PROFILE = 'user.profile';
const RESOURCE_NAME_USER_PROFILE_SEARCH = 'user.profile.search';
const ENDPOINT_NAME_USER_PROFILE = 'profile';
const ENDPOINT_NAME_USER_PROFILE_ROLES = ENDPOINT_NAME_USER_PROFILE + '/roles';
const ENDPOINT_NAME_USER_PROFILE_COMPANIES = ENDPOINT_NAME_USER_PROFILE + '/companies';
const ENDPOINT_NAME_USER_PROFILE_HOSPSERVICES = ENDPOINT_NAME_USER_PROFILE + '/hospservices';
const RESOURCE_NAME_USER_DATA = 'user.data';
const ENDPOINT_NAME_USER_DATA = 'userdata';
const USERTYPE_USER = 'user';

const run = ['config', 'DS', function (config, DS) {
    DS.defineResource({
        name: RESOURCE_NAME_USER_DATA,
        endpoint: ENDPOINT_NAME_USER_DATA,
        basePath: config.apiClient,
    });
    DS.defineResource({
        name: RESOURCE_NAME_USER_PROFILE,
        endpoint: ENDPOINT_NAME_USER_PROFILE,
        basePath: config.apiEHProfile,
    });
    DS.defineResource({
        name: RESOURCE_NAME_USER_PROFILE_SEARCH,
        endpoint: ENDPOINT_NAME_USER_PROFILE,
        basePath: config.apiEHProfile,
        bypassCache: true,
        cacheResponse: false
    });
}];


dataServiceUsers.$inject = ['$q', '$http', 'DS', 'config', 'helpers'];

/**
 * @ngdoc service
 * @module app.core
 * @name dataService.users
 * @description
 *
 * The dataservice handles data related to Users:
 *
 * - User Profile:
 *
 *     assigned roles,
 *     companies,
 *     units and
 *     services
 *     default language (UI)
 *
 * - User Data (preferences, search history):
 *
 *     language,
 *     dashboard layout,
 *     preferred unit, service and company
 *     last state
 *
 */
function dataServiceUsers($q, $http, DS, config, helpers) {

    // Wire-up data services

    // model lifecycle hooks
    var resourceUserProfile = DS.definitions[RESOURCE_NAME_USER_PROFILE];
    resourceUserProfile.afterFind = function (Resource, data, cb) { return _deserializeUserProfile(data); };
    resourceUserProfile.afterFindAll = function (Resource, data) { return _deserializeUserProfile(data); };
    resourceUserProfile.beforeCreate = function (Resource, data, cb) { return _serializeUserProfile(data); };
    resourceUserProfile.beforeUpdate = function (Resource, data, cb) { return _serializeUserProfile(data); };

    var resourceUserData = DS.definitions[RESOURCE_NAME_USER_DATA];
    resourceUserData.afterFind = function (Resource, data, cb) { return _deserializeUserData(data); };
    resourceUserData.afterFindAll = function (Resource, data) { return _deserializeUserData(data); };

    var resourceUserProfileSearch = DS.definitions[RESOURCE_NAME_USER_PROFILE_SEARCH];
    resourceUserProfileSearch.afterFindAll = function (Resource, data) {
        return data.map(function (value, index) {
            return {
                id: index,
                username: value.userName,
                firstName: value.firstName,
                lastName: value.lastName
            };
        });
    };

    // token used in Client API (with user data)
    var clientToken = config.apiClientToken;

    // Define service interface
    var service = {
        createUserProfile: createUserProfile,
        deleteUserProfile: deleteUserProfile,
        getUserProfile: getUserProfile,
        searchUserProfiles: searchUserProfiles,
        getUserData: getUserData,
        saveUserProfile: saveUserProfile,
        saveUserData: saveUserData
    };
    return service;

    // ---------------------------------------------------------------------- Interface methods

    // ----------------------------------------
    // User Profile
    // ----------------------------------------

    /**
     * Create new user Profile
     * @param {*} username user name
     * @param {*} domain domain
     * @param {*} companies assigned companies, units and services
     * @param {*} roles assigned role(s)
     * @param {*} language default language (UI)
     */
    function createUserProfile(username, domain, companies, roles, language) {
        // Validate
        if (!_.isString(username) || username.length === 0) { throw 'Username cannot be empty.'; }
        if (!_.isString(domain) || domain.length === 0) { throw 'Domain cannot be empty.'; }

        // Initialize
        if (!_.isArray(companies)) { companies = []; }
        if (!_.isArray(roles)) { roles = []; }
        if (!_.isString(language)) { language = "EN"; }

        var profile = {
            usertype: USERTYPE_USER,
            username: username,
            domain: domain,
            grants: {
                companies: companies,
                roles: roles
            },
            language: language
        };

        return DS
            .create(RESOURCE_NAME_USER_PROFILE, profile, {
                bypassCache: true,
                cacheResponse: false
            });
    }

    /**
     * Get user Profile
     * @param {*} username user name
     * @param {*} domain domain
     * @param {*} blUseProfileGrants flag to indicate to (directly) use all roles from DB that are assigned to the user profile (= true) or to filter and only use roles that have a mapping in FE (in configuration) (= false)
     */
    function getUserProfile(username, domain, blUseProfileGrants) {
        var endpoint;
        if (_.isString(username) && username.length > 0 && _.isString(domain) && domain.length > 0) {
            // Load user specified by domain and username (for admin console)
            endpoint = ENDPOINT_NAME_USER_PROFILE + '/' + username + '/' + domain;
        } else {
            // Load user for the currently logged-in user (current session)
            endpoint = ENDPOINT_NAME_USER_PROFILE + '/my';
        }
        return DS
            .findAll(RESOURCE_NAME_USER_PROFILE, {}, {
                bypassCache: true,
                cacheResponse: false,
                endpoint: endpoint
            })
            .then(function(data) {
                var profile = {
                    id: data.id,
                    domain: data.domain,
                    username: data.username,
                    usertype: undefined,

                    firstName: data.firstName,
                    lastName: data.lastName,
                    addresses: (_.isArray(data.addresses)) ? data.addresses : [],
                    emails: (_.isArray(data.emails)) ? data.emails : [],
                    telephons: (_.isArray(data.telephons)) ? data.telephons : [],

                    profileLanguage: undefined,
                    roles: [],
                    companies: []
                };

                if (data.profile) {
                    profile.profileLanguage = data.profile.language;
                    profile.usertype = data.profile.usertype;

                    if (data.profile.grants) {
                        // Set assigned roles
                        if (_.isArray(data.profile.grants.roles)) {
                            data.profile.grants.roles.forEach(function(value) {
                                if(blUseProfileGrants){
                                    // Return all the roles that the user has on DB
                                    profile.roles.push(value);
                                } else {
                                    // Only consider roles known in the config relation table
                                    var key = _.find(_.keys(config.roles), function(key) {
                                        return (config.roles[key].indexOf(value) !== -1);
                                    });
                                    if (key) { profile.roles.push(key); }
                                }
                            });
                        }

                        // Set granted companies
                        if (data.profile.grants.companies) {
                            profile.companies = _.map(data.profile.grants.companies, function(company) {
                                return {
                                    id: company.id,
                                    units: _.map(company.units, 'code'),
                                    hospServices: _.map(company.hospServices, 'code'),
                                    staffInfos: company.staffInfos
                                };
                            });
                        }
                    }
                }

                return profile;
            });
    }

    /**
     * Update user Profile
     * @param {*} user User object, with user name and domain
     */
    function saveUserProfile(user) {
        // Validate
        if (!_.isObject(user)) { throw 'User cannot be null.'; }

        return $q
            .all([
                _saveUserProfileCompanies(user),
                _saveUserProfileLanguage(user),
                _saveUserProfileRoles(user)
            ]);
    }

    /**
     * Delete user Profile
     * @param {*} user User object, with user name and domain
     */
    function deleteUserProfile(user) {
        // Validate
        if (!_.isObject(user)) { throw 'User cannot be null.'; }

        var endpoint = ENDPOINT_NAME_USER_PROFILE + '/' + user.username + '/' + user.domain;
        return DS.destroyAll(RESOURCE_NAME_USER_PROFILE, {}, {
            bypassCache: true,
            cacheResponse: false,
            endpoint: endpoint
        });
    }

    // ----------------------------------------
    // User Data
    // ----------------------------------------

    /**
     * Update user Data
     * @param {*} user User object, with user name and domain
     */
    function saveUserData(user) {
        // Validate
        if (!_.isObject(user)) { throw 'User cannot be null.'; }

        return _saveUserData(user, clientToken);
    }

    function searchUserProfiles(username, domain) {
        return resourceUserProfileSearch.findAll({
            username: username,
            domain: domain
        });
    }

    // -------------------------------------------------------- Serialization / Deserialization

    function _deserializeUserProfile(data) {
        if (_.isArray(data)) {
            // Apply deserialization on all items in the array
            data.map(function (item) { return _deserializeUserProfile(item); });
        } else if (_.isObject(data)) {
            // Deserialize properties before data item is returned
            helpers.renameProperty(data, 'scim_id', 'id');

            // Ensure camel-case
            if (data.profile.grants) {
                _deserializeUserProfileCompanies(data.profile.grants.companies);
            }
        }

        return data;
    }

    function _deserializeUserProfileCompanies(data) {
        if (!_.isArray(data) || data.length === 0) { return; }

        // Ensure camel-case
        data.map(function (company) {
            helpers.renameProperty(company, 'hospservices', 'hospServices');
            helpers.renameProperty(company, 'patientunits', 'units');
            helpers.renameProperty(company, 'staffids', 'staffInfos');

            _deserializeUserProfileStaffInfo(company.staffInfos);
        });
    }

    function _deserializeUserProfileStaffInfo(data) {
        if (!_.isArray(data) || data.length === 0) { return; }

        // Ensure camel-case
        data.map(function (staffInfo) {
            helpers.renameProperty(staffInfo, 'providerid', 'providerId');
            helpers.renameProperty(staffInfo, 'staffid', 'staffId');
        });
    }

    function _serializeUserProfile(data) {
        if (_.isArray(data)) {
            // Apply deserialization on all items in the array
            data.map(function (item) { return _serializeUserProfile(item); });
        } else if (_.isObject(data)) {
            // Serialize properties before data item is returned
            helpers.renameProperty(data, 'id', 'scim_id');

            // Restore lower-case
            // serialize to create user profile
            if (!_.isUndefined(data.grants)) {
                _serializeUserProfileCompanies(data.grants.companies);
            }
            // serialize to update user profile
            else {
                _serializeUserProfileCompanies(data.companies);
            }
        }

        return data;
    }

    // TODO : to stabilize
    function _serializeUserProfileCompanies(data) {
        if (!_.isArray(data) || data.length === 0) { return; }

        // Ensure camel-case
        data.map(function (company) {
            _serializeUserProfileStaffInfo(company.staffInfos);

            // transform to list of codes
            if (_.isArray(company.units)) {
                // transform array
                company.units = _.map(company.units, function (unit) {
                    if (_.isString(unit)) return unit;
                    return unit.code;
                });
            }

            // transform to list of codes
            if (_.isArray(company.hospServices)) {
                company.hospServices = _.map(company.hospServices, function (hospService) {
                    if (_.isString(hospService)) return hospService;
                    return hospService.code;
                });
            }

            helpers.renameProperty(company, 'hospServices', 'hospservices');
            helpers.renameProperty(company, 'units', 'patientunits');
            helpers.renameProperty(company, 'staffInfos', 'staffids');
        });
    }

    function _serializeUserProfileStaffInfo(data) {
        if (!_.isArray(data) || data.length === 0) { return; }

        // Restore lower-case
        data.map(function (staffInfo) {
            helpers.renameProperty(staffInfo, 'providerId', 'providerid');
            helpers.renameProperty(staffInfo, 'staffId', 'staffid');
        });
    }

    function _deserializeUserData(data) {
        if (_.isArray(data)) {
            // Apply deserialization on all items in the array
            data.map(function (item) { return _deserializeUserData(item); });
        } else if (_.isObject(data)) {
            // Deserialize properties before data item is returned
            helpers.renameProperty(data, 'company', 'companyId');
            helpers.jsonToObject(data, 'history');
            helpers.jsonToObject(data, 'preferences');
        }

        return data;
    }


    // --------------------------------------------------------------------------- User profile

    function _saveUserProfileLanguage(user) {
        // Validate
        if (!_.isString(user.profileLanguage)) { return $q.resolve(); }

        var endpoint = ENDPOINT_NAME_USER_PROFILE + '/' + user.username + '/' + user.domain + '/' + user.profileLanguage;
        return DS
            .create(RESOURCE_NAME_USER_PROFILE, {}, {
                bypassCache: true,
                cacheResponse: false,
                endpoint: endpoint
            });
    }

    function _saveUserProfileCompanies(user) {
        var companies = (_.isArray(user.companies)) ? user.companies : [];

        companies = companies.map(function (company) {
            var units = (_.isArray(company.units)) ? company.units : [];
            var hospServices = (_.isArray(company.hospServices)) ? company.hospServices : [];
            var staffInfos = (_.isArray(company.staffInfos)) ? company.staffInfos : [];

            return {
                hospServices: _.map(hospServices, 'code'),
                id: company.id,
                units: _.map(units, 'code'),
                staffInfos: staffInfos
            };
        });


        var data = {
            username: user.username,
            domain: user.domain,
            companies: companies
        };

        var endpoint = ENDPOINT_NAME_USER_PROFILE_COMPANIES + '/set';
        return DS
            .create(RESOURCE_NAME_USER_PROFILE, data, {
                bypassCache: true,
                cacheResponse: false,
                endpoint: endpoint
            });
    }

    function _saveUserProfileRoles(user) {
        var roles = (_.isArray(user.roles)) ? user.roles : [];
        var data = {
            username: user.username,
            domain: user.domain,
            roles: roles
        };

        var endpoint = ENDPOINT_NAME_USER_PROFILE_ROLES + '/set';
        return DS
            .create(RESOURCE_NAME_USER_PROFILE, data, {
                bypassCache: true,
                cacheResponse: false,
                endpoint: endpoint
            });
    }

    // ----------------------------------------------------------------------- User preferences

    function getUserData(username, domain) {
        // Build default return value
        var preferences = {
            preferredLanguage: undefined,
            cockpit: undefined,
            companyId: undefined,
            history: {
                favoriteSearches: [],
                lastSearches: []
            },
            lastState: undefined,
            tutorials: {},
            companiesUnitsServicesOrder: []
        };

        var endpoint = ENDPOINT_NAME_USER_DATA + '/' + username + '/' + domain + '/' + clientToken;
        return DS
            .findAll(RESOURCE_NAME_USER_DATA, {}, {
                bypassCache: true,
                cacheResponse: false,
                endpoint: endpoint
            })
            .then(function (data) {
                if (_.isObject(data.preferences)) {
                    preferences.preferredLanguage = data.preferences.prefLang;
                    preferences.preferredUnits = data.preferences.prefUnits;
                    preferences.preferredServices = data.preferences.prefServices;
                    preferences.cockpit = data.preferences.cockpit;
                    preferences.companyId = data.preferences.companyId || data.preferences.company;
                    preferences.lastState = data.preferences.lastState;
                    preferences.tutorials = data.preferences.tutorials;
                    preferences.companiesUnitsServicesOrder = data.preferences.companiesUnitsServicesOrder;
                }

                if (_.isObject(data.history)) {
                    preferences.history = data.history;
                }

                // Verify sub-objects
                if (!_.isArray(preferences.history.favoriteSearches)) { preferences.history.favoriteSearches = []; }
                if (!_.isArray(preferences.history.lastSearches)) { preferences.history.lastSearches = []; }

                return preferences;
            })
            .catch(function(error) {
                // NOTE LB: Handle errors (eg: http status == 500, 404, -1) when getting User data, and always return a value.
                // Avoid promise rejection to prevent overall fail of a parallel Promise chain ($q.all)
                // eg: in User service, _initializeUser() => $q.all(granted companies, user data)

                // User has no preferences - return default preferences
                return preferences;
            });
    }

    function _saveUserData(user, clientToken) {
        var userData = {
            'client_id': clientToken,
            history: user.history,
            preferences: {
                'prefLang': user.preferredLanguage,
                'prefUnits': user.preferredUnits,
                'prefServices': user.preferredServices,
                'companyId': user.companyId,
                'cockpit': user.cockpit,
                'lastState': user.lastState,
                'tutorials': user.tutorials,
                'companiesUnitsServicesOrder': user.companiesUnitsServicesOrder
            }
        };

        var endpoint = ENDPOINT_NAME_USER_DATA + '/' + user.username + '/' + user.domain;
        return DS
            .create(RESOURCE_NAME_USER_DATA, userData, {
                bypassCache: true,
                cacheResponse: false,
                endpoint: endpoint
            })
            .catch(function (error) {
                return $q.reject(error);
            });
    }
}

export {
    dataServiceUsers,
    run
};
