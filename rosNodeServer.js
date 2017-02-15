var roslib = require('roslib');
var express = require('express');
var app = express();
var parser = require('body-parser');

app.use(parser.urlencoded({extended: true}));
app.use(parser.json());

//creating server on localhost port

var port = 8000;
app.listen(port);
console.log('Listening on local host port: ' + port);

//connecting to ros server

var rosServer = new roslib.Ros({
    url : 'ws://localhost:9090'
  });

  rosServer.on('connection', function() {
    console.log('Connected to websocket server.');
  });

  rosServer.on('error', function(error) {
    console.log('Error connecting to websocket server: ', error);
  });

  rosServer.on('close', function() {
    console.log('Connection to websocket server closed.');
  });

var cmdVelTopic = new roslib.Topic({
    ros : rosServer,
    name : '/turtle1/cmd_vel',
    messageType : 'geometry_msgs/Twist'
});

var messageToSend;

cmdVelTopic.subscribe(function(message)
{	
    messageToSend=message.data;
});

//api endpoints

app.get("/forward", function(req,res)
{
    var forward = new roslib.Message({
    linear : {
        x : 2.0,
        y : 0.0,
        z : 0.0
    },
    angular : {
        x : 0.0,
        y : 0.0,
        z : 0.0
    }
    });
	cmdVelTopic.publish(forward);
	res.send("moved forward, subscriber sent "+messageToSend);
});

app.get("/back", function(req,res)
{
    var back = new roslib.Message({
    linear : {
        x : -2.0,
        y : 0.0,
        z : 0.0
    },
    angular : {
        x : 0.0,
        y : 0.0,
        z : 0.0
    }
    });
	cmdVelTopic.publish(back);
	res.send("moved back, subscriber sent "+messageToSend);
});

app.get("/right", function(req,res)
{
    var right = new roslib.Message({
    linear : {
        x : 0.0,
        y : -2.0,
        z : 0.0
    },
    angular : {
        x : 0.0,
        y : 0.0,
        z : 0.0
    }
    });
	cmdVelTopic.publish(right);
	res.send("moved right, subscriber sent "+messageToSend);
});

app.get("/left", function(req,res)
{
    var left = new roslib.Message({
    linear : {
        x : 0.0,
        y : 2.0,
        z : 0.0
    },
    angular : {
        x : 0.0,
        y : 0.0,
        z : 0.0
    }
    });
	cmdVelTopic.publish(left);
	res.send("moved left, subscriber sent "+messageToSend);
});
