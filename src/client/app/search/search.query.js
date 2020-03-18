import _ from 'lodash';
import moment from 'moment';

searchQueryFactory.$inject = ['$stateParams', 'searchCriterion'];

function searchQueryFactory($stateParams, SearchCriterion) {

    // Rules that determine if a criterion is removable from the query
    var rulesDictionary = {
        maidenname: function (aSearchQuery) {
            return true;
        },

        name: function (aSearchQuery) {
            return !!(_.find(aSearchQuery.__criteria, { key: 'birthdate' }));
        },

        firstname: function (aSearchQuery) {
            return true;
        },

        admissionstatus: function (aSearchQuery) {
            return true;
        },

        birthdate: function (aSearchQuery) {
            return !!(_.find(aSearchQuery.__criteria, { key: 'name' }));
        },

        companyid: function (aSearchQuery) {
            return false;
        },

        patientunit: function (aSearchQuery) {
            return true;
        },

        hospservice: function (aSearchQuery) {
            return true;
        },

        patientroom: function (aSearchQuery) {
            return true;
        },

        patientbed: function (aSearchQuery) {
            return true;
        },

        admitdt: function (aSearchQuery) {
            return true;
        },

        field: function (aSearchQuery) {
            return false;
        }
    };

    /*
        SearchQuery Constructor
     */

    function SearchQuery(input) {
        var that = this;

        that.timeStamp = moment().valueOf();
        that.__criteria = [];
        // TODO: add prototypes here
        that.addCriterion = addCriterion;
        that.toStateParams = toStateParams;
        that.getCriteria = getCriteria;
        that.removeCriterion = removeCriterion;
        that.hasCriterion = hasCriterion;
        that.setCriterion = setCriterion;
        that.isValid = isValid;
        that.hash = hash;
        that.description = description;

        // Check if the passed parameter is a regular parameter list or a serialized query to adapt the way we will construct the object
        if (_.isUndefined(input.__criteria)) {
            try {
                _.each(input, function (parameterValue, parameterKey) {
                    if (parameterValue) {
                        var aCriterion = new SearchCriterion(parameterKey, parameterValue);
                        that.addCriterion(aCriterion);
                    }
                });
            } catch (error) {
                throw error;
            }
        } else { // Deserialize received input
            that = _.extend(that, input.timeStamp);
            _.each(input.__criteria, function (element) {
                that.addCriterion(new SearchCriterion(element.key, element.value));
            });
        }

        function addCriterion(aCriterion) {
            that.__criteria.push(aCriterion);
        }

        function toStateParams() {
            var dictionary = {};

            _.each(that.getCriteria(), function (aCriterion) {
                dictionary[aCriterion.key] = aCriterion.getUrlValue();
            });
            return dictionary;
        }

        function getCriteria() {
            _.each(that.__criteria, function (aCriterion) {
                aCriterion.isRemovable = _.isUndefined(rulesDictionary[aCriterion.key]) ?
                    false :
                    rulesDictionary[aCriterion.key](that);
            });
            return _.sortBy(that.__criteria, 'order');
        }

        function removeCriterion(aCriterion) {

            if (!aCriterion.isOptional) {
                return;
            }

            that.__criteria = _.reject(that.__criteria, function (anotherCriterion) {
                if (anotherCriterion.key === aCriterion.key) {
                    $stateParams[aCriterion.key] = undefined;
                }
                return anotherCriterion.key === aCriterion.key;
            });
        }

        function isValid() {
            _.each(that.__criteria, function (aCriterion, index, criteria) {
                try {
                    aCriterion.isValid();
                } catch (errorMessage) {
                    throw '"' + aCriterion.getValue() + '" ' + errorMessage;
                }
            });
            var importantCriteria = _.filter(that.getCriteria(), function (aCriterion) {
                return aCriterion.isImportant;
            });

            return !!importantCriteria.length;
            //return true;
        }

        function hasCriterion(criterion) {
            var criterionName;
            if (_.isObject(criterion)) {
                criterionName = criterion.key;
            }
            else if (_.isString(criterion)) {
                criterionName = criterion;
            }
            else {
                throw new Error('Criterion must be a criterion object or its key name.');
            }
            return !!(_.find(that.getCriteria(), { key: criterionName }));
        }

        function setCriterion(aCriterion) {
            var criteria = that.getCriteria();
            var criterionToModify;

            criterionToModify = _.find(criteria, function (anotherCriterion) {
                return anotherCriterion.key === aCriterion.key;
            });

            if (_.isUndefined(criterionToModify)) {
                addCriterion(aCriterion);
            } else {
                criterionToModify.setValue(aCriterion.getValue());
            }
        }

        function description() {
            var description = that.constructor.name;
            _.each(that.getCriteria(), function (criterion) {
                description += ' ' + criterion.key + ':' + criterion.getValue();
            });
            return description;
        }

        function hash() {
            var s = that.description();
            var nHash = 0;
            if (!s.length) { return nHash; }

            for (var i = 0, imax = s.length, n; i < imax; ++i) {
                n = s.charCodeAt(i);
                nHash = ((nHash << 5) - nHash) + n;
                nHash = nHash & nHash;  // Convert to 32-bit integer
            }
            return Math.abs(nHash);
        }
    }

    return SearchQuery;
}

export default searchQueryFactory;
