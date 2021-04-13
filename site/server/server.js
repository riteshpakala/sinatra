var fs = require('fs');
var path = require('path');
var express = require('express');
var cors = require('cors');
const fetch = require('node-fetch');
var bodyParser = require('body-parser');
var axios = require("axios").default;

var forceSsl = function (req, res, next) {
   if (req.headers['x-forwarded-proto'] !== 'https') {
       return res.redirect(['https://', req.get('Host'), req.url].join(''));
   }
   return next();
};

app = express();
// app.use(cors({origin: '*'}));

app.use('/', express.static(__dirname));

app.set('port', (process.env.PORT || 8080));

app.use(express.static("dist"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/api/david/v0.00.00/stock/history/:id", function(req, res) {
    let stock = req.params.id;

    let todaysDate = new Date();
    let last30Days = new Date();
    last30Days.setDate(todaysDate.getDate()-240);

    
    let tDate_Epoch = (Math.floor((todaysDate.getTime()-last30Days.getMilliseconds())/1000)).toString();
    let l30Date_Epoch = (Math.floor((last30Days.getTime()-last30Days.getMilliseconds())/1000)).toString();

    let fullURL = "https://query1.finance.yahoo.com/v8/finance/chart/"+stock+"?period1="+l30Date_Epoch+"&period2="+tDate_Epoch+"&region=US&lang=en-US&includePrePost=true&interval=1d&corsDomain=finance.yahoo.com&.tsrc=finance";
    fetch(fullURL)
      .then(res => { return res; } )
      .then(data => {
        return data.json();
      }).then(json => {
        res.send(json);
      });
});

app.post("/api/david/v0.00.00/stock/think", function(req, res) {
  fetch("http://localhost:7070/think/generate", {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
      },
        body: JSON.stringify({ 'data' : req.body })
      })
      .then(res => {
          return res.json();
      }).then(json => {
          console.log(json);
          return res.send(json);
      });
});

app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname, '../dist/index.html'), function(err) {
    if (err) {
      res.status(500).send(err)
    }
  })
});

app.listen(app.get('port'), function () {
console.log(`port: ${app.get('port')}`)
})
