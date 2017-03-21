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

/*
var cmdVelTopic = new roslib.Topic({
    ros : rosServer,
    name : '/biba/cmd_vel',
    messageType : 'geometry_msgs/Twist'
});
*/

//created new topic in order to enable arbiter to set priorities

var backendTopic = new roslib.Topic({
    ros:rosServer,
    name: 'biba/backend',
    messageType: 'std_msgs/String' //temporary type, need to look into generating new message types
})

//scheduling helpers
function publishFunc(message,topic){topic.publish(message);}
var intervalMs = 200;
function clearExistingInterval(interval)
{
    if(typeof(interval)=='Timeout')
        clearInterval(interval)
}

//voice api endpoints


app.post("/sendLocation",function(req,res)
{
    console.log(res.body);
    //TODO: parse and publish message to ros topic
});

//robot api endpoints

app.get("/forward", function(req,res)
{
    clearExistingInterval(poller);
    var forward = new roslib.Message({
    linear : {
        x : 0.2,
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
    let poller = setInterval(publishFunc(forward,cmdVelTopic),intervalMs)
    res.send("moved forward!");
});

app.get("/back", function(req,res)
{
    clearExistingInterval(poller);
    var back = new roslib.Message({
    linear : {
        x : -0.2,
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
    let poller = setInterval(publishFunc(forward,cmdVelTopic),intervalMs)
    res.send("moved back!");
});

app.get("/right", function(req,res)
{
    clearExistingInterval(poller);
    var right = new roslib.Message({
    linear : {
        x : 0.0,
        y : 0.0,
        z : 0.0
    },
    angular : {
        x : 0.0,
        y : 0.0,
        z : 0.2
    }
    });
	cmdVelTopic.publish(right);
    let poller = setInterval(publishFunc(forward,cmdVelTopic),intervalMs)
    res.send("moved right!");
});

app.get("/left", function(req,res)
{
    clearExistingInterval(poller);
    var left = new roslib.Message({
    linear : {
        x : 0.0,
        y : 0.0,
        z : 0.0
    },
    angular : {
        x : 0.0,
        y : 0.0,
        z : 0.2
    }
    });
	cmdVelTopic.publish(left);
    let poller = setInterval(publishFunc(forward,cmdVelTopic),intervalMs)
    res.send("moved left!");
});

app.get("/stop", function(req,res)
{
    clearExistingInterval(poller);
    var stop = new roslib.Message({
    linear : {
        x : 0.0,
        y : 0.0,
        z : 0.0
    },
    angular : {
        x : 0.0,
        y : 0.0,
        z : 0.0
    }
    });
	cmdVelTopic.publish(stop);
    res.send("stopped!");
});