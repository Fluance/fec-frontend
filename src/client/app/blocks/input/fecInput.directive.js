/**
 * @ngdoc directive
 * @scope
 * @module app
 * @name fecInput
 * @restrict E
 *
 * @description
 *
 * A Directive that adds the required attributes to disable autocompletion in tablets
 * /!\ It expects the element to have an id attribute !
 * <input fec-input id="my-textfield" type="text" value="Lorem ipsum..."></input>
 **/

function fecInputDirective() {
    var directive = {
        restrict: 'A',
        //template: '<input autocapitalize="none" autocomplete="off" autocorrect="off" {{attributes}}></input>'
        link: function(scope, element, attrs) {
            element.attr('autocapitalize', 'none');
            element.attr('autocomplete', 'off');
            element.attr('autocorrect', 'off');
            element.attr('spellcheck', 'false');
        }
    };
    return directive;
}

/*fecInputController.$inject = [
    '$scope', '$element'
];

function fecInputController($scope, $element) {
    $scope.attributes = '';
    _.each(document.getElementById($element.attr('id')).attributes, function(attr) {
        $scope.attributes += attr.name + '="' + attr.value +'" ';
    });
}*/

export default fecInputDirective;
