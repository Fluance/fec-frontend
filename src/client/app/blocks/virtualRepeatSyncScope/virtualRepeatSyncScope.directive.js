SyncScopes.$inject = ['$rootScope', '$timeout'];

function SyncScopes($rootScope, $timeout) {
    return {
        restrict: 'A',
        scope: {
            syncAttr: '<',
            syncScope: '<'
        },
        controller: function() {},
        link: function (scope, elem, attrs, ctrl) {
            scope.$watch('syncAttr', function() {
                $timeout(function() {
                    if(!$rootScope.$$phase) {
                        $rootScope.$digest();
                    }
                }, 1);

            });
        }
    }
}

export default SyncScopes;
