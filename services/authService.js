var ForgeSDK = require('./../library/index');

var authService = {    
    getClientID: function() {
        return '';
    },
    getClientSecret: function() {
        return ''
    },
    
    configureRoutes: function(app, router) {
        router.route('/forge/token')
            .get(function (req, res) {
                authService.getAccessTokenWithView()
                    .then(function(credentials) {
                        res.send(credentials.access_token);
                    }, function(err) {
                        console.error(err);
                    });
            });             
    },
    getAccessTokenWithView: function() {
        var clientID = authService.getClientID();
        var secret = authService.getClientSecret();
        var authRefresh = true;

        var oAuth2TwoLegged = new ForgeSDK.AuthClientTwoLegged(
            clientID, secret,            
            ['data:read'], 
            authRefresh);
        return oAuth2TwoLegged.authenticate()
    },
    getAccessToken: function() {
        var clientID = authService.getClientID();
        var secret = authService.getClientSecret();
        var authRefresh = true;

        var oAuth2TwoLegged = new ForgeSDK.AuthClientTwoLegged(
            clientID, secret,
            ['data:write', 'data:read', 'bucket:read','bucket:update','bucket:create'], 
            authRefresh);
        return oAuth2TwoLegged.authenticate()
    }
};

module.exports = authService;

