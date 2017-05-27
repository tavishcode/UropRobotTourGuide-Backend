var roslib = require('roslib');
var express = require('express');
var app = express();
var spawn = require("child_process").spawn;
var parser = require('body-parser');

//TODO: 
//1. array of structs with room num and prof names
//2. action client for sending move base messages (try 3 first)
//3. geometry msgs pose stamped, find message format

/// when the user wants the robot
//  true or false

app.use(parser.urlencoded({extended: true}));
app.use(parser.json());

//creating server on localhost port

var port = (process.env.PORT||8000);
app.listen(port);
console.log('Listening on local host port: ' + port);

//connecting to ros server

var rosServer = new roslib.Ros({
    url : 'ws://10.89.8.2:9090'
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
    name : '/biba/cmd_vel',
    messageType : 'geometry_msgs/Twist'
});


//created new topic in order to enable arbiter to set priorities

var backendTopic = new roslib.Topic({
    ros:rosServer,
    name: '/biba/backend',
    messageType: 'geometry_msgs/Twist' //temporary type, need to look into generating new message types
})

var destinationTopic= new roslib.Topic({
    ros:rosServer,
    name: '/move_base_simple/goal',
    messageType: 'geometry_msgs/PoseStamped'
})

var goalTopic= new roslib.Topic({
    ros:rosServer,
    name: '/move_base_simple/goal',
    messageType: 'geometry_msgs/PoseStamped'
})

var poseMessage= "not initialized";
var batteryLevel= "not initialized";
var intervalMs = 5000;

var poseTopic = new roslib.Topic({
    ros : rosServer,
    name : '/coordinate',
    messageType : 'geometry_msgs/Pose2D'
});

var batteryTopic= new roslib.Topic({
    ros: rosServer,
    name: '/battery_chatter',
    messageType: 'std_msgs/String'
})
/*var poseTopic = new roslib.Topic({
    ros : rosServer,
    name : '/turtle1/pose',
    messageType : 'turtlesim/Pose'
});*/

//scheduling helpers

function publishFunc(message,topic){topic.publish(message);}

function clearExistingInterval(interval)
{
    if(typeof(interval)=='Timeout')
        clearInterval(interval)
}

//listeners

function listenToPose()
{
    poseTopic.subscribe(function(message)
    {
        poseMessage= message;
        console.log(message);
        poseTopic.unsubscribe();
    });
}

let poseListenerPoller= setInterval(listenToPose,3000);

function listenToBatteryChatter()
{
    batteryTopic.subscribe(function(message)
    {
        batteryLevel= message;
        console.log(message);
        batteryTopic.unsubscribe();
    });
}

let batteryListenerPoller= setInterval(listenToBatteryChatter,3000);

//
app.get("/", function(req,res)
{
    console.log("Server is running!");
});
//

//edwin's requests

app.post("/goDirection", function(req,res)
{
    console.log("received go direction msg /n"+ JSON.stringify(req.body));
    var msg= new roslib.Message({
    header:
    {
        stamp:Date.now(),
        frame_id:"map"
    },
    pose: 
    {
        position: 
        {
            x:req.body.x,
            y:req.body.y,
            z:0.0
        },
        orientation:
        {
            w:0.0
        }
    }
    });
    goalTopic.publish(msg);
    res.send("successful req from go direction!");
});

app.get("/battery", function(req, res)
{
    console.log("received request for battery status");
    res.send(batteryLevel);
});
//////////////////////////////////////

//post requests

app.post("/sendLocation", function(req,res)
{
    console.log(JSON.stringify(req.body));
    //running python code

    var uint8arrayToString = function(data){
        return String.fromCharCode.apply(null, data);
    };

    var process = spawn('python',['/home/tavish/Desktop/helloWorld.py']);

    process.stdin.write(JSON.stringify(req.body));
    process.stdin.end();

    process.stdout.on('data', function (data){
        console.log(uint8arrayToString(data));
    });

    //

    /*var msg= new roslib.Message({
    header:
    {
        stamp:Date.now(),
        frame_id:"biba_base"
    },
    pose: 
    {
        position: 
        {
            x:1.0,
            y:0.0,
            z:0.0
        },
        orientation:
        {
            w:1.0
        }
    }
    });
    goalTopic.publish(msg);*/
    var msg= new roslib.Message({
    header:
    {
        stamp:Date.now(),
        frame_id:"map"
    },
    pose: 
    {
        position: 
        {
            x:1.0,
            y:0.0,
            z:0.0
        },
        orientation:
        {
            w:1.0
        }
    }
    });
    goalTopic.publish(msg);
    res.send("location sent!")
});

//get requests

app.get("/coordinates",function(req,res)
{
    console.log("sending coordinates");
    console.log(poseMessage);
    res.send(poseMessage);
});

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
    destinationTopic.publish()
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