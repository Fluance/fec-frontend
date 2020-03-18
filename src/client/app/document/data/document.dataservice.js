// Resources
// binary
// metadata
const RESOURCE_NAME = 'documents';
const ENDPOINT_NAME = '/patients';
const RESOURCE_NAME_TEMPLATE = 'documents.companies';
const ENDPOINT_NAME_TEMPLATE = '/patients';
const RESOURCE_NAME_COMPANY = 'documents.templates';
const ENDPOINT_NAME_COMPANY = '/patients';
let Document,Company, DocumentTemplate;


const run = ['config', 'DS', function(config, DS) {
    Document = DS.defineResource({
        name: RESOURCE_NAME,
        endpoint: ENDPOINT_NAME,
        basePath: config.apiServerDocuments,
        bypassCache: true,
        cacheResponse: false
    });
    Company = DS.defineResource({
        name: RESOURCE_NAME_COMPANY,
        endpoint: ENDPOINT_NAME_COMPANY,
        basePath: config.apiServerDocuments,
        bypassCache: true,
        cacheResponse: false
    });
    DocumentTemplate = DS.defineResource({
        name: RESOURCE_NAME_TEMPLATE,
        endpoint: ENDPOINT_NAME_TEMPLATE,
        basePath: config.apiServerDocuments,
        bypassCache: true,
        cacheResponse: false
    });
}];

DocumentsDataService.$inject = ['$q', '$http', 'config', 'DS', 'helpers'];

// handle
function DocumentsDataService($q, $http, config, DS, helpers) {

    // modify/adjust 'Document' model
    Document.afterFindAll = function(Resource, data) {
        return _deserialize(data);
    };

    var service = {
        getDocuments: getDocuments,
        getDocumentsCount: getDocumentsCount,
        getCompanies: getCompanies,
        getDocumentFileUrl: getDocumentFileUrl,
        getDocumentFile: getDocumentFile,
        getDocumentFileFromTemplate: getDocumentFileFromTemplate,
        getDocumentTemplates: getDocumentTemplates
    };

    return service;

    // -------------------------------------------------------- Interface methods

    /**
     * Gets (paginated) list of patient documents
     * @param params parameters used to filter/paginate/sort list of patient documents
     * @returns {*}
     */
    function getDocuments(params) {
        var endpoint = ENDPOINT_NAME + '/' + params.pid + '/files';

        return Document
            .findAll({
                companyid: params.filterBy === 'companyId' ? params.filterValue : undefined,
                offset: params.offset || 0,
                limit: params.limit || 5,
                orderby: params.sortBy,
                sortorder: params.sortBy ? (params.sortDesc ? 'desc' : 'asc') : undefined
            }, {
                endpoint: endpoint,
                cacheResponse: false,
                bypassCache: true
            });
    }

    /**
     * Gets total number of patient documents
     * @param params parameters used to filter patient documents count
     */
    function getDocumentsCount(params) {
        var endpoint = ENDPOINT_NAME + '/' + params.pid + '/files/count';
        return Document
            .findAll({
                companyid: params.filterBy === 'companyId' ? params.filterValue : undefined
            }, {
                endpoint: endpoint,
                cacheResponse: false,
                bypassCache: true
            })
            .then(function(data) {
               return data.count;
            })
            .catch(function(error) {
                return 0;
            });
    }

    /**
     * Gets list of companies associated with patient documents (files)
     * @param pid patient id (optional)
     * @returns {*} Returns list of companies filtered by pid, or all companies if no pid is provided
     */
    function getCompanies(pid) {
        var endpoint = ENDPOINT_NAME_COMPANY  + '/files-companies';
        return Company
            .findAll({
                pid: pid ? pid : null
            }, {
                endpoint: endpoint,
                cacheResponse: false,
                bypassCache: true
            });
    }

    /**
     * @deprecated
     * Get URL to document file
     * @param pid patient id
     * @param documentId document (file) id
     * @returns {*}
     */
    function getDocumentFileUrl(pid, documentId) {
        if (pid && documentId) {
            // SECURED EP
            //return config.apiServerDocuments + ENDPOINT_NAME + '/' + pid + '/files/' + documentId;
            // UNSECURED EP
            return config.apiServerDocuments + '/patients-files/' + documentId;
        }
        else {
            return null;
        }
    }

    /**
     * Get a single patient file (binary)
     * @param pid patient id
     * @param documentId document (file) id
     * @returns {*}
     */
    function getDocumentFile(pid, documentId) {
        var documentUrl;

        if (pid && documentId) {
            // SECURED EP
            documentUrl = config.apiServerDocuments + ENDPOINT_NAME + '/' + pid + '/files/' + documentId;
            // UNSECURED EP
            //documentUrl = config.apiServerDocuments + '/patients-files/' + documentId;

            return $http.get(documentUrl, {
                responseType: 'blob'
            }).then(function(response) {
                var filename = _getFilename(response);
                return {
                    data: response.data,
                    filename: filename
                }
            }).catch(function(error) {
                console.log('Error loading pdf document:', error);
                return error;
            });
        }
        else {
            return $q.reject("Missing parameters");
        }
    }

    function getDocumentFileFromTemplate(pid, visitNb, companyId, templateId) {
        var documentUrl;

        if(pid && visitNb && companyId && templateId) {
            documentUrl = config.apiServerDocuments + ENDPOINT_NAME + '/' + pid + '/pdf/generate';

            return $http.get(documentUrl, {
                responseType: 'blob',
                params: {
                    pid: pid,
                    companyid: companyId,
                    visitnb: visitNb,
                    templateid: templateId
                }
            }).then(function(response) {
                var filename = _getFilename(response);
                return {
                    data: response.data,
                    filename: filename
                }
            }).catch(function(error) {
                console.log('Error loading pdf document:', error);
                return error;
            });
        }
        else {
            return $q.reject("Missing parameters");
        }
    }

    function getDocumentTemplates(companyid) {
        var endpoint = ENDPOINT_NAME_TEMPLATE  + '/files-templates';
        return DocumentTemplate
            .findAll({companyid: companyid}, {
                endpoint: endpoint,
                cacheResponse: false,
                bypassCache: true
            });
    }

    // -------------------------------------------------------- Helper functions

    /**
     * Get filename from response (in the header)
     * @param response
     * @returns {string} Return filename in the response header, or a default value if not found.
     * @private
     */
    function _getFilename(response) {
        var DEFAULT_FILENAME = 'document.pdf';
        var filename = DEFAULT_FILENAME;
        var contentDisposition = response.headers('Content-Disposition');
        if (contentDisposition && contentDisposition.indexOf('attachment') !== -1) {
            var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
            var matches = filenameRegex.exec(contentDisposition);
            if (matches != null && matches[1]) {
                filename = matches[1].replace(/['"]/g, '');
            }
        }
        return filename;
    }

    // -------------------------------------------------------- Serialization / Deserialization

    function _serialize(data) {
        return data;
    }

    function _deserialize(data) {
        if (_.isArray(data)) {
            // Apply deserialization on all items in the array
            data.map(function(item) {
                return _deserialize(item);
            });
        } else if (_.isObject(data) && !_.isNumber(data.count)) {
            // Deserialize properties before data item is returned
            helpers.toDate(data, 'creationDate');
            //helpers.addProperty(data, 'patientId', data.patient.pid);
        }
        return data;
    }
}


export {
    DocumentsDataService,
    run
}
