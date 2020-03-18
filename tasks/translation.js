/*
 *
 * TRANSLATION TASKS
 *
 * Tasks which import or export translations
 *
 ********************************************************************************************************************
 */

var gulp = require('gulp');

/*
 * Write translations from JSON files to CSV files
 * @return
 */
gulp.task('translation:get', function () {
    getTranslation('accessLog');
    getTranslation('admin');
    getTranslation('appointment');
    getTranslation('blocks.contextbox');
    getTranslation('core');
    getTranslation('dashboard');
    getTranslation('error');
    getTranslation('guarantor');
    getTranslation('icdChop');
    getTranslation('imaging');
    getTranslation('invoice');
    getTranslation('layout');
    getTranslation('servicefee');
    getTranslation('patient');
    getTranslation('policy');
    getTranslation('search');
    getTranslation('settings');
    getTranslation('medlab');
    getTranslation('visit');
});

/*
 * Write translations from CSV files back to JSON files
 * @return {Stream}
 */
gulp.task('translation:set', function () {
    return setTranslation();
});

/*
 *
 ********************************************************************************************************************
 * END OF TRANSLATION TASKS
 *
 */

/*
 * Update the apps translation files
 * This function does not accept any arguments, the processed files get parsed from the translation directory
 * @return {Stream}
 */
function setTranslation() {
    var fs = require('fs');
    var beautify = require('js-beautify')['js_beautify'];
    var lodash = require('lodash');

    return fs.readdir('./translation', function (error, files) {
        if (error) {
            throw (error);
        }

        files.forEach(function (file) {
            var area = file.replace('.csv', '');

            // Handle area with point separators
            var folder = '';
            var arrayPart = area.split('.');
            if (arrayPart.length >= 1) {
                area = arrayPart.pop();
                arrayPart.forEach(function (element) {
                    folder = folder + element + '/';
                });
            }

            var inputEN = {};
            var inputDE = {};
            var inputFR = {};
            var inputIT = {};

            inputEN[area] = {};
            inputDE[area] = {};
            inputFR[area] = {};
            inputIT[area] = {};

            var data = fs.readFileSync('./translation/' + file, 'utf8');
            /*var lines = data.split(String.fromCharCode(13));*/
            /* This create error in displaying languages */
            var lines = data.split(/[\r\n]/);

            for (var line in lines) {
                if (lines[line] !== null && lines[line] !== undefined && lines[line] !== '') {
                    var parts = lines[line].split(';');

                    for (var i = 0; i < parts.length; i++) {
                        var key = parts[0];

                        inputEN[area][key] = parts[1];
                        inputDE[area][key] = parts[2];
                        inputFR[area][key] = parts[3];
                        inputIT[area][key] = parts[4];
                    }
                }
            }

            var pathEN = './src/client/app/' + folder + area + '/lang/' + area + '.lang.en.json';
            var originEN = fs.readFileSync(pathEN, 'utf8');
            var jsonEN = JSON.parse(originEN);
            lodash.extend(jsonEN, inputEN);

            var pathDE = './src/client/app/' + folder + area + '/lang/' + area + '.lang.de.json';
            var originDE = fs.readFileSync(pathDE, 'utf8');
            var jsonDE = JSON.parse(originDE);
            lodash.extend(jsonDE, inputDE);

            var pathFR = './src/client/app/' + folder + area + '/lang/' + area + '.lang.fr.json';
            var originFR = fs.readFileSync(pathFR, 'utf8');
            var jsonFR = JSON.parse(originFR);
            lodash.extend(jsonFR, inputFR);

            var pathIT = './src/client/app/' + folder + area + '/lang/' + area + '.lang.it.json';
            var originIT = fs.readFileSync(pathIT, 'utf8');
            var jsonIT = JSON.parse(originIT);
            lodash.extend(jsonIT, inputIT);

            fs.writeFile(
                './src/client/app/' + folder + area + '/lang/' + area + '.lang.en.json',
                beautify(JSON.stringify(jsonEN)) + '\n',
                'utf8');
            fs.writeFile(
                './src/client/app/' + folder + area + '/lang/' + area + '.lang.de.json',
                beautify(JSON.stringify(jsonDE)) + '\n',
                'utf8');
            fs.writeFile(
                './src/client/app/' + folder + area + '/lang/' + area + '.lang.fr.json',
                beautify(JSON.stringify(jsonFR)) + '\n',
                'utf8');
            fs.writeFile(
                './src/client/app/' + folder + area + '/lang/' + area + '.lang.it.json',
                beautify(JSON.stringify(jsonIT)) + '\n',
                'utf8');
        });
    });
}

/*
 * Export the apps translation files
 * @param {String} area Language area where of the language files should be exported from
 * @return {Stream}
 */
function getTranslation(area) {
    var fs = require('fs');
    var async = require('async');

    if (!fs.existsSync('./translation')) {
        fs.mkdirSync('./translation');
    }

    // Handle area with point separators
    var folder = '';
    var arrayPart = area.split('.');
    if (arrayPart.length >= 1) {
        area = arrayPart.pop();
        arrayPart.forEach(function (element) {
            folder = folder + element + '/';
        });
    }

    var keys = [];
    var de = [];
    var en = [];
    var fr = [];
    var it = [];

    var work = {
        file01: async.apply(fs.readFile, './src/client/app/' + folder + area + '/lang/' + area + '.lang.en.json', 'utf8'),
        file02: async.apply(fs.readFile, './src/client/app/' + folder + area + '/lang/' + area + '.lang.de.json', 'utf8'),
        file03: async.apply(fs.readFile, './src/client/app/' + folder + area + '/lang/' + area + '.lang.fr.json', 'utf8'),
        file04: async.apply(fs.readFile, './src/client/app/' + folder + area + '/lang/' + area + '.lang.it.json', 'utf8')
    };

    async.parallel(work, function (error, results) {
        if (error) {
            throw (error);
        }

        var items = JSON.parse(results['file01']);
        en = items[area];

        for (var index in items[area]) {
            if (items[area].hasOwnProperty(index)) {
                keys.push(index);
            }
        }

        items = JSON.parse(results['file02']);
        de = items[area];

        items = JSON.parse(results['file03']);
        fr = items[area];

        items = JSON.parse(results['file04']);
        it = items[area];
        /* Adding 'UTF8 BOM' (\uFEFF) at the top of the csv file force MS. EXCEL
            to open it in UTF8 format when we double click on it,
            otherwise the specials caraters don't be well displayed */
        /*var output = '\uFEFF';*/
        var output = '';

        for (var i = 0; i < keys.length; i++) {
            var enText = '';
            var deText = '';
            var frText = '';
            var itText = '';

            if (en[keys[i]] !== null && en[keys[i]] !== undefined) {
                enText = en[keys[i]];
            }

            if (de[keys[i]] !== null && de[keys[i]] !== undefined) {
                deText = de[keys[i]];
            }

            if (fr[keys[i]] !== null && fr[keys[i]] !== undefined) {
                frText = fr[keys[i]];
            }

            if (it[keys[i]] !== null && it[keys[i]] !== undefined) {
                itText = it[keys[i]];
            }

            output += keys[i] + ';' + enText + ';' + deText + ';' + frText + ';' + itText + String.fromCharCode(
                13);
        }

        fs.writeFile('./translation/' + folder.replace('/', '.') + area + '.csv', output, 'utf8');

        console.log('done: ' + area);
    });
}
