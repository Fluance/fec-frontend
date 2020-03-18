kebab.$inject = [];

function kebab() {
    return function(input) {
        return _.kebabCase(input);
    };
}

export default kebab;
