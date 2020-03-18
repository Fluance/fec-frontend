/* jshint -W117, -W030 */
describe('dataservice.notes', function() {

    var DSNotes = null;
    var DS = null;



    beforeEach(function() {
        module('app');
    });

    // beforeEach(function() {
    //     module('js-data-mocks');
    // });

    beforeEach(function() {
        inject(['dataservice.notes', 'DS', function(_DSNotes_, _DS_) {
            DSNotes = _DSNotes_;
            DS = _DS_;
        }]);
    });

    it('should have Notes factory', function() {
        expect(angular.isObject(DSNotes)).toBe(true);
    });

    // it('should load notes', function(done) {
    //     console.info('________________________________________________________ DSNotes=' + DSNotes);

    //     DSNotes.getNotes(1).then(function(notes) {
    //         console.info('_____ ' + notes);
    //         expect(angular.isArray(notes)).toBe(true);
    //         done();
    //     });
    // });

    // it('should load a single note', function(done) {
    //     console.info('________________________________________________________ DSNotes=' + DSNotes);

    //     DSNotes.getNote(1).then(function(note) {
    //         console.info('_____ ' + note);
    //         expect(angular.isObject(note)).toBe(true);
    //         done();
    //     });
    // });
});
