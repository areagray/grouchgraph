var express = require('express');
var http = require('http');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fb = require('fbgraph');
//var Promise = require('node-promise');
var AlchemyAPI = require('alchemy-api');
var alchemy = new AlchemyAPI('619057c60e3644e539c76e9c90afbaab49eee781');
//var fbGetAsync = Promise.promisify(fb.get);

var routes = require('./routes');
var users = require('./routes/user');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

app.get('/', routes.index);
app.get('/users', users.list);

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});
//angular code

app.get('/ang', function(req, res) {
res.redirect('./bin/index');

});





//fb code:

app.get('/friends', function(req, res) {

    fb.setAccessToken('CAAKMrAl97iIBAIaPZB9KyWQFjp8GMpZAw87LZBDc7EflL3jeJUE3dbC6yowirFO3fjSgqOOwasbR7neClIEiZCXlGUMmRoAvz7UM5uSbiJRR73CbYDQMo4AGWV9S4gbWvSIr9IBKVXUgqYgEYuIACyEbHS5MpIFMVfA1ZC2jxI8OPOC4F2O3tQ4ZCue3I2wsrmcImibmgl2DmTa9K2C5f5');
    

    fbGetAsync('2503283').then(function(data){
        console.log('in then ', data['first_name']);
        res.send('then');
        return fbGetAsync('1147911588');
    }).then(function(data){
        console.log('in second then hey ', data['first_name']);
    });

});

app.get('/posts', function(req, res) {

    var recentContacts = {};
    var promiseArray = [];

    fb.setAccessToken('CAAKMrAl97iIBAIaPZB9KyWQFjp8GMpZAw87LZBDc7EflL3jeJUE3dbC6yowirFO3fjSgqOOwasbR7neClIEiZCXlGUMmRoAvz7UM5uSbiJRR73CbYDQMo4AGWV9S4gbWvSIr9IBKVXUgqYgEYuIACyEbHS5MpIFMVfA1ZC2jxI8OPOC4F2O3tQ4ZCue3I2wsrmcImibmgl2DmTa9K2C5f5');
    
    // var Promise = require("node-promise").Promise;
    // var getRecents = new Promise();

    var testFunc = function(message){
        console.log('message is ', message);
        return message;

    };

    var testFuncAsync = function(opts){
        var defer = require("node-promise").defer;
        var deferred = defer();
        testFunc(opts, deferred.resolve);
        return deferred.promise;
    };


    testFuncAsync('hello').then(function(res){

        console.log('made it through');
    });



    // asyncOperation(function(){
    // Promise.resolve("succesful result");
    // });
    // promise -> given to the consumer

    res.send('hey');

});




// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;

/*ASYNC CODE
fbGetAsync("me/friends").then(function(data){
        console.log('it thened');
        res.send('hey');
        return 'again';
    }).then(function(message){
        console.log(message);
    })




*/


/* CODE FOR GRABBING MESSAGES

    //generate a promise for a list of recent contacts
        var p = new Promise(function(resolve, reject){
            fb.get("me/posts", function(err, results) {
                //get my recent contacts
                var data = results.data;
                for(var i = 0; i < data.length; i++){
                    var obj = data[i]['story_tags'];
                    for (var key in obj){
                        for (var j = 0; j<obj[key].length; j++){
                            //console.log('hey ' + obj[key][j]['id'] + ' ' + obj[key][j]['name']);
                            recentContacts[obj[key][j]['id']] = true;
                        }
                    }
                    if (i === data.length -1){
                        console.log('resolving get Ids');
                        resolve();
                    }    
                }         
            });
    });

    var getStatuses = function(id){
        fb.get(id + "/statuses", function(err, results) {
            return results;
        });
    };

    p().then(function(){

         for (var contact in recentContacts){
             promiseArray.push( getStatuses(contact).then( function (results){
                //concat and add
                var data = results.data;

                for(var i = 0; i < data.length; i++){
                    recentContacts[contact] = recentContacts[contact] + ' ' + data[i]['message'];
                }  
             }));
         }

        Promise.join.apply(null, promiseArray.then(function(){
            console.log('done ', recentContacts);
        }));

    });

    */