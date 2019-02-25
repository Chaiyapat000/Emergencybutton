var mongojs = require("mongojs");
var buttondb = mongojs("buttonproject");

/* For UDP connection */
var dgram = require("dgram");
var server = dgram.createSocket("udp4");
var HOST = '0.0.0.0';
var PORT = 41235; // UDP opened port on GCP console.


//// When the socket is configured and ready to receive data, simply
// log a confirmation to the console.
server.on("error", function (err) {
    console.log("server error:\n" + err.stack);
    server.close();
});
server.on("message", function (msg, rinfo) {
    console.log("server got: " + msg + " from " + rinfo.address + ":" + rinfo.port);
    var strMessage_parse=JSON.parse(msg);
    var testbutton=buttondb.collection('AllstatusButton');
    testbutton.update(
        {ID:strMessage_parse.ID},
        { 
        $set:{ 
            data:strMessage_parse.data,
            time: new Date().toLocaleString()
        }
    },
    { upsert: true }, 
    function(err){
        if(err) console.log('record failed');
    });
    


    
    var ack = new Buffer("Hello ack");
    server.send(ack, 0, ack.length, rinfo.port, rinfo.address, function(err, bytes) {
      console.log("sent ACK.");
    }); 
});
server.on("listening", function () {
    var address = server.address();
    console.log("server listening " + address.address + ":" + address.port);
});


//open port
 server.bind(PORT);

// /* For RESTFUL API on mongoDB */
const express = require('express');
const app = express();
var port = 4000;


app.get('/', function (req, res) {
    res.send("my iot Protocol ready !");
});

//read data following device name
app.get('/read/:col', function (req, res) {

  var strCol = JSON.stringify(req.params);
  var strCol_parse = JSON.parse(strCol);

  db_udp_read = buttondb.collection(strCol_parse.col);

  db_udp_read.find({}).limit(1).sort({time:-1}, function(err, docs){
    if(err) return console.log('read failed');
    console.log(docs);
    res.send(docs);
  });
});

app.get('/read/:col/:datasize', function (req, res) {

    var strCol = JSON.stringify(req.params);
    var strCol_parse = JSON.parse(strCol);
  
    db_udp_read = buttondb.collection(strCol_parse.col);
    datasize = strCol_parse.datasize

    db_udp_read.find({}).limit(Number(datasize)).sort({time:-1}, function(err, docs){
      if(err) return console.log('read failed');
      console.log(docs);
      res.send(docs);
    });
  });

/*--------writesetstate---------------*/
app.get('/updatestatus/:col/:id/:data', function (req, res) {
    var strParseWriteReq = JSON.stringify(req.params);
    var strWriteReq = JSON.parse(strParseWriteReq);
    id=strWriteReq.id;
    data = strWriteReq.data;
    col=strWriteReq.col;
    // writedata(id,data,col, res);
    var mywritecollection = buttondb.collection(col);
    mywritecollection.update(
        {
            ID:id
        },
        {
            $set:
            {
                data:data
            }
        }, 
        function(err){
            if(err){
                console.log(err);
                res.send(String(err));
            }else {
                console.log('Status is reset'+id);
                res.send('Status is reset'+'//'+id+'//'+data);
      }
    });

  });



/////////////////////insert//////////////////////////////////////////

app.get('/insertstatus/:col/:id/:data', function (req, res) {
  var strParseWriteReq = JSON.stringify(req.params);
  var strWriteReq = JSON.parse(strParseWriteReq);
  id=strWriteReq.id;
  data = strWriteReq.data;
  col=strWriteReq.col;
  var insertNewrecord = buttondb.collection(col);
  insertNewrecord.insert({
      ID:id,
      data:data,
      time: new Date().toLocaleString()
    }, function(err){
      if(err) {console.log('record failed');}
      else {
        console.log('Status is insert'+id);
        res.send('Status is insert'+'//'+id+'//'+data);
        }
    });

});






app.listen(port, function () {
  var nodeStartTime = new Date();
  console.log('Establish API for mongoDB access : ' + port + ' at ' + nodeStartTime);
});