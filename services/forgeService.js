
var ForgeSDK = require('./../library/index');
var blobService = require('./blobService');
var authService = require('./authService');
var uuidv1 = require('uuid/v1');
var fs = require('fs');

var forgeService = {
    toUnpaddedBase64: function (data) {
        var base64String = (new Buffer(data).toString('base64'));
        base64String = base64String.replace('=', '');
        base64String = base64String.replace('=', '');
        return base64String;
    },
    beginTranslate: function (objectId, onBeginTranslate) {
        var job = {
            input: {
                urn: objectId
            },
            output: {
                formats: [{
                    type: 'SVF',
                    views: ['2d', '3d']
                }]
            }
        };
        forgeService.config.derivativesApi.translate(
            job, {},
            forgeService.config.oAuth2TwoLegged,
            forgeService.config.oAuth2TwoLegged.getCredentials())
            .then(function (translateResponse) {
                onBeginTranslate(null, translateResponse);
            }, function (error) {
                onBeginTranslate(error);
            });
    },
    configureRoutes: function (app, router) {
        forgeService.config = {
            bucketsApi: new ForgeSDK.BucketsApi(),
            objectsApi: new ForgeSDK.ObjectsApi(),
            derivativesApi: new ForgeSDK.DerivativesApi(),
            oAuth2TwoLegged: new ForgeSDK.AuthClientTwoLegged(
                authService.getClientID(), authService.getClientSecret(),
                ['data:write', 'data:read', 'bucket:read', 'bucket:update', 'bucket:create'], true)
        };
        router.route('/forge/query')
            .get(forgeService.queryRequestHandler);
        router.route('/forge')
            .post(forgeService.translateRequestHandler);            
    },
    queryRequestHandler: function(req, res) {        
        forgeService.config.derivativesApi.getManifest(
            req.query.id, {},
            forgeService.config.oAuth2TwoLegged,
            forgeService.config.oAuth2TwoLegged.getCredentials())
            .then(function (manifestResponse) {                
                res.json(manifestResponse.body); 
            }, function (error) {
                console.error(error);
                res.status(500);
            });
    },
    translateRequestHandler: function (req, res) {
        blobService.downloadBlob(req.body.fileName, function (error, fileName, blobName) {
            var bucketKey = "moimbucket" + uuidv1().substr(0, 7);
            forgeService.config.oAuth2TwoLegged.authenticate()
                .then(function (credentials) {
                    forgeService.createBucketIfNotExist(bucketKey)
                        .then(function (resp) {

                            forgeService.uploadFile(bucketKey, fileName, blobName)
                                .then(function (upfileResponse) {
                                    var base64ObjectID =
                                        forgeService.toUnpaddedBase64(upfileResponse.body.objectId);
                                    forgeService.beginTranslate(base64ObjectID,
                                        function (translateError, translateResponse) {
                                            if (!translateError) {
                                                res.json(translateResponse.body);
                                            } else {
                                                console.error(translateError);
                                                res.status(500);
                                            }
                                        });
                                });

                        }, function (err) {
                            console.error(err);
                        });
                });
        });
    },
    uploadFile: function (bucketKey, filePath, fileName) {
        return new Promise(function (resolve, reject) {
            fs.readFile(filePath, function (err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    forgeService.config.objectsApi.uploadObject
                        (bucketKey, fileName, data.length, data, {},
                        forgeService.config.oAuth2TwoLegged,
                        forgeService.config.oAuth2TwoLegged.getCredentials())
                        .then(
                        function (res) {
                            fs.unlinkSync(filePath);
                            resolve(res);
                        }, function (err) {
                            fs.unlinkSync(filePath);
                            reject(err);
                        });
                }
            });
        });
    },
    createBucket: function (bucketKey) {
        var createBucketJson = { 'bucketKey': bucketKey, 'policyKey': 'temporary' };
        return forgeService.config.bucketsApi
            .createBucket(createBucketJson, {},
            forgeService.config.oAuth2TwoLegged,
            forgeService.config.oAuth2TwoLegged.getCredentials());
    },
    getBucketDetails: function (bucketKey) {
        return forgeService.config.bucketsApi
            .getBucketDetails(bucketKey,
            forgeService.config.oAuth2TwoLegged,
            forgeService.config.oAuth2TwoLegged.getCredentials());
    },
    createBucketIfNotExist: function (bucketKey) {
        return new Promise(function (resolve, reject) {
            forgeService.getBucketDetails(bucketKey).then(function (resp) {
                resolve(resp);
            },
                function (err) {
                    if (err.statusCode === 404) {
                        forgeService.createBucket(bucketKey).then(function (res) {
                            resolve(res);
                        },
                            function (err) {
                                reject(err);
                            })
                    }
                    else {
                        reject(err);
                    }
                });
        });
    }
};

module.exports = forgeService;

