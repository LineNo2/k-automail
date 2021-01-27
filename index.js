var express = require('express')
var bodyParser = require('body-parser');
var app = express()
var fs = require('fs');
// var template = require('./lib/template.js');

let userList = fs.readFileSync('./db/soldier.json');

let originalList = JSON.parse(userList)

let soldierList = originalList;

let writeableSoldierList = Object.assign(soldierList);

app.use(express.static(__dirname + '/lib/web'));

app.use(bodyParser.urlencoded({ extended: false }));


app.get('/', function (request, response) {
    fs.readFile('./lib/web/html/main.html', 'utf8', function (err, html) {
        response.send(html);
    })
});

app.get('/register', function (request, response) {
    fs.readFile('./lib/web/html/register.html', 'utf8', function (err, html) {
        response.send(html);
    })
});

app.get('/img', function (request, response) {
    // console.log(html)
    response.send('<img src="/img/lol.png">');
});

app.get('/submit', function (req, res) {
    console.log(req.query);
})

app.post('/submit', function (req, res) {
    console.log(req.body);
    res.send('<script>alert("hi")</script>');

})

app.listen(5000, function () {
    console.log(__dirname + '/lib/web')
    console.log('Example app listening on port 5000!')
});
