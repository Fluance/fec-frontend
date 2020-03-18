const gulp = require("gulp");
const gutil = require('gulp-util');
const plug = require('gulp-load-plugins')();

const log = plug.util.log;

// import tasks from 'build'
const {
    webpack:            build_webpack,
    buildCommon:        build_buildCommon,
    cleanupAndNotify:   build_cleanupAndNotify
} = require('./tasks/build');

// import tasks from 'run'
const {
    devServer:          run_devServer
} = require('./tasks/run');

/**
 * Upload (publish) FEC UI (FrontEnd) zip file to Artifactory
 * Load Artifactory configuration from config file.
 * Load version number from version.json file.
 * Get credentials and environment as parameters from npm.
 */
function uploadToArtifactoryTask(cb) {
    let artifactoryConfig = require('./deployments/artifactory/config.json'),
        versionJson = require('./version.json').versions[0],
        artifactName, artifactVersion, targetRepository,
        artifactType = 'zip',
        server = artifactoryConfig.server,
        groupId = artifactoryConfig.groupId,
        baseArtifactId = artifactoryConfig.artifactId,
        environment = process.env.npm_config_env,
        partner = process.env.npm_config_partner,
        artifactId = baseArtifactId + '-' + partner,
        username = process.env.npm_config_username,
        password = process.env.npm_config_password,
        artifactPostfix = process.env.npm_config_postfix;

    if (!environment || !partner || !username || !password) {
        log('Error on publishing: Must define "env", "partner", "username" and "password" parameters.');
        cb();
        return -1;
    }

    //overwrite artifactory url, optional
    if(process.env.npm_config_server) {
        server = process.env.npm_config_server;
    }

    artifactVersion = getArtifactVersion(environment, artifactoryConfig, versionJson, artifactPostfix);
    artifactName = getArtifactName(artifactId, artifactVersion, artifactType);
    targetRepository = getTargetRepository(environment, artifactoryConfig);

    createAndUploadArtifact(artifactName, server, targetRepository, groupId, artifactId, artifactVersion, username, password);

    cb();
}


/*
 *
 ********************************************************************************************************************
 * END OF MAIN TASKS
 *
 */

///////////////////////////////////////////////// HELPER FUNCTIONS /////////////////////////////////////////////////

// -----------------------------------------------------------------------------------------------------------------
//  Helper functions for task 'publish'
// -----------------------------------------------------------------------------------------------------------------
/**
 * Get target repository name in Artifactory
 * @param environment
 * @param artifactoryConfig
 * @returns {string}
 */
function getTargetRepository(environment, artifactoryConfig) {
    var repository;

    switch (environment) {
        case 'preprod':
        case 'prod':
            repository = artifactoryConfig.targetReleaseRepository;
            break;
        default:
            repository = artifactoryConfig.targetSnapshotRepository;
    }
    return repository;
}


/**
 * Build version of artifact
 * @param environment
 * @param artifactoryConfig
 * @param versionJson
 * @returns {string}
 */
function getArtifactVersion(environment, artifactoryConfig, versionJson, artifactPostfix) {
    var version, versionPostfix;

    if(artifactPostfix) {
        versionPostfix = artifactPostfix;
    }
    else {
        switch (environment) {
            case 'preprod':
                versionPostfix = artifactoryConfig.releaseCandidatePostfix;
                break;
            case 'prod':
                versionPostfix = artifactoryConfig.releasePostfix;
                break;
            default:
                versionPostfix = artifactoryConfig.snapshotPostfix;
        }
    }

    version = versionJson.major + '.' + versionJson.minor + '.' + versionJson.dot + '-' + versionPostfix;
    return version;
}

/**
 * Build name of artifact
 * @param artifactId
 * @param artifactVersion
 * @param extension
 * @returns {string}
 */
function getArtifactName(artifactId, artifactVersion, extension) {
    var artifactName = artifactId + '-' + artifactVersion + '.' + extension;
    return artifactName;
}

/**
 * Create artifact from 'build' contents and upload to Artifactory
 * @param artifactName name of file to upload to Artifactory (eg: fluance-cockpit-ui-fec-1.8.1-RELEASE.zip)
 * @param server URL of Artifactory server
 * @param targetRepository Artifactory repository (eg: internal-releases)
 * @param groupId UI (frontend) group id (eg: net.fluance.cockpit)
 * @param artifactId UI (frontend) artifact id (eg: fluance-cockpit-ui-fec)
 * @param version full version (eg: 1.8.1-RELEASE)
 * @param username user name (Artifactory credentials)
 * @param password user password (Artifactory credentials)
 * @returns {Stream}
 */
function createAndUploadArtifact(artifactName, server, targetRepository, groupId, artifactId, version, username, password) {
    var artifactoryUpload = require('gulp-artifactory-upload');
    var zip = require('gulp-zip');
    var baseUrl = server + '/' + targetRepository;
    var url = baseUrl + '/' + groupId.replace(/\./g, '/') + '/' + artifactId + '/' + version;

    log('Uploading ' + artifactName + ' to Artifactory: ' + url);

    return gulp
        .src('dist/**')
        .pipe(zip(artifactName))
        .pipe(artifactoryUpload(
            {
                url: url,
                username: username,
                password: password
            }
        ));
}


// -----------------------------------------------------------------------------------------------------------------
// Define complex tasks to export
// -----------------------------------------------------------------------------------------------------------------

const runTask = gulp.series(
    build_buildCommon,
    run_devServer
);

const buildTask = gulp.series(
    build_buildCommon,
    build_webpack,
    build_cleanupAndNotify
);


// export tasks
exports.default = buildTask;
exports.run = runTask;
exports.build = buildTask;
exports.uploadToArtifactory = uploadToArtifactoryTask;
exports.devServer = run_devServer;
