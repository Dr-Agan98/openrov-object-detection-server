const { Darknet } = require("darknet");
const http = require('http');
var fs = require("fs");
var tmp = require("tmp");

tmp.setGracefulCleanup();

// Init
const darknet = new Darknet({
  weights: "./yolov3.weights",
  config: "./yolov3.cfg",
  namefile: "./data/coco.names",
})

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
  var rc_data='';
  res.setHeader("Access-Control-Allow-Origin", "*");

  req.on("data", chunk => {
    rc_data+=chunk;
    console.log("Incoming Data...");
  });

  req.on("end", () => {
    console.log("Data Arrived");

    let tmp_file  = tmp.fileSync({postfix: ".png"});
    var dataurl = JSON.parse(rc_data).data;
    var regex = /^data:.+\/(.+);base64,(.*)$/;
    var matches = dataurl.match(regex);

    var ext = matches[1];
    var data = matches[2];
    var buffer = Buffer.from(data, 'base64');
    fs.writeFileSync(tmp_file.name, buffer);

    console.log('File: ', tmp_file.name);
    console.log('Filedescriptor: ', tmp_file.fd);

    let bd_box = darknet.detect(tmp_file.name)[0];
    console.log(bd_box);

    res.statusCode=200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(bd_box))
  });
  
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
