const { Darknet } = require("darknet");
const http = require('http');
var fs = require("fs");
var tmp = require("tmp");

// Init
const darknet = new Darknet({
  weights: "./yolov4-tiny-3l_best_2.weights",
  config: "./yolov4-tiny-3l.cfg",
  namefile: "./data/detector.names",
})

const hostname = '0.0.0.0';
const port = 3000;

const server = http.createServer((req, res) => {
  var rc_data='';
  res.setHeader("Access-Control-Allow-Origin", "*");

  req.on("data", chunk => {
    rc_data+=chunk;
    //console.log("Incoming Data...");
  });

  req.on("end", () => {
    //console.log("Data Arrived");
    var bd_box = null;

    tmp.file({postfix: ".jpg"}, function _tempFileCreated(err, path, fd, cleanupCallback) {
      if (err) throw err;

      var dataurl = JSON.parse(rc_data).data;
      var regex = /^data:.+\/(.+);base64,(.*)$/;
      var matches = dataurl.match(regex);

      var ext = matches[1];
      var data = matches[2];
      var buffer = Buffer.from(data, 'base64');

      fs.writeFile(path, buffer, function(){
        //console.log('File: ', path);
        //console.log('Filedescriptor: ', fd);

        bd_box = darknet.detect(path,{thresh:0.2})[0];
        if(bd_box==null){
          bd_box = {
            box: null
          };
        }
        console.log(bd_box);

        res.statusCode=200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(bd_box))
      });

    });
  });
  
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
