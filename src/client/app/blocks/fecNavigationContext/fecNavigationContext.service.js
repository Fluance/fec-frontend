/* @ngInject */
fecNavigationContextService.$inject = [
    '$injector',
    '$q',
    '$rootScope',
    '$state'
];

function fecNavigationContextService(
    $injector,
    $q,
    $rootScope,
    $state
) {
    var context = {
        patientId: null,
        visitId: null,
        appointmentId: null,
        roomName: null,
        originState: null,
        originParams: null
    };

    var service = {
        getContext: getContext,
        getContextItem: getContextItem,
        preserveContext: preserveContext,
        setContextItem: setContextItem
    };

    return service;

    function getContext() {
        return context;
    }

    function getContextItem(itemName, askAlways) {
        var contextItemValue = context[itemName];
        if ((!_.isUndefined(askAlways) && !_.isNull(askAlways) && _.includes(askAlways, itemName)) && _isOwnState(askAlways) || _.isNull(contextItemValue)) {
            var injectedDialog = $injector.get(itemName + 'SelectionDialogService');
            return injectedDialog.select().then(function (newContextItemValue) {
                if (!_.isUndefined(newContextItemValue) && !_.isNull(newContextItemValue) && newContextItemValue !== contextItemValue) {
                    setContextItem(itemName, newContextItemValue);
                }
                return newContextItemValue;
            });
        } else {
            return $q.resolve(contextItemValue);
        }
    }

    function loadMissingParams(requiredParams, params) {
        // set the variables we already have
        _.forEach(params, function (value, key) {
            var currentKey = key;
            var currentValue = value;

            switch (currentKey) {
                case 'pid':
                    currentKey = 'patientId';
                    break;

                case 'vnb':
                    currentKey = 'visitId';
                    break;

                case 'aid':
                    currentKey = 'appointmentId';
                    break;

                default:
                    break;
            }

            setContextItem(currentKey, currentValue);
            requiredParams.pop(currentKey);
        });
        // load the rest
    }

    function preserveContext(additionalContextToPreserve) {
        var preservedParams = $state.current.requiredParameters || [];

        // Add the additional context to preserve
        if (additionalContextToPreserve) {
            _.each(additionalContextToPreserve, function (contextItemToPreserve) {
                if (_.indexOf(preservedParams, contextItemToPreserve) === -1) {
                    preservedParams.push(contextItemToPreserve);
                }
            });
        }

        var paramsToBeSet = [];
        _.forEach(context, function(value, key) {
            if (_.includes(preservedParams, key)) {
                if (_.isNull(context[key])) {
                    paramsToBeSet.push(key);
                }
            } else {
                setContextItem(key, null);
            }
        });
        loadMissingParams(paramsToBeSet, $state.params);
    }

    function setContextItem(key, value) {
        context[key] = value;
        $rootScope.$broadcast('fecNavigationContextChanged', {'key': key, 'value': value});
    }

    function _isOwnState(item) {
        return _.startsWith($state.current.name, item.state);
    }
}

export default fecNavigationContextService;

