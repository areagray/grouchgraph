var express = require('express');
var http = require('http');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fb = require('fbgraph');
//var Promise = require('node-promise');


var routes = require('./routes');
var users = require('./routes/user');
var conf = require('./file.js');
var AlchemyAPI = require('alchemy-api');
var alchemy = new AlchemyAPI(conf.ALCH1);





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

    fb.setAccessToken(conf.FB1);
    
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

    fb.setAccessToken(conf.FB1);
    
    var Promise = require("node-promise").Promise;

    // var testP = function (){
    //     var p = new Promise;
    //     console.log('in test P');
    //     p.resolve('hey');
    //     return p;
    // };

    var recentContacts = {};
    var statusesArray = [];
    var alchemyArray =[];



    var getContacts = function(){
        var p = new Promise;

        fb.get("me/posts", function(err, results) {
            //get my recent contacts
            var data = results.data;
            //console.log('data length is ', data.length);
            for(var i = 0; i < 10; i++){
                var obj = data[i]['story_tags'];
                for (var key in obj){
                    for (var j = 0; j<obj[key].length; j++){
                        //console.log('hey ' + obj[key][j]['id'] + ' ' + obj[key][j]['name']);
                        recentContacts[obj[key][j]['id']] = '';
                    }
                }  
            }
            p.resolve();         
        });

        return p;
    };

    getStatuses = function (){
        var p = new Promise;
        var allFunc = require("node-promise").all;


        for (var contact in recentContacts){

            //throttle
            promiseArray.push(getStatus(contact));

        }

        //console.log('bad loop');
        return allFunc(promiseArray);
    };

    var getStatus = function(contact){

        var p = new Promise;

        fb.get(contact + "/statuses", function(err, results) { 
            var data = results.data;
            for(var i = 0; i < data.length; i++){
                recentContacts[contact] = recentContacts[contact] + ' ' + data[i]['message'];
            } 
            if (recentContacts[contact].length === 0){
                delete recentContacts[contact];
            }
            p.resolve(); 

        });

        return p;

    };


    getAllScores = function(){
        var p = new Promise;
        var allFunc = require("node-promise").all;

        for (var contact in recentContacts){


            promiseArray.push(getAlchemyScore(contact, recentContacts[contact]));

        }

        //console.log('bad loop');
        return allFunc(promiseArray);
    };


    getAlchemyScore = function(contact, text){
        var p = new Promise;
        //console.log('in getAlchemyScore');
        //console.log('this is passed in -->', text);

        //console.log('text is ', text);

        alchemy.sentiment(text, {}, function(err, response) {
            if (err) throw err;
            // See http://www.alchemyapi.com/api/ for format of returned object
            var sentiment = response.docSentiment;
            //console.log('sentiment analysis for user 147911588 is ', sentiment);
            recentContacts[contact] = sentiment;
            p.resolve();
        });

        return p;
    };   
    
    // getStatuses(1339502399).then(getAlchemyScore).then(function(result){
    //     console.log('result from stats/alchemy is: --> ', result);
    // });

    getContacts().then(getStatuses).then(getAllScores).then(function(){
        console.log('all scores ?', recentContacts);

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