import _ from 'lodash';

function OrderByObjectPropertyFilter() {
    return function(input, orderByProperty) {
        return _.sortBy(input, orderByProperty);
    }
}

export default OrderByObjectPropertyFilter;
