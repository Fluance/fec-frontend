fecNumber.$inject = ['$filter'];

function fecNumber($filter) {
    return function(number, fractionSize) {
        var returnValue = $filter('number')(number, fractionSize);
        returnValue = returnValue.replace(',','\'');
        return returnValue;
    };
}

export default fecNumber;
