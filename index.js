var express = require('express')
var bodyParser = require('body-parser');
var app = express()
var fs = require('fs');

const airForceSchool = ['HR', 'K1', 'K2', 'JT', 'HJ', 'BP'];


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

app.get('/search', function (request, response) {
    fs.readFile('./lib/web/html/search.html', 'utf8', function (err, html) {
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

app.post('/submit', async function (req, res) {
    let ajaxResult = req.body;
    let body_HTML = '';
    let message = "결과가 저장되었습니다.";
    for (soldierName in writeableSoldierList) {
        if (soldierName === ajaxResult.soldierName) {
            if (writeableSoldierList[soldierName].birth === ajaxResult.soldierBirth && writeableSoldierList[soldierName].joinDate === ajaxResult.enterdate) {
                body_HTML += `<script>$("#submit-popup").attr("class","popup-box slideUp");$("#submit-popup-button").attr("onclick","location.href='/search?name=${ajaxResult.soldierName}&birth=${ajaxResult.soldierBirth}&enterdate=${ajaxResult.enterdate}'")</script>`;
                console.log(`<script>$("#submit-popup").attr("class","popup-box slideUp");$("#submit-popup-button").attr("onclick","location.href='/search?name=${ajaxResult.soldierName}&birth=${ajaxResult.soldierBirth}&enterdate=${ajaxResult.enterdate}'")</script>`)
                res.send(body_HTML);
                return;
                message = "저장된 훈련병 확인하기"
                console.log(writeableSoldierList)
            }
        }
    }
    switch (parseInt(ajaxResult.type)) {
        case 0:
            console.log("새로운 육군 " + ajaxResult.soldierName + "을 등록합니다.")
            writeableSoldierList[ajaxResult.soldierName] = {
                "type": "army",
                "birth": ajaxResult.soldierBirth,
                "joinTrainUnit": ajaxResult.training,
                "isRegistered": 0,
                "isEnrolled": 0,
                "joinDate": ajaxResult.enterdate,
                "option": {
                    "interested": ajaxResult.interested,
                    "maxMail": ajaxResult.maxMail,
                }
            }
            console.log(writeableSoldierList[ajaxResult.soldierName]);
            body_HTML += `console.log('<script>$("body").html('<div id="titleBlock"><h1 id="titleText" onclick="location.href=\\'/\\'">&gtK-AutoMail&lt</h1></div><div id="submit-popup"><h2 style="color:white;">${message}</h2><input type="button" class="darkButton customButton" style="margin-top:25%" value="조회하기" onclick="location.replace(\\'/search?name=${ajaxResult.soldierName}&birth=${ajaxResult.soldierBirth}&enterdate=${ajaxResult.enterdate}\\')"></div><div class="get-script"></div>')</script>')`;
            break;
        case 2:
            console.log("새로운 공군 " + ajaxResult.soldierName + "을 등록합니다.")
            writeableSoldierList[ajaxResult.soldierName] = {
                "type": "airforce",
                "birth": ajaxResult.soldierBirth,
                "school": airForceSchool[ajaxResult.training],
                "joinDate": ajaxResult.enterdate,
                "option": {
                    "interested": ajaxResult.interested,
                    "maxMail": ajaxResult.maxMail
                }
            }
            console.log(writeableSoldierList[ajaxResult.soldierName]);
            body_HTML += `console.log('<script>$("body").html('<div id="titleBlock"><h1 id="titleText" onclick="location.href=\\'/\\'">&gtK-AutoMail&lt</h1></div><div id="submit-popup"><h2 style="color:white;">${message}</h2><input type="button" class="darkButton customButton" style="margin-top:25%" value="조회하기" onclick="location.replace(\\'/search?name=${ajaxResult.soldierName}&birth=${ajaxResult.soldierBirth}&enterdate=${ajaxResult.enterdate}\\')"></div><div class="get-script"></div>')</script>')`;
            break;
        default:
            console.log('새로 등록할 훈련병이 없습니다.')
    }
    res.send(body_HTML);
})

app.listen(5000, function () {
    console.log(__dirname + '/lib/web')
    console.log('Example app listening on port 5000!')
});
