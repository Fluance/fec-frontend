/* jshint -W117, -W030 */
describe('core.Promise', function() {
    var service;
    var timeout;
    var q;

    beforeEach(function() {
        inject(['$timeout', '$q',
            function($timeout, $q) {
                timeout = $timeout;
                q = $q;
            }
        ]);
    });

    it('should return a result', function(done) {
        var promise = test();
        promise.then(function(result) {}).finally(done);
        timeout.flush();
    });

    function test() {
        var deferred = q.defer();
        deferred.resolve('Test to test testing framework!');
        return deferred.promise;
    }
});
