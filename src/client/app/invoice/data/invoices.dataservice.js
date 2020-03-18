/*jshint -W101*/ //  Line too long

const RESOURCE_NAME = 'invoices';
const ENDPOINT_NAME = 'invoices';
const RESOURCE_NAME_DETAIL = 'invoice.detail';
const ENDPOINT_NAME_DETAIL = 'invoices';
const ENTITY_KEY = 'id';


const run = ['config', 'DS', function(config, DS) {
    DS.defineResource({
        name: RESOURCE_NAME,
        endpoint: ENDPOINT_NAME,
        idAttribute: ENTITY_KEY,
        basePath: config.apiServer
    });
    DS.defineResource({
        name: RESOURCE_NAME_DETAIL,
        endpoint: ENDPOINT_NAME_DETAIL,
        idAttribute: ENTITY_KEY,
        basePath: config.apiServer,
        relations: {
            belongsTo: {
                visit: {
                    localField: 'visit',
                    localKey: 'visitid'
                }
            }
        }
    });
}];

dataServiceInvoices.$inject = ['DS'];

function dataServiceInvoices(DS) {

    var service = {
        // Properties
        sortCriteria: [
            { key: 'invdt', name: 'invoice.INV_DATE' }
        ],

        // Methods
        getInvoiceList: getInvoiceList,
        getInvoice: getInvoice,
        getInvoiceCount: getInvoiceCount,
        hasInvoiceData: hasInvoiceData
    };

    return service;

    function getInvoiceList(visitId, guarantorId, offset, limit, orderBy, sortOrder) {
        // Validate
        if (!visitId) { throw '\'vnb\' cannot be null'; }
        if (guarantorId && !_.isNumber(guarantorId)) { throw '\'guarantorId\' must be a long'; }

        var args = {
            visitnb: visitId,
            offset: offset,
            limit: limit,
            orderby: orderBy,
            sortorder: sortOrder
        };
        if (guarantorId > 0) { args.guarantorid = guarantorId; }

        return DS.findAll(RESOURCE_NAME, args);
    }

    function getInvoice(invoiceId) {
        return DS.find(RESOURCE_NAME_DETAIL, invoiceId);
    }

    function getInvoiceCount(visitId, guarantorId) {
        // Validate
        if (!visitId) { throw '\'vnb\' cannot be null'; }
        if (guarantorId && !_.isNumber(guarantorId)) { throw '\'guarantorId\' must be a long'; }

        var args = {

            visitnb: visitId
        };
        if (guarantorId > 0) { args.guarantorid = guarantorId; }

        return DS
            .findAll(RESOURCE_NAME, args, {
                endpoint: ENDPOINT_NAME + '/count',
                bypassCache: true,
                cacheResponse: false
            })
            .then(function(data) {
                return (_.isObject(data) && _.isNumber(data.count)) ? data.count : 0;
            });
    }

    function hasInvoiceData(visitId, guarantorId) {
        return getInvoiceCount(visitId, guarantorId)
            .then(function(count) {
                return count > 0;
            });
    }
}

export {
    dataServiceInvoices,
    run
}
