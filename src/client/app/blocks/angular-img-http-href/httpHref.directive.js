(function() {
    'use strict';

    angular.module('blocks.httpHref', [])
        .directive('httpHref', ['$http', function($http) {
            return {
                link: function($scope, elem, attrs) {
                    $scope.$watch('objectURL', function(objectURL) {
                        elem.attr('download', elem.attr('http-href-filename'));
                    });

                    attrs.$observe('httpHref', function(url) {
                        if (url && url.indexOf('data:') === 0) {
                            $scope.objectURL = url;
                        } else if (url) {
                            $http.get(url, { responseType: 'arraybuffer' })
                                .then(function(response) {
                                    var contentType = response.headers('Content-Type');
                                    if (contentType === 'text/calendar;charset=UTF-8') {
                                        contentType = 'text/calendar';
                                    } else if (contentType === 'text/vcard;charset=UTF-8') {
                                        contentType = 'text/x-vcard';
                                    }
                                    var blob = new Blob(
                                        [response.data], { type: contentType }
                                    );

                                    var reader = new FileReader();
                                    reader.readAsDataURL(blob);
                                    reader.onload = function(e){
                                        elem.attr('href', reader.result);
                                    }
                                });
                        }
                    });
                }
            };
        }]);
}());