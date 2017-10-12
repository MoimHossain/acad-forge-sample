var azure = require('azure-storage');
var fs = require('fs');
var uuidv1 = require('uuid/v1');

var blobService = {
    getContainerName: function() {
        return "acad-files";
    },
    getAccountName: function() {
        return ""; // process.env.STACC_NAME
    },
    getAccountKey: function() {
        // process.env.STACC_KEY
        return "";
    },
    getConnectionString: function() {        
        return ('DefaultEndpointsProtocol=https;AccountName=' + blobService.getAccountName() + ';AccountKey=' + blobService.getAccountKey() + ';EndpointSuffix=core.windows.net');
    },
    configureRoutes: function(app, router) {
        router.route('/blobs/')
        .get(function (req, res) {
            blobService.getFiles(function(blobs){
                res.json(blobs);
            });            
        });
        
        blobService.serviceCore = azure.createBlobService(blobService.getAccountName(), blobService.getAccountKey());
        blobService.serviceCore.createContainerIfNotExists(blobService.getContainerName(), 
            function (error, result, response) {
                if (!error) {
                    console.log('Container instantiated successfully. ' + (result.created === true ? 'Container created' : 'Container Exists'));
                } else {
                    console.log(error);
                }
        });                
    },
    downloadBlob: function(blobName, afterDownload) {
        var containerName = blobService.getContainerName();
        var fileName = uuidv1();

        blobService.serviceCore.getBlobToStream(containerName, blobName, 
            fs.createWriteStream(fileName), function(error, result, response) {
                afterDownload(error, fileName, blobName);
          });
    },
    getFiles: function(onGet) {
        var containerName = blobService.getContainerName();
        blobService.serviceCore.listBlobsSegmented(containerName, null, function(err, result) {
            if (err) {                
                console.error(err);
                onGet([]);
            } else {                
                var blobs = [];
                result.entries.forEach(function(blob) {                    
                    blobs.push({
                        name: blob.name,
                        lastModified: blob.lastModified
                    });
                }, this);
                onGet(blobs);
            }
        });
        
    }    
};

module.exports = blobService;

