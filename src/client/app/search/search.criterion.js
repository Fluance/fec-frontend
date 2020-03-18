searchCriterionFactory.$inject = ['moment', '$q', '$filter', '$translate', 'sessionService', 'dataservice.companies'];

/**
 * @ngdoc service
 * @module app.search
 * @name searchCriterionFactory
 * @description
 *
 * The searchCriterion factory returns the SearchCriterion constructor.
 * This allows constructing multiple instances of SearchCriterion objects.
 */
function searchCriterionFactory(moment, $q, $filter, $translate, session, dataServiceCompanies) {
    // TODO : replace the isImportant attribute with something more reliable and smart
    var companies = [];

    // DD-MM-YYYY; D/MM/YYYY; DD/M/YYYY; D/M/YYYY
    // 'Thh:mm:ss' Optional
    // Valid separators: . - /
    var DDMMYYYY = /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[1,3-9]|1[0-2]))\2)(?:(?:1[6-9]|[2-9]\d)\d{2})(?:(?:[T])(?:(?:(?:0|1)[0-9]|2[0-3])(\:)(?:[0-5]\d)\3(?:[0-5]\d)))?$|^(?:29(\/|-|\.)0?2\4(?:(?:(?:1[6-9]|[2-9]\d)(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))(?:(?:[T])(?:(?:(?:0|1)[0-9]|2[0-3])(\:)(?:[0-5]\d)\5(?:[0-5]\d)))?$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\6(?:(?:1[6-9]|[2-9]\d)\d{2})(?:(?:[T])(?:(?:(?:0|1)[0-9]|2[0-3])(\:)(?:[0-5]\d)\7(?:[0-5]\d)))?$/;

    // YYYY/MM/DD; YYYY/MM/D; YYYY/M/DD; YYYY/M/D
    // 'Thh:mm:ss' Optional
    // Valid separators: . - /
    var YYYYMMDD = /^(?:(?:1[6-9]|[2-9]\d)\d{2})(\/|-|\.)(?:(?:(?:0?[13578]|1[02])\1(?:31))|(?:(?:0?[1,3-9]|1[0-2])\1(?:29|30)))(?:(?:[T])(?:(?:(?:0|1)[0-9]|2[0-3])(\:)(?:[0-5]\d)\2(?:[0-5]\d)))?$|^(?:(?:(?:(?:1[6-9]|[2-9]\d)(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00)))(\/|-|\.)(?:0?2)\3(?:29))(?:(?:[T])(?:(?:(?:0|1)[0-9]|2[0-3])(\:)(?:[0-5]\d)\4(?:[0-5]\d)))?$|^(?:(?:1[6-9]|[2-9]\d)\d{2})(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\5(?:0?[1-9]|1\d|2[0-8])(?:(?:[T])(?:(?:(?:0|1)[0-9]|2[0-3])(\:)(?:[0-5]\d)\6(?:[0-5]\d)))?$/;

    var filtersDictionary = {
        name: {
            keyTransformation: function () {
                return 'core.LASTNAME';
            },
            onSetValueTransformation: identityTransformation,
            onGetValueTransformation: identityTransformation,
            isDisplayable: true,
            isImportant: true,
            validator: wordValidator,
            order: 11
        },
        maidenname: {
            keyTransformation: function () {
                return 'search.MAIDENNAME';
            },
            onSetValueTransformation: identityTransformation,
            onGetValueTransformation: identityTransformation,
            displayTransformation: function (aBoolean) {
                var deferred = $q.defer();
                deferred.resolve(aBoolean ? 'search.MAIDENNAME' : '');
                return deferred.promise;
            },
            isDisplayable: true,
            isImportant: false,
            validator: booleanValidator,
            order: 13
        },
        firstname: {
            keyTransformation: function () {
                return 'core.FIRSTNAME';
            },
            onSetValueTransformation: identityTransformation,
            onGetValueTransformation: identityTransformation,
            isDisplayable: true,
            isImportant: false,
            validator: wordValidator,
            order: 12
        },
        birthdate: {
            keyTransformation: function () {
                return 'search.BIRTHDATE';
            },
            onSetValueTransformation: function (aDateString) {
                if (_.isString(aDateString)) {

                    if (aDateString.match(YYYYMMDD)) {
                        return moment(aDateString, 'YYYY-MM-DD').format('YYYY-MM-DDTHH:mm:ss');
                    }

                    if (aDateString.match(DDMMYYYY)) {
                        return moment(aDateString, 'DD.MM.YYYY').format('YYYY-MM-DDTHH:mm:ss');
                    }
                }
                else if (_.isDate(aDateString)) {
                    return moment(aDateString).format('YYYY-MM-DDTHH:mm:ss');
                }
                return aDateString;
            },
            onGetValueTransformation: function (aDate) {
                // TODO : Use momentFormatter
                if (_.isString(aDate)) {
                    if (aDate.match(YYYYMMDD)) {
                        return moment(aDate, 'YYYY-MM-DD').format('YYYY-MM-DD');
                    }

                    if (aDate.match(DDMMYYYY)) {
                        return moment(aDate, 'DD.MM.YYYY').format('YYYY-MM-DD');
                    }
                }
                else if (_.isDate(aDate)) {
                    return moment(aDate).format('YYYY-MM-DD');
                }
                return aDate;
            },
            displayTransformation: function (aDate) {
                var deferred = $q.defer();
                deferred.resolve(moment(aDate).format('DD.MM.YYYY'));
                return deferred.promise;
            },
            isDisplayable: true,
            isImportant: true,
            validator: dateValidator,
            order: 14
        },

        //  Admission Status filter transformations
        admissionstatus: {
            keyTransformation: function () {
                return 'search.ADMISSIONSTATUS';
            },
            onSetValueTransformation: identityTransformation,
            onGetValueTransformation: identityTransformation,
            displayTransformation: function (aValue) {
                var admissionStatuses = {
                        currentadmission: 'core.ADMISSIONSTATUS_PRESENT',
                        preadmission: 'core.ADMISSIONSTATUS_PREADMITTED'
                    },
                    currentStatusKey = _.find(_.keys(admissionStatuses), function (aStatus) {
                        return aStatus === aValue;
                    }),
                    transformedValue = $filter('translate')(admissionStatuses[currentStatusKey]);

                var deferred = $q.defer();
                deferred.resolve(transformedValue);
                return deferred.promise;
            },
            isDisplayable: true,
            isImportant: false,
            validator: alwaysValid
        },

        pid: {
            keyTransformation: function () {
                return 'core.PATIENT_ID';
            },
            onSetValueTransformation: identityTransformation,
            onGetValueTransformation: identityTransformation,
            displayTransformation: identityTransformationPromise,
            isDisplayable: true,
            isImportant: true,
            validator: integerValidator,
            order: 21
        },

        vnb: {
            keyTransformation: function () {
                return 'core.VISIT_NB';
            },
            onSetValueTransformation: identityTransformation,
            onGetValueTransformation: identityTransformation,
            displayTransformation: identityTransformationPromise,
            isDisplayable: true,
            isImportant: true,
            validator: integerValidator,
            order: 22
        },

        companyid: {
            keyTransformation: function () {
                return 'core.COMPANY';
            },
            onSetValueTransformation: identityTransformation,
            onGetValueTransformation: toInteger,
            displayTransformation: function (aValue) {
                var promise = dataServiceCompanies.getCompanyList().then(function (companies) {
                    var aCompany = _.find(companies, { id: Number(aValue) });
                    return (aCompany) ? aCompany.name : undefined;
                });
                return promise;
            },
            isDisplayable: true,
            isImportant: true,
            validator: alwaysValid,
            order: 31
        },

        hospservice: {
            keyTransformation: function () {
                return 'core.HOSP_SERVICE';
            },
            onSetValueTransformation: identityTransformation,
            onGetValueTransformation: identityTransformation,
            isDisplayable: true,
            isImportant: false,
            validator: alwaysValid,
            order: 32
        },

        patientunit: {
            keyTransformation: function () {
                return 'core.UNIT';
            },
            onSetValueTransformation: identityTransformation,
            onGetValueTransformation: identityTransformation,
            isDisplayable: true,
            isImportant: false,
            validator: alwaysValid,
            order: 33
        },

        patientroom: {
            keyTransformation: function () {
                return 'core.ROOM';
            },
            onSetValueTransformation: identityTransformation,
            onGetValueTransformation: identityTransformation,
            isDisplayable: true,
            isImportant: false,
            validator: alwaysValid,
            order: 34
        },

        patientbed: {
            keyTransformation: function () {
                return 'search.PATIENTBED';
            },
            onSetValueTransformation: identityTransformation,
            onGetValueTransformation: identityTransformation,
            isDisplayable: true,
            isImportant: false,
            validator: alwaysValid,
            order: 35
        },

        admitdt: {
            keyTransformation: function () {
                return 'core.ADMIT_DATE';
            },
            onSetValueTransformation: function (aDateString) {
                // TODO : Use momentFormatter
                if (_.isString(aDateString)) {
                    if (aDateString.match(YYYYMMDD)) {
                        return moment(aDateString, 'YYYY-MM-DD').format('YYYY-MM-DDTHH:mm:ss');
                    }

                    if (aDateString.match(DDMMYYYY)) {
                        return moment(aDateString, 'DD.MM.YYYY').format('YYYY-MM-DDTHH:mm:ss');
                    }
                }
                else if (_.isDate(aDateString)) {
                    return moment(aDateString).format('YYYY-MM-DDTHH:mm:ss');
                }
                return aDateString;
            },
            onGetValueTransformation: function (aDate) {
                // TODO : Use momentFormatter
                if (aDate.match(YYYYMMDD)) {
                    return moment(aDate).toDate();
                } else {
                    return aDate;
                }
            },
            displayTransformation: function (aDate) {
                var deferred = $q.defer();

                deferred.resolve(
                    moment(aDate).format('DD.MM.YYYY')
                );

                return deferred.promise;
            },
            isDisplayable: true,
            isImportant: undefined,
            validator: dateValidator,
            order: 36
        },

        orderby: {
            keyTransformation: identityTransformation,
            onSetValueTransformation: identityTransformation,
            onGetValueTransformation: identityTransformation,
            isDisplayable: false,
            isImportant: undefined,
            validator: alwaysValid

        },

        sortorder: {
            keyTransformation: identityTransformation,
            onSetValueTransformation: identityTransformation,
            onGetValueTransformation: identityTransformation,
            isDisplayable: false,
            isImportant: undefined,
            validator: alwaysValid
        },

        offset: {
            keyTransformation: identityTransformation,
            onSetValueTransformation: identityTransformation,
            onGetValueTransformation: identityTransformation,
            isDisplayable: false,
            isImportant: undefined,
            validator: alwaysValid
        },

        field: {
            keyTransformation: function () {
                return 'core.TEXT';
            },
            onSetValueTransformation: function(inputValue) {
                var searchFieldSubstrings = inputValue.split(' ');
                var searchFieldWithFormattedDates = [];

                _.each(searchFieldSubstrings, function(substring, index, substrings) {
                    try {
                        if (substring.match(YYYYMMDD)) {
                            substring = moment(substring, 'YYYY-MM-DD').format('YYYY-MM-DD');
                        }

                        if (substring.match(DDMMYYYY)) {
                            substring = moment(substring, 'DD-MM-YYYY').format('YYYY-MM-DD');
                        }
                    }
                    catch (nothing) {}
                    finally {
                        searchFieldWithFormattedDates.push(substring);
                    }
                });

                searchFieldWithFormattedDates = searchFieldWithFormattedDates.join(' ');

                return searchFieldWithFormattedDates;
            },
            onGetValueTransformation: identityTransformation,
            isDisplayable: true,
            isImportant: true,
            validator: function(inputValue) { // This validator combinates alphanumerical words and dates
                var isInputValid = true;

                var substrings = inputValue.split(' ');
                _.each(substrings, function(substring) {
                    var isSubstringValid = false;
                    try { isSubstringValid |= alphanumWordValidator(substring) } catch (nothing) {};
                    try { isSubstringValid |= dateValidator(substring) } catch (nothing) {};

                    isInputValid &= isSubstringValid;
                });

                if (!isInputValid) throw $filter('translate')('error.INVALID_VALUE');

                return isInputValid;
            }
        },

        type: {
            keyTransformation: identityTransformation,
            onSetValueTransformation: identityTransformation,
            onGetValueTransformation: identityTransformation,
            isDisplayable: false,
            isImportant: false,
            validator: alwaysValid
        },

        appointmentId: {
            keyTransformation: identityTransformation,
            onSetValueTransformation: identityTransformation,
            onGetValueTransformation: identityTransformation,
            isDisplayable: false,
            isImportant: false,
            validator: alwaysValid
        },

        noteId: {
            keyTransformation: identityTransformation,
            onSetValueTransformation: identityTransformation,
            onGetValueTransformation: identityTransformation,
            isDisplayable: false,
            isImportant: false,
            validator: alwaysValid
        }
    };

    function identityTransformation(aValue) {
        return aValue;
    }

    function identityTransformationPromise(aValue) {
        var deferred = $q.defer();
        deferred.resolve(aValue);
        return deferred.promise;
    }

    // function toBoolean(aValue) {
    //     return aValue === 'true';
    // }

    function toInteger(aValue) {
        return parseInt(aValue);
    }

    // function purifyString(aString) {
    //     // Remove invalid characters
    //     _.each(SearchCriterion.invalidCharacters, function (c) {
    //         aString = aString.split(c).join("");
    //     });

    //     return aString;
    // }

    /*
     SearchCriterion Constructor
     */


    /**
     * @ngdoc method
     * @name searchCriterionFactory#SearchCriterion
     * @param  {String} aKey Criterion name
     * @param  {Object} aValue Criterion value
     * @return {SearchCriterion} Returns a SearchCriterion object
     * @description
     *
     * This function is the SearchCriterion constructor.
     */
    // TODO : remove definition tests
    function SearchCriterion(aKey, aValue) {
        var that = this;

        var filterInfo = filtersDictionary[aKey];

        this.key = aKey || null;
        this.value = undefined;
        this.isValid = function () {
            return (_.isObject(filterInfo)) ? filterInfo.validator(this.value) : true;
        };
        this.isOptional = true;
        this.isDisplayable = (_.isObject(filterInfo)) ? filterInfo.isDisplayable : true;
        this.isImportant = (_.isObject(filterInfo)) ? filterInfo.isImportant : true;
        this.isRemovable = false;
        this.displayTransformation = (_.isObject(filterInfo)) ? filterInfo : null;
        this.getValue = getValue;
        this.setValue = setValue;
        this.getDisplayValue = getDisplayValue;
        this.getUrlValue = getUrlValue;
        this.order = (_.isObject(filterInfo)) ? filterInfo.order : 0;

        setValue(aValue);

        // Mutators
        function getValue() {
            if (filterInfo) {
                return filterInfo.onGetValueTransformation(that.value);
            }
        }

        function setValue(aValue) {
            if (filterInfo) {
                that.value = filterInfo.onSetValueTransformation(aValue);
            }
        }

        function getUrlValue() {
            var valueToReturn = getValue();
            if (_.isDate(valueToReturn)) {
                valueToReturn = moment(valueToReturn).format('YYYY-MM-DD');
            }
            return valueToReturn;
        }

        // Methods
        function getDisplayValue() {
            var valueToDisplayPromise;

            if (_.isUndefined(filterInfo.displayTransformation)) {
                var deferred = $q.defer();
                deferred.resolve(that.value);
                valueToDisplayPromise = deferred.promise;
            } else {
                valueToDisplayPromise = filterInfo.displayTransformation(that.value);
            }

            return valueToDisplayPromise;
        }
    }

    return SearchCriterion;

    // Values validators
    function wordValidator(aValue) {
        if (!aValue.match(/^([À-ÿa-z][À-ÿa-z'-]*)$/i)) { throw $filter('translate')('error.INVALID_VALUE'); }
        return true;
    }

    function alphanumWordValidator(aValue) {
        if (!aValue.match(/^([0-9À-ÿa-z][0-9À-ÿa-z'-\s]*)$/i)) { throw $filter('translate')('error.INVALID_VALUE');}
        return true;
    }

    function integerValidator(aValue) {
        if (!aValue.match(/^\d+$/i)) { throw $filter('translate')('error.INVALIDE_NUMBER'); }
        return true;
    }

    function booleanValidator(aValue) {
        if (!_.isBoolean(aValue)) { throw ('is not a boolean value'); }
        return true;
    }

    function dateValidator(aValue) {
        if (aValue.match(YYYYMMDD)) {
            aValue = moment(aValue, 'YYYY-MM-DD').format('YYYY-MM-DDTHH:mm:ss');
        }

        if (aValue.match(DDMMYYYY)) {
            aValue = moment(aValue, 'DD.MM.YYYY').format('YYYY-MM-DDTHH:mm:ss');
        }

        if (!(moment(aValue).isValid() && moment(aValue).isBetween('1900/1/1', moment()))) {
            throw $filter('translate')('error.INVALID_DATE');
        }
        return true;
    }

    function isNotEmpty(aString) {
        if (_.isEmpty(aString)) throw $filter('translate')('error.INVALID_VALUE');
        return true;
    }

    function alwaysValid() {
        return true;
    }
}

export default searchCriterionFactory;
