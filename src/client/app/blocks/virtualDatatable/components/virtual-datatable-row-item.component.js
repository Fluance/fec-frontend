VirtualDatatableRowItem.$inject = ['$compile'];

function VirtualDatatableRowItem($compile) {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            item: '<'
        },
        link: function link(scope, elem, attrs) {
            var component = attrs['component'];
            var str = '<' + component + ' layout="row" flex="grow" item="item"></' + component + '>';
            var compiled = $compile(str)(scope);
            elem.append(compiled);
        }}
}

export default VirtualDatatableRowItem;

