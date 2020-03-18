stringReplace.$inject = ['$filter'];

/* @ngInject */
function stringReplace($filter) {
    return function(input, current, replacement, replaceAll) {
        if (replaceAll) {
            current = new RegExp(current, 'g');
        } else {
            current = new RegExp(current);
        }
        return input.replace(current, replacement);
    };
}

export default stringReplace;
