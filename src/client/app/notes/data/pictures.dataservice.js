
// Resources
const RESOURCE_NAME_NOTE_PICTURES = 'picture';
const ENDPOINT_NAME_NOTE_PICTURES = '/notes/pictures';
const ENDPOINT_NAME_PICTURES = 'pictures';
const ENDPOINT_NAME_HISTORY_PICTURES = 'pictures/history';
let Picture;

//    var RESOURCE_NAME_GALLERY = 'gallery';
//    var ENDPOINT_NAME_GALLERY = 'pictures';


// types of pictures
const TYPE_THUMBNAIL = 'THUMBNAIL',
      TYPE_REGULAR = 'REGULAR';

const DEFAULT_LIMIT_PER_NOTE = 100;


const run = ['config', 'DS', function(config, DS) {
    Picture = DS.defineResource({
        name: RESOURCE_NAME_NOTE_PICTURES,
        endpoint: ENDPOINT_NAME_NOTE_PICTURES,
        // basePath: config.apiServer,
        basePath: config.apiServerNotes,
        idAttribute: 'pictureId'
    });
    /*
    DS.defineResource({
        name: RESOURCE_NAME_GALLERY,
        endpoint: ENDPOINT_NAME_GALLERY,
        basePath: config.apiServerNotes,
        idAttribute: 'pictureId',
        relations: {
            belongsTo: {
                patient: {
                    parent: true,
                    localKey: 'pid',
                    localField: 'patient'
                }
            }
        }
    })
    */
}];

dataServicePictures.$inject = ['DS', '$q', 'config', 'helpers', 'Upload'];

function dataServicePictures(DS, $q, config, helpers, Upload) {

    var service = {
        createInstance: createInstance,
        createPicture: createPicture,
        updatePicture: updatePicture,
        deletePicture: deletePicture,
        restorePicture: restorePicture,
        orderPictures: orderPictures,
        getPictureDetail: getPictureDetail,
        getPictures: getPictures,
        getPicturesCount: getPicturesCount,
        getDeletedPicturesCount: getDeletedPicturesCount,
        getPicturesToRestore: getPicturesToRestore,
        getThumbnails: getThumbnails,
        uploadPicture: uploadPicture,
        getPictureUrl: getPictureUrl,
        getThumbnailUrl: getThumbnailUrl,
        getPicturesFromGallery: getPicturesFromGallery,
        getHistoryPicture: getHistoryPicture
    };

    // modify/adjust 'Picture' model
    Picture.afterFindAll = function(Resource, data) {
        return _deserialize(data);
    };
    Picture.beforeUpdate = function(Resource, data) {
        return _serialize(data);
    };

    return service;

    // -------------------------------------------------------- Interface methods
    /**
     * Get the details of the picture
     * @param pictureId
     */
    function getPictureDetail(pictureId) {
        if (pictureId) {
            var endpoint = ENDPOINT_NAME_NOTE_PICTURES + '/' + pictureId;
            return Picture
                .findAll({
                    pictureId: pictureId
                }, {
                    endpoint: endpoint,
                    cacheResponse: false
                })
                .then(function (data) {
                    return data;
                });
        }
    }
    /**
     * Load metadata of list of pictures of a note
     * @param noteId
     * @param offset
     * @param limit
     * @returns {*}
     */
    function getPictures(noteId, offset, limit) {
        return _getPictures(noteId, offset, limit, TYPE_REGULAR, false);
    }

    /**
     * Load metadata of list of thumbnail pictures of a note
     * @param noteId
     * @param offset
     * @param limit
     * @returns {*}
     */
    function getThumbnails(noteId, offset, limit) {
        return _getPictures(noteId, offset, limit, TYPE_THUMBNAIL, false);
    }

    function getPicturesCount(noteId) {
        return _getPicturesCount(noteId, false);
    }

    function getDeletedPicturesCount(noteId) {
        return _getPicturesCount(noteId, true);
    }

    /**
     * Load metadata of list of deleted pictures of a note
     * @param noteId
     * @param offset
     * @param limit
     * @returns {*}
     */
    function getPicturesToRestore(noteId, isThumbnail, offset, limit) {
        return _getPictures(noteId, offset, limit, isThumbnail ? TYPE_THUMBNAIL : TYPE_REGULAR, true);
    }

    function createInstance(note) {
        if (!_.isObject(note)) { return; }

        return Picture.createInstance({
            noteId: note.id || undefined,
            fileName: '',
            referenceDate: note.referenceDate || undefined, // same reference date as the note
            annotation: ''
        });
    }

    /**
     * Create new picture (metadata + image)
     * @param picture
     * @param file
     */
    function createPicture(picture, file) {
        var defer = $q.defer(),
            promise = defer.promise;

        Upload.upload({
                url: config.apiServerNotes + '/notes/pictures',
                file: file,
                data: {
                    picture: JSON.stringify(picture),
                    noteid: picture.noteId
                }
            })
            .progress(function(evt) {
                console.log(parseInt(100.0 * evt.loaded / evt.total));
            })
            .success(function(newPicture) {
                defer.resolve(newPicture);
            })
            .error(function(message, code) {
                defer.reject(message, code);
            });

        return promise;
    }

    /**
     * Update picture metadata
     * @param note
     * @param picture
     */
    function updatePicture(picture) {
        if (!_.isObject(picture) || !_.isNumber(picture.noteId) || !_.isNumber(picture.pictureId)) { return $q.reject(); }

        // update metadata
        return Picture.save(picture.pictureId, {
            params: { noteid: picture.noteId }
        });
    }

    function deletePicture(picture) {
        if (!_.isObject(picture) || !_.isNumber(picture.noteId) || !_.isNumber(picture.pictureId)) { return $q.reject(); }

        // delete metadata
        return Picture.destroy(picture.pictureId, {
            params: { noteid: picture.noteId }
        });
    }

    function restorePicture(picture) {
        // call restore endpoint
        var endpoint = ENDPOINT_NAME_NOTE_PICTURES + '/' + picture.pictureId + '/restore';
        return Picture.updateAll({}, {}, {
            endpoint: endpoint,
            cacheResponse: false,
            bypassCache: true
        });
    }

    function orderPictures(noteId, pictureIds) {
        // call reorder endpoint passing list of picture ids
        var endpoint = ENDPOINT_NAME_NOTE_PICTURES + '/order';
        return Picture.updateAll(pictureIds, {
            noteid: noteId
        }, {
            endpoint: endpoint,
            cacheResponse: false,
            bypassCache: true
        });
    }

    function uploadPicture(noteId, file) {
        // Validate parameters
        if (!angular.isNumber(noteId) || noteId <= 0) { return $q.reject(); }
        if (!angular.isObject(file)) { return $q.reject(); }

        file.upload = Upload.upload({
            url: resource.basePath + '/notes/' + noteId + '/' + resource.endpoint + '/upload',
            data: { file: file }
        });

        return file.upload.then(
            function(response) {
                return response.data;
            },
            function(exception) {
                return $q.reject(exception);
            });
    }

    function getPictureUrl(pictureId) {
        return config.apiServerNotes + '/' + ENDPOINT_NAME_PICTURES + '/' + pictureId;
    }

    function getThumbnailUrl(pictureId) {
        return config.apiServerNotes + '/' + ENDPOINT_NAME_PICTURES + '/' + pictureId + '/thumbnail';
    }

    function getPicturesFromGallery(patientId) {
        var pictureType = TYPE_THUMBNAIL;
        return Picture.findAll({
                pid: patientId
            }, {
                bypassCache: true
            })
            .then(function(data) {
                // add 'url' to picture => need to know 'picture type'
                _addPictureUrlToList(data, pictureType);
                return data;
            });
    }

    function getHistoryPicture(historyId) {
        return Picture.find(historyId, {
            endpoint: ENDPOINT_NAME_HISTORY_PICTURES
        }).then(function(picture) {
            _addPictureUrlToItem(picture, TYPE_THUMBNAIL);
            return picture;
        });
    }

    // -------------------------------------------------------- Helper methods

    function _getPictures(noteId, offset, limit, pictureType, isDeleted) {
        return Picture
            .findAll({
                noteid: noteId,
                limit: limit || DEFAULT_LIMIT_PER_NOTE,
                offset: offset || 0,
                deleted: _.isBoolean(isDeleted) ? isDeleted : false
            }, {
                //endpoint: '/notes/' + noteId + '/pictures',
                bypassCache: true,
                cacheResponse: true
            })
            .then(function(data) {
                // add 'url' to picture => need to know 'picture type'
                _addPictureUrlToList(data, pictureType);
                // sort the array by picture 'order'
                data = _.sortBy(data, 'order');
                return data;
            });
    }

    function _getPicturesCount(noteId, isDeleted) {
        var endpoint = ENDPOINT_NAME_NOTE_PICTURES + '/count';

        return Picture
            .findAll({
                noteid: noteId,
                deleted: _.isBoolean(isDeleted) ? isDeleted : false
            }, {
                endpoint: endpoint,
                cacheResponse: false
            })
            .then(function(data) {
                return data.count;
            });
    }

    /**
     * Add 'url' property to all pictures in a list, with the 'endpoint' to the image
     * @param pictureList list of pictures
     * @param pictureType picture type (thumbnail, detail)
     * @private
     */
    function _addPictureUrlToList(pictureList, pictureType) {
        // add 'url' to picture => need to know 'picture type'
        pictureList.map(function(item) {
            _addPictureUrlToItem(item, pictureType);
        });
    }

    function _addPictureUrlToItem(item, pictureType) {
        // add 'url' to picture => need to know 'picture type'
        if (pictureType === TYPE_THUMBNAIL) {
            item.url = getThumbnailUrl(item.pictureId);
        } else {
            item.url = getPictureUrl(item.pictureId);
        }
    }

    // -------------------------------------------------------- Serialization / Deserialization

    function _serialize(data) {
        if (_.isObject(data)) {
            // Serialize properties before data item is returned
            helpers.removeProperty(data, 'editor');
        }
        return data;
    }

    function _deserialize(data) {
        if (_.isArray(data)) {
            // Apply deserialization on all items in the array
            data.map(function(item) { return _deserialize(item); });
        } else if (_.isObject(data)) {
            // Deserialize properties before data item is returned
            helpers.toDate(data, 'editedDate');
            helpers.toDate(data, 'referenceDate');
        }

        return data;
    }
}

export {
    dataServicePictures,
    run
}
