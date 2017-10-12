
var app = {
    showMessage: function(message) {
        $('#viewerContainer').html('<span>'+message+'</span>');
    },
    prepareApp: function() {
        app.showMessage('Please select a documment (on the left) to view.');
        var template = Handlebars.compile($("#filelist-template").html());
        $.ajax({
            type: "GET",
            url: "/bim/api/blobs",    
            cache: false,
            success: function(data){
                for(var x = 0; x< data.length; ++ x) {
                    data[x].displayName = data[x].name; //data[x].name.substr(0, 10);
                }
                $('#filelistdiv').append(template({ files: data }));    
                $('#filelistdiv span.clickable').click(function(e) 
                { 
                    app.translateDocument($(this).attr("datafile"));
                });
            }
          });
    },
    translateDocument: function(blobName) {        
        app.showMessage('Preparing the document. Please wait..')
        $.ajax({
            type: 'POST',
            url: '/bim/api/forge',
            data: JSON.stringify ({fileName: blobName}),
            success: function(data) {
                app.trackProgress(data.urn, function(urn) {
                    var frameSrc = '/bim/pages/view.html?id=' + urn;
                    console.log(frameSrc);
                    $('#viewerContainer').html('<iframe style="width:100%;height:100%;" src="'+frameSrc+'"></iframe>');
                });
            },
            contentType: "application/json",
            dataType: 'json'
        });
    },
    trackProgress: function(urn, onCompleted) {        
        var qFunc = function() {
            $.ajax({
                type: "GET",
                url: "/bim/api/forge/query?id=" + urn,    
                cache: false,
                success: function(data) {                    
                    if(data.progress === 'complete') {                        
                        onCompleted(urn);
                    } else {
                        app.showMessage('Reading document - ' + data.progress + ' Please wait..')                        
                        setTimeout(qFunc, 500);
                    }
                }
              });
        }
        qFunc();
    }
};

$( document ).ready(app.prepareApp);



