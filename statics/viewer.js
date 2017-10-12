
var autoDeskForge = {
    onLoadModelError: function (viewerErrorCode) {
        console.error('onLoadModelError() - errorCode:' + viewerErrorCode);
    },
    onLoadModelSuccess: function (model) {
        console.log('onLoadModelSuccess()!');
        console.log('Validate model loaded: ' + (autoDeskForge.viewer.model === model));
        console.log(model);
    },
    onDocumentLoadFailure: function (viewerErrorCode) {
        console.error('onDocumentLoadFailure() - errorCode:' + viewerErrorCode);
    },
    onDocumentLoadSuccess: function (doc) {
        // A document contains references to 3D and 2D viewables.
        var viewables = Autodesk.Viewing.Document.getSubItemsWithProperties(doc.getRootItem(), { 'type': 'geometry' }, true);
        if (viewables.length === 0) {
            console.error('Document contains no viewables.');
            return;
        }

        // Choose any of the avialble viewables
        var initialViewable = viewables[0];
        var svfUrl = doc.getViewablePath(initialViewable);
        var modelOptions = {
            sharedPropertyDbPath: doc.getPropertyDbPath()
        };

        var viewerDiv = document.getElementById(autoDeskForge.divID);
        autoDeskForge.viewer = new Autodesk.Viewing.Private.GuiViewer3D(viewerDiv);     
        autoDeskForge.viewer.start(
            svfUrl, modelOptions,
            autoDeskForge.onLoadModelSuccess,
            autoDeskForge.onLoadModelError);
    },
    renderModel: function (documentURN, divID) {
        autoDeskForge.divID = divID;        
        var documentId = 'urn:' + documentURN;

        var options = {
            env: 'AutodeskProduction',
            getAccessToken: function (onGetAccessToken) {

                $.ajax({
                    type: 'GET',
                    url: "/bim/api/forge/token",
                    complete: function (r) {

                        var accessToken = r.responseText;
                        var expireTimeSeconds = 86400;
                        onGetAccessToken(accessToken, expireTimeSeconds);
                    }
                });
            }
            /*accessToken: '<YOUR_APPLICATION_TOKEN>'*/
        };
        Autodesk.Viewing.Initializer(options, function onInitialized() {
            Autodesk.Viewing.Document.load(
                documentId,
                autoDeskForge.onDocumentLoadSuccess,
                autoDeskForge.onDocumentLoadFailure);
        });
    },
    getUrlVars: function()
    {
        var vars = [], hash;
        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        for(var i = 0; i < hashes.length; i++)
        {
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }
        return vars;
    },
    getID: function() {
        return autoDeskForge.getUrlVars()["id"];
    },
    prepare: function() {
        var id = autoDeskForge.getID();
        if(id) {
         autoDeskForge.renderModel(id, 'forgeViewer');
        }
    }
};

$( document ).ready(autoDeskForge.prepare);
