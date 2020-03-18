
/**
* @ngdoc directive
* @scope
* @module app
* @name uiSref
* @param {string} ui-sref              link
*
* @description
*
* A Directive that allow you to link an elment to an html file
*
   <a ui-sref="home">Home</a> | <a ui-sref="about">About</a> | <a ui-sref="{page: 2}">Next page</a>
*/

uiSref.$inject = ['$state', 'sessionService'];

function uiSref($state, session) {
    return function(scope, elem, attrs) {
        var keyword = attrs.uiSref.split('(', 1);
        var state = $state.get(keyword[0]);

        if (state &&
            (state.accessControl.restrictToRoles.length > 0) &&
            (!session.user || !session.user.hasRole(state.accessControl.restrictToRoles))) {
            elem.addClass('ng-hide');
            scope.$watch(function() {
                return session.user;
            }, function(newValue, oldValue) {
                var hasRole = session.user && session.user.hasRole(state.accessControl.restrictToRoles);
                var hasClass = elem.hasClass('ng-hide');
                if (hasRole && hasClass) {
                    elem.removeClass('ng-hide');
                } else if (!hasRole && !hasClass) {
                    elem.addClass('ng-hide');
                }
            });
        }
    };
}


export default uiSref;
