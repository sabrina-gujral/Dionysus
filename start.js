var express = require("express");
var app = express();
const spawn = require("child_process").spawn;

const pythonProcess = spawn("python", ["./recommender/recommend.py", 'Flipper (1996)']);

app.get("/", function (req, res) {

  pythonProcess.stdout.on("data", (data) => {
    console.log(data.toString());
    res.send(data.toString());
  });

  pythonProcess.stderr.on("data", (data) => {
    console.log(data.toString());
  });

  pythonProcess.on("exit", (code) => {
    console.log("Process quit with code : " + code);
  });
});

app.listen("3000", function () {
  console.log("listening on port 3000...");
});
