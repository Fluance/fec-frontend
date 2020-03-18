import dialogTemplate from './reportDialog.html';

/**
 * @ngdoc service
 * @name logger
 * @description
 *
 * Use this factory to display notification.
 *

    angular.module('myModule').controller('myController', controllerFct);
    controllerFct.$inject = ['logger'];
    function controllerFct(logger) {
        logger.info(message, title);
        logger.warning(message, title);
        logger.success(message, title);
        logger.error(message, exception, title);
    }

 */

logger.$inject = ['$log', 'toastr', 'config', '$injector'];

function logger($log, toastr, config, $injector) {

    var history = [];

    var service = {
        error: error,
        info: info,
        success: success,
        warning: warning,
        sendReport: sendReport,
        // straight to console; bypass toastr
        log: $log.log,
        history: history,
        current: null,
        showReport: showReport
    };

    return service;

    /**
     * Open modal dialog with error report
     * @param id id in the error report history
     */
    function showReport(id) {
        service.current = history[id];

        var $mdDialog = $injector.get('$mdDialog');
        $mdDialog.show({
            templateUrl: dialogTemplate,
            controller: [DialogController],
            controllerAs: '$ctrl',
            clickOutsideToClose: true,
            escapeToClose: true
        });


        function DialogController() {
            var ctrl = this;

            // Events
            ctrl.close = close;

            ctrl.current = service.current;

            // ------------------------------------------------------------------------- Interface methods

            function close() {
                $mdDialog.cancel();
            }
        }
    }

    /**
     * @ngdoc method
     * @name logger#error
     * @param {String} message       Error message to display in popup
     * @param {Object} exception     Data to display.
     * @param {String} title         Notification title
     * @param {boolean} stay         Boolean wether the notification should stay or not until clicked
     * <div class='alert alert-warning' role='alert'>
     *     **Important** Should be as often as possible a JS error exception.
     *     See ErrorHandling for more details
     * </div>
     * @description
     * Display a red popup. If config.logSendReports is true, send log technical report to our log server.
     **/
    function error(message, exception, title, stay) {
        var $q = $injector.get('$q');
        var user = $injector.get('sessionService').user;
        var $translate = $injector.get('$translate');

        $q(function (resolve, reject) {
            var options = {};
            if (stay) {
                options = {
                    'closeButton': true,
                    'timeOut': 5000
                };
            }

            // Logg to graylog, then dispaly popup with report access
            sendReport(exception, message)
                .then(function (index) {
                    // If ok we display an error message
                    $translate('error.SEE_FULL_REPORT')
                        .then(function (text) {
                            var reportText = '';

                            if (index !== null && index !== undefined) {
                                reportText = '<br/><span class="toastr-subline">' + text + '</span>';
                                options.onclick = function () {
                                    showReport(index);
                                    $injector.get('$rootScope').$digest();
                                };
                            }

                            toastr.error(message + reportText, title, options);
                            resolve(index);
                        });
                });
        });
    }

    /**
     * @ngdoc method
     * @name logger#info
     * @param {String} message       Error message to display in popup
     * @param {String=} title        Notification title.
     * @description
     * Display a blue popup
     **/
    function info(message, title) {
        toastr.info(message, title);
        $log.info('Info: ' + message);
    }

    /**
     * @ngdoc method
     * @name logger#success
     * @param {String} message       Error message to display in popup
     * @param {String=} title        Notification title.
     * @description
     * Display a green popup
     **/
    function success(message, title) {
        toastr.success(message, title);
        $log.info('Success: ' + message);
    }

    /**
     * @ngdoc method
     * @name logger#warning
     * @param {String} message       Error message to display in popup
     * @param {String=} title        Notification title.
     * @param {boolean} stay         Boolean wether the notification should stay or not until clicked
     * @description
     * Display a orange popup
     **/
    function warning(message, title, stay) {
        if (stay) {
            toastr.warning(message, title, {
                'closeButton': true,
                'timeOut': '0',
            });
        } else {
            toastr.warning(message, title);
        }
        $log.warn('Warning: ' + message);
    }

    /**
     * @ngdoc method
     * @name logger#sendReport
     * @param {Object}  data         Data from error type
     * @param {String}  message      Description of error
     * @description
     * Send a JSON object only if config.logSendReports is true.
     *
        var msg = {
            'application_name': config['application_name'], // ID for STREAM
            'message': message,
            'dataMessage': data.message,
            'dataStack': data.stack,
            'dataStatus': data.status,
            'dataRequest': JSON.stringify(data.config),
            'userAgent': navigator.userAgent,
            'url': window.location.href,
            'urlBase': config.baseURL,
            'hostname': config.hostname,
            'version': config.version.full
        }
     *
     **/
    function sendReport(data, message) {
        var $q = $injector.get('$q');
        return $q(function (resolve, reject) {
            if (config.logSendReports) {
                if (!data) {
                    data = {};
                }

                var user = $injector.get('sessionService').user;

                var msg = {
                    'application_name': config['application_name'], // ID for STREAM
                    'message': message,
                    'dataMessage': data.message,
                    'dataStack': data.stack,
                    'dataStatus': data.status,
                    'dataStatusText': data.statusText,
                    'dataRequest': JSON.stringify(data.config),
                    'dataResponse': data.response,
                    'userAgent': navigator.userAgent,
                    'url': window.location.href,
                    'urlBase': config.baseURL,
                    'user': (user ? user.username : 'anonymous'),
                    'hostname': config.hostname,
                    'version': config.version.full
                };

                // integrate grayLog
                $.ajax({
                    url: config.logServerURL,
                    type: 'POST',
                    data: JSON.stringify(msg),
                    timeout: 1000
                })
                    .done(function (json) {
                        console.info('A report has been successfully submit.');
                        // log in console
                        // $log.error(msg);
                        try {
                            msg.date = moment().toDate().toLocaleString();
                        } catch (exception) {
                            msg.date = moment().toDate();
                        }
                        msg.saved = true;

                        var index = null;

                        // We display report if user is not logged in or sysadmin
                        if (!user || !user.id || user.hasRole('sysadmin')) {
                            history.push(msg);
                            index = history.length - 1;
                        }

                        resolve(index);
                    })
                    .fail(function (jqXHR, textStatus, errorThrown) {
                        console.error('Failure during report submission.');
                        msg.date = moment().toDate();
                        msg.saved = false;

                        var index = null;

                        // We display report if user is not logged in or sysadmin
                        if (!user || !user.id || user.hasRole('sysadmin')) {
                            history.push(msg);
                            index = history.length - 1;
                        }
                        resolve(index);
                    });
            } else {
                resolve();
            }
        });
    }
}


export default logger;
