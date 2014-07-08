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

app.get('/grouchgraph', function (req,res){
    //console.log('trying to redirect');
    res.redirect('grouchgraph.html');
});

app.get('/friends', function(req, res) {

    fb.setAccessToken(conf.FB1);

    var contact = '1527021971';

    fb.get(contact + "/picture?redirect=0&type=normal", function(err, results) { 
    var data = results.data;    

    console.log('picture results ',data.url);    
    });

res.send('thanks');

});

app.get('/posts', function(req, res) {

    var recentContacts = {};
    var promiseArray = [];

    fb.setAccessToken(conf.FB1);
    
    var Promise = require("node-promise").Promise;

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

                        var userId = obj[key][j]['id'];
                        console.log('user id', userId);
                        recentContacts[userId] = {};
                        recentContacts[userId]['name']=obj[key][j]['name'];
                        recentContacts[userId]['fbId']=userId;
                        recentContacts[userId]['text']='';

                    }
                }  
            }
            p.resolve();         
        });

        return p;
    };

    getInfos = function (){
        var p = new Promise;
        var allFunc = require("node-promise").all;


        for (var contact in recentContacts){

            //throttle
            promiseArray.push(getInfo(contact));

        }

        //console.log('bad loop');
        return allFunc(promiseArray);
    };

    var getInfo = function(contact){

        var p = new Promise;

        fb.get(contact + "/statuses", function(err, results) { 
            var data = results.data;
            person = recentContacts[contact];
            for(var i = 0; i < data.length; i++){
                person['text'] = person['text'] + ' ' + data[i]['message'];
            } 
            person['text'].length
            if (person['text'].length === 0){
                console.log('DELETING USER');
                delete person;
            }

            fb.get(contact + "/picture?redirect=0&type=normal", function(err, results) { 
                var data = results.data;  
                recentContacts[contact]['photoUrl'] = data.url;   
                p.resolve(); 
            });

            
        });

        return p;

    };


    getAllScores = function(){
        var p = new Promise;
        var allFunc = require("node-promise").all;

        for (var contact in recentContacts){


            promiseArray.push(getAlchemyScore(contact, recentContacts[contact]['text']));

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

            if (sentiment === undefined){
                //handle case when sentiment comes back empty
                //this is caused by no statuses coming back above and shoule be fixed there
                //aJay is example
                delete recentContacts[contact];
            } else {
                recentContacts[contact]['alchemyRating'] = sentiment;
                delete recentContacts[contact]['text'];
            }
            p.resolve();
        });

        return p;
    };   

    getContacts().then(getInfos).then(getAllScores).then(function(){
        console.log('all scores ?', recentContacts);
        var responseArray = [];

        for (var key in recentContacts){
            responseArray.push(recentContacts[key]);
        }

     res.send(responseArray);

    });


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

