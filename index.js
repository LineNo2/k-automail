var express = require('express')
var bodyParser = require('body-parser');
var app = express()
var fs = require('fs');
const { EMSGSIZE } = require('constants');

const schoolArr = ['HR', 'K1', 'K2', 'JT', 'HJ', 'BP'];
const unitArr = ["0", "1", "2", "3", "5", "6", "7", "9", "11", "12", "15", "17", "20", "21", "22", "23", "25", "27", "28", "30", "31", "32", "35", "36", "37", "39", "50", "51", "53", "55"];
const modifiedErrArr =['이름','생일','입영일','훈련소','군','관심분야','편지장수','비밀번호']

// var template = require('./lib/template.js');

let userList = fs.readFileSync('./db/soldier.json');

let originalList = JSON.parse(userList)

let soldierList = originalList;

let writeableSoldierList = Object.assign(soldierList);

app.use(express.static(__dirname + '/lib/web'));

app.use(bodyParser.urlencoded({ extended: false }));

function dataValidation(ajaxResult) {
    let errCode = 0;
    if (!((ajaxResult.soldierName.match(/[가-힣]/gi) != null) && ajaxResult.soldierName.match(/[가-힣]/gi).length === ajaxResult.soldierName.length && ajaxResult.soldierName.length >= 2))
        errCode += 1;
    if (!(((ajaxResult.soldierBirth.match(/[0-9]/gi) != null) && ajaxResult.soldierBirth.match(/[0-9]/gi).length === ajaxResult.soldierBirth.length && ajaxResult.soldierBirth.length === 8)))
        errCode += 2;
    if (!((ajaxResult.enterdate.match(/[0-9]/gi) != null) && ajaxResult.enterdate.match(/[0-9]/gi).length === ajaxResult.enterdate.length && ajaxResult.enterdate.length === 8)) {
        let curdate = new Date();
        let dateStr = ajaxResult.enterdate.slice(0, 4) + '-' + ajaxResult.enterdate.slice(4, 6) + '-' + ajaxResult.enterdate.slice(6, 8);
        let enterdate = new Date(dateStr);
        let timedif = enterdate - curdate;
        let month = 2592000000;
        if (timedif <= month && month * (-1) <= timedif) {
            errCode += 4;
        }
    }
    switch (parseInt(ajaxResult.type)) {
        case 0:
            if (!(0 <= ajaxResult.training && ajaxResult.training <= unitArr.length)) {
                errCode += 8;
            }
            break;
        case 2:
            if (!(0 <= ajaxResult.training && ajaxResult.training <= schoolArr.length)) {
                errCode += 8;
            }
            break;
        default:
            errCode += 16;
    }
    if (!(1 <= ajaxResult.interested && ajaxResult.interested <= 16))
        errCode += 32;
    if (!(1 <= ajaxResult.maxMail && ajaxResult.maxMail <= 10))
        errCode += 64;
    if (!(ajaxResult.password < 4 || ajaxResult.password > 8))
        errCode += 128;
    return errCode;
}


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

app.get('/result', async function (request, response) {
    let message;
    fs.readFile('./lib/web/html/result.html', 'utf8', function (err, html) {
        response.send(html);
    })
    console.log(request.query['soldier-name']);
    console.log(request.query['soldier-birth']);
    console.log(request.query['enterdate']);
    if (writeableSoldierList[request.query['soldier-name']] === undefined) {
        message = '그런 이름의 훈련병은 없습니다.1'
    }
    else {
        if (writeableSoldierList[request.query['soldier-name']]['joinDate'] === request.query['enterdate'] && writeableSoldierList[request.query['soldier-name']]['birth'] === request.query['soldier-birth']) {
            message = '찾았습니다.'
        }
        else {
            message = '그런 이름의 훈련병은 없습니다.2'
        }
   }
   console.log(message  )
   console.log(originalList) 
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
                body_HTML += `<script>$('#popup-box-background').css('display','block');$("#submit-popup").attr("class","popup-box slideUp");$('#submit-popup-title-icon').attr('class','fas fa-exclamation-triangle');$('#submit-popup-title').html('이미 등록된 <br>훈련병입니다.');$("#submit-popup-button").val('확인');$("#submit-popup-button").attr("onclick","location.href='/result?soldier-name=${ajaxResult.soldierName}&soldier-birth=${ajaxResult.soldierBirth}&enterdate=${ajaxResult.enterdate}'");$('#submit-popup-button').attr('tabindex','0');</script>`;
                console.log(`${soldierName} 훈련병 중복 저장 방지.`)
                res.send(body_HTML);
                return;
            }
        }
    }   
    let dataValidCount = dataValidation(ajaxResult);
    if (dataValidCount) {
        console.log('전송된 데이터에 이상 발견 : ' + dataValidCount);
        body_HTML += `<script>$('#popup-box-background').css('display','block');$("#submit-popup").attr("class","popup-box slideUp");$('#submit-popup-title-icon').attr('class','fas fa-exclamation-triangle');$('#submit-popup-title').html('데이터 수정 금지 <br> :`;
        for(index in modifiedErrArr){
            body_HTML += (dataValidCount & Math.pow(2,index) ? ' ' + modifiedErrArr[index] : '' );
        }
        body_HTML += `');$("#submit-popup-button").val('다시하기');$("#submit-popup-button").attr("onclick","$('#submit-popup').attr('class','popup-box slideDown');$('#popup-box-background').css('display','none');setTimeout(() => {$('#submit-popup').attr('class','popup-box detailed-hidden');},800);");$('#submit-popup-button').attr('tabindex','0');</script>`;
        res.send(body_HTML);
        return;
    } else {
        switch (parseInt(ajaxResult.type)) {
            case 0:
                console.log("새로운 육군 " + ajaxResult.soldierName + "을 등록합니다.")
                writeableSoldierList[ajaxResult.soldierName] = {
                    "type": "army",
                    "birth": ajaxResult.soldierBirth,
                    "joinTrainUnit": parseInt(unitArr[ajaxResult.training]),
                    "isRegistered": 0,
                    "isEnrolled": 0,
                    "joinDate": ajaxResult.enterdate,
                    "option": {
                        "interested": parseInt(ajaxResult.interested),
                        "maxMail": parseInt(ajaxResult.maxMail),
                    },
                    "password": ajaxResult.password
                }
                console.log(writeableSoldierList[ajaxResult.soldierName]);
                // body_HTML += `<script>$("body").html('<div id="titleBlock"><h1 id="titleText" onclick="location.href=\\'/\\'">&gtK-AutoMail&lt</h1></div><div id="submit-popup"><h2 style="color:white;">${message}</h2><input type="button" class="darkButton customButton" style="margin-top:25%" value="조회하기" onclick="location.replace(\\'/search?name=${ajaxResult.soldierName}&birth=${ajaxResult.soldierBirth}&enterdate=${ajaxResult.enterdate}\\')"></div><div class="get-script"></div>')</script>`;
                body_HTML += `<script>$('#popup-box-background').css('display','block');$("#submit-popup").attr("class","popup-box slideUp");$('#submit-popup-title-icon').attr('class','fas fa-check ');$('#submit-popup-title').html('성공적으로 <br> 등록되었습니다.');$("#submit-popup-button").val('조회하기');$("#submit-popup-button").attr("onclick","location.href='/result?soldier-name=${ajaxResult.soldierName}&soldier-birth=${ajaxResult.soldierBirth}&enterdate=${ajaxResult.enterdate}'");$('#submit-popup-button').attr('tabindex','0');</script>`
                break;
            case 2:
                console.log("새로운 공군 " + ajaxResult.soldierName + "을 등록합니다.")
                writeableSoldierList[ajaxResult.soldierName] = {
                    "type": "airforce",
                    "birth": ajaxResult.soldierBirth,
                    "school": schoolArr[ajaxResult.training],
                    "joinDate": ajaxResult.enterdate,
                    "option": {
                        "interested": parseInt(ajaxResult.interested),
                        "maxMail": parseInt(ajaxResult.maxMail)
                    },
                    "password": ajaxResult.password
                }
                console.log(writeableSoldierList[ajaxResult.soldierName]);
                body_HTML += `<script>$('#popup-box-background').css('display','block');$("#submit-popup").attr("class","popup-box slideUp");$('#submit-popup-title-icon').attr('class','fas fa-check ');$('#submit-popup-title').html('성공적으로 <br> 등록되었습니다.');$("#submit-popup-button").val('조회하기');$("#submit-popup-button").attr("onclick","location.href='/result?soldier-name=${ajaxResult.soldierName}&soldier-birth=${ajaxResult.soldierBirth}&enterdate=${ajaxResult.enterdate}'");$('#submit-popup-button').attr('tabindex','0');</script>`;
                break;
            default:
                console.log('새로 등록할 훈련병이 없습니다.')
        }
        res.send(body_HTML);
    }
})

app.listen(5000, function () {
    console.log(__dirname + '/lib/web')
    console.log('Example app listening on port 5000!')
});
