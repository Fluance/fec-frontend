
fecPatientViewNavigation.$inject = ['PatientViewService'];

function fecPatientViewNavigation(service) {
    var element;

    return {
        restrict: 'A',
        link: function(scope, iElem, iAttrs) {
            element = iElem;

            if(service.isActive()) {
                // subscribe
                service.navigationDisabled.subscribe(onNavigationDisabled);

                scope.$on('$destroy', function() {
                    cleanup();
                });
            }
        }
    };

    // Event handling: is navigation disabled?
    function onNavigationDisabled(isDisabled) {
        if(isDisabled) {
            element.remove();
        }
        else {
            cleanup();
        }
    }

    function cleanup() {
        // unsubscribe
        service.navigationDisabled.unsubscribe();
    }
}


export default fecPatientViewNavigation;
