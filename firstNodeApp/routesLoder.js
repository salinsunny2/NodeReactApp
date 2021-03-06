var fs = require('fs');
var auth = require(global.appDir + '/lib/auth')();

var  authenticate = function(request, response, next) {
    if (auth.isAuthorized(request)) {
        next();
    } else {
        response.json({ error: true, msg: "Unauthorized access"});
    }
};

module.exports = function(app, http) {

    /* middleware to parse token */
    app.use(function(req,res,next){
        auth.parseRequestToken(req);
        next();
    });

    /* reading all modules folders */
    fs.readdirSync('./modules').forEach(function(module) {
        var controllerDir = './modules/' + module + '/controllers/';

        /* checking if controller folder exist in defined module or not */
        if (fs.existsSync(controllerDir)) {
            var models = require(global.appDir + '/modules/' + module + '/factory');

            /* including all controllers of all modules */
            fs.readdirSync(controllerDir).forEach(function(file) {

                /* include only js files */
                if (file.substr(-3) === '.js') {
                    route = require(controllerDir + file);
                    (typeof route.http != 'undefined') ? route.http = http: '';
                    route.controller(app, models, authenticate);
                }
            });

            console.log(module + ' loaded');
        }

        delete controllerDir; // removing unused variable
    });
};
