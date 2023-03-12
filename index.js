require('newrelic');

var express = require('express')
var bodyParser = require('body-parser');
var app = express()
var fs = require('fs');

const { admin_id, admin_pw } = require('./db/admin-account.json');

var util = require('util');
var logFile = fs.createWriteStream('log.txt', { flags: 'w' });
var logStdout = process.stdout;

console.log = function () {
    var curTime = new Date();
    logFile.write(`[${curTime.getMonth()}/${curTime.getDate()} ${curTime.getHours()}:${curTime.getMinutes()}:${curTime.getSeconds()}] ` + util.format.apply(null, arguments) + '\n');
    logStdout.write(`[${curTime.getMonth()}/${curTime.getDate()} ${curTime.getHours()}:${curTime.getMinutes()}:${curTime.getSeconds()}] ` + util.format.apply(null, arguments) + '\n');
}
console.error = console.log;

const sendMail = require('./main.js');

const schoolArr = ['HR', 'K1', 'K2', 'JT', 'HJ', 'BP'];
const unitArr = ["0", "1", "2", "3", "5", "6", "7", "9", "11", "12", "15", "17", "20", "21", "22", "23", "25", "27", "28", "30", "31", "32", "35", "36", "37", "39", "50", "51", "53", "55"];
const modifiedErrArr = ['이름', '생일', '입영일', '훈련소', '군', '관심분야', '편지장수', '비밀번호']
const unitArrValue = ['육군훈련소-논산', '1사단-파주', '2사단-양구', '3사단-철원', '5사단-연천', '6사단-철원', '7사단-화천', '9사단-고양', '11사단-홍천', '12사단-인제', '15사단-화천', '17사단-인천', '20사단-양평', '21사단-양구', '22사단-고성', '23사단-삼척', '25사단-양주', '27사단-화천', '28사단-파주', '30사단-고양', '31사단-광주', '32사단-세종', '35사단-임실', '36사단-원주', '37사단-증평', '39사단-함안', '50사단-대구', '51사단-화성', '53사단-부산', '55사단-용인']
const schoolArrValue = { 'HR': '기본군사훈련단', 'K1': '군수1학교', 'K2': '군수2학교', 'JT': '정보통신학교', 'HJ': '행정학교', 'BP': '방공포병학교' }
// let schoolArr = ['없음', '군수1학교', '군수2학교', '정보통신학교', '행정학교', '방공포병학교'];

let userList = fs.readFileSync('./db/soldier.json');

let originalList = JSON.parse(userList)

let writeableSoldierList = originalList['writeable'];
let unwriteableSoldierList = originalList['unwriteable'];

let preventDuplicateRunFlag = 0;
let mailWriterRunTime;
let mailWriteTimer;

async function saveJSON(filename) {
    filename = `./db/${filename}.json`
    console.log('saving to ' + filename)
    fs.writeFileSync(filename, JSON.stringify(originalList), 'utf8');
}

async function backupJSON(filename) {
    let currentTime = new Date();
    saveJSON(`${filename}-backup-${currentTime.getDate()}`)
}

async function updateDate() {
    let currentTime = new Date();
    let timeZone = currentTime.getTimezoneOffset();
    let checker = 0;
    let week = 604800000;
    currentTime.setHours(currentTime.getHours() + (timeZone + 540) / 60); // 미국 타임존 기준 우리나라 시간 구함.

    console.log('====updateDate 실행====')
    await saveJSON(`soldier-backup-${currentTime.getDate()}`)
    console.log(`====soldier-backup-${currentTime.getDate()}에 현재정보 저장====`)
    for (soldierName in writeableSoldierList) {
        let joinDate = writeableSoldierList[soldierName]['joinDate'];
        if (currentTime > new Date(writeableSoldierList[soldierName]['option']['WPM'])) {
            console.log(soldierName + ' 훈련병의 메일 작성 가능 시간이 만료되었습니다.')
            unwriteableSoldierList[soldierName] = Object.assign(writeableSoldierList[soldierName]);
            console.log(delete writeableSoldierList[soldierName])
            checker = 1;
            continue;
        }
    }
    for (soldierName in unwriteableSoldierList) {
        let joinDate = unwriteableSoldierList[soldierName]['joinDate'];
        joinDate = new Date(`${joinDate.slice(0, 4)}-${joinDate.slice(4, 6)}-${joinDate.slice(6, 8)}`).getTime();
        if (currentTime.getTime() > (8 * week + joinDate)) {//8주 경과 -> 제거
            console.log(soldierName + ' 훈련병을 입영일 8주 경과 관계로 DB에서 제거합니다. ')
            delete unwriteableSoldierList[soldierName]
            checker = 1;
        }
        else {
            if (unwriteableSoldierList[soldierName]['type'] === 'army') {
                if (currentTime.getTime() > (1.5 * week + joinDate)) {//육군 1.5주 경과 -> writeable로 옮김
                    writeableSoldierList[soldierName] = Object.assign(unwriteableSoldierList[soldierName]);
                    delete unwriteableSoldierList[soldierName]
                    console.log(soldierName + ' 훈련병을 writeable로 옮겼습니다.')
                    checker = 1;
                }
            } else if (unwriteableSoldierList[soldierName]['type'] === 'airforce') {
                if (currentTime.getTime() > (2 * week + joinDate)) {//공군 2주 경과 -> writeable로 옮김
                    writeableSoldierList[soldierName] = Object.assign(unwriteableSoldierList[soldierName]);
                    delete unwriteableSoldierList[soldierName]
                    console.log(soldierName + ' 훈련병을 writeable로 옮겼습니다.')
                    checker = 1;
                }
            }
        }
    }
    if (checker) {
        await saveJSON(`soldier`)
        console.log(`====soldier.json 에 현재정보 저장====`)
    }
    console.log('====updateDate 종료====')
    return;
}

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
        let month = 2*2592000000;
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
    if (ajaxResult.password.length < 4 || ajaxResult.password.length > 8)
        errCode += 128;
    return errCode;
}

async function adminPagePrint() {
    let html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>KOM - Admin Page</title>
        <style>
        table, th, td {
            border: 1px solid black;
            border-collapse: collapse;
          }
          </style>
    </head>
    <body>
    <h1>관리자페이지</h1>
    <table style="text-align: center;">
        <tr>
            <th>이름</th>
            <th>타입</th>
            <th>훈련소</th>
            <th>생일</th>
            <th>입영일</th>
            <th>구독</th>
            <td>시사</td>
            <td>롤</td>
            <td>야구</td>
            <td>축구</td>
            <th>일일 메일</th>
            <th>총 메일</th>
            <th>수정</th>
            <th>삭제</th>
        </tr>`
    for (soldierName in writeableSoldierList) {
        let type = writeableSoldierList[soldierName]['type']
        let unit = (type === "army" ? writeableSoldierList[soldierName]['joinTrainUnit'] : writeableSoldierList[soldierName]['school'])
        html += `
        <tr>
            <td>${soldierName}</td>
            <td>${type}</td>
            <td>${unit}</td>
            <td>${writeableSoldierList[soldierName]['birth']}</td>
            <td>${writeableSoldierList[soldierName]['joinDate']}</td>
            <th>${writeableSoldierList[soldierName]['option']['interested']}</th>
            <td>${writeableSoldierList[soldierName]['option']['interested'] & 4 ? 1 : 0}</td>
            <td>${writeableSoldierList[soldierName]['option']['interested'] & 8 ? 1 : 0}</td>
            <td>${writeableSoldierList[soldierName]['option']['interested'] & 2 ? 1 : 0}</td>
            <td>${writeableSoldierList[soldierName]['option']['interested'] & 1 ? 1 : 0}</td>
            <td>${writeableSoldierList[soldierName]['option']['maxMail']}</td>
            <td>${writeableSoldierList[soldierName]['sentMail']}</td>
            <form action="/edit" method="post">
                <input type="hidden" name="soldier-name" value="${soldierName}">
                <input type="hidden" name="soldier-birth" value="${writeableSoldierList[soldierName]['birth']}">
                <input type="hidden" name="enterdate" value="${writeableSoldierList[soldierName]['joinDate']}">
                <input type="hidden" name="password_" value="${writeableSoldierList[soldierName]['password']}">
                <td><input type="submit" value="수정"></td>
            </form>
            <form action="/delete" method="post">
                <input type="hidden" name="soldier-name" value="${soldierName}">
                <input type="hidden" name="soldier-birth" value="${writeableSoldierList[soldierName]['birth']}">
                <input type="hidden" name="enterdate" value="${writeableSoldierList[soldierName]['joinDate']}">
                <input type="hidden" name="password" value="${writeableSoldierList[soldierName]['password']}">
                <td><input type="submit" value="삭제"></td>
            </form>
        </tr>`
    }
    for (soldierName in unwriteableSoldierList) {
        let type = unwriteableSoldierList[soldierName]['type']
        let unit = (type === "army" ? unwriteableSoldierList[soldierName]['joinTrainUnit'] : unwriteableSoldierList[soldierName]['school'])
        html += `
        <tr>
            <td>${soldierName}</td>
            <td>${type}</td>
            <td>${unit}</td>
            <td>${unwriteableSoldierList[soldierName]['birth']}</td>
            <td>${unwriteableSoldierList[soldierName]['joinDate']}</td>
            <th>${unwriteableSoldierList[soldierName]['option']['interested']}</th>
            <td>${unwriteableSoldierList[soldierName]['option']['interested'] & 4 ? 1 : 0}</td>
            <td>${unwriteableSoldierList[soldierName]['option']['interested'] & 8 ? 1 : 0}</td>
            <td>${unwriteableSoldierList[soldierName]['option']['interested'] & 2 ? 1 : 0}</td>
            <td>${unwriteableSoldierList[soldierName]['option']['interested'] & 1 ? 1 : 0}</td>
            <td>${unwriteableSoldierList[soldierName]['option']['maxMail']}</td>
            <td>${unwriteableSoldierList[soldierName]['sentMail']}</td>
            <form action="/edit" method="post">
                <input type="hidden" name="soldier-name" value="${soldierName}">
                <input type="hidden" name="soldier-birth" value="${unwriteableSoldierList[soldierName]['birth']}">
                <input type="hidden" name="enterdate" value="${unwriteableSoldierList[soldierName]['joinDate']}">
                <input type="hidden" name="password_" value="${unwriteableSoldierList[soldierName]['password']}">
                <td><input type="submit" value="수정"></td>
            </form>
            <form action="/delete" method="post">
                <input type="hidden" name="soldier-name" value="${soldierName}">
                <input type="hidden" name="soldier-birth" value="${unwriteableSoldierList[soldierName]['birth']}">
                <input type="hidden" name="enterdate" value="${unwriteableSoldierList[soldierName]['joinDate']}">
                <input type="hidden" name="password" value="${unwriteableSoldierList[soldierName]['password']}">
                <td><input type="submit" value="삭제"></td>
            </form>
        </tr>`
    }

    html += ` 
   <a href="/admin?run=1"><button>시작</button></a>
   <a href="/admin?run=0"><button>정지</button></a>
   <h2>인편 작동중 확인</h2>
   <h3>${preventDuplicateRunFlag ? "작동중<h3>작동 시간: " + mailWriterRunTime + "</h3>" : "정지중"}</h3>
   <textarea rows="10" cols="200" style="overflow:auto" readonly>
   ${fs.readFileSync('log.txt', 'utf8')}</textarea>
   </body></html>`
    return html;
}

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

app.get('/result', async function (request, response) {
    let message;
    let error_msg = '';
    let error_title = '';

    let soldierName = request.query['soldier-name'];
    let soldierBirth = request.query['soldier-birth'];
    let enterDate = request.query['enterdate'];

    let pos_flag = -1;

    console.log(soldierName + ' 훈련병 조회');
    if (writeableSoldierList[soldierName] === undefined) {
        soldierArray = unwriteableSoldierList[soldierName];
        pos_flag = 1;
    }
    else {
        soldierArray = writeableSoldierList[soldierName];
        pos_flag = 0;
    }

    if (soldierArray === undefined) {
        message = `${soldierName} 훈련병은 등록되지 않았습니다.`;
        error_title = `${soldierName} 훈련병은 등록되지 않았습니다.`;
    }
    else {
        if (soldierArray['joinDate'] === enterDate && soldierArray['birth'] === soldierBirth) {
            message = '찾았습니다.'
            let type = soldierArray['type'];
            let trainingUnit = type === "army" ? soldierArray['joinTrainUnit'] : soldierArray['school'];
            let interested = soldierArray['option']['interested'];
            let maxMail = soldierArray['option']['maxMail']
            let sentMail = soldierArray['sentMail'];
            // console.log(type === "army" ? unitArrValue[unitArr.indexOf(trainingUnit)] : schoolArrValue[trainingUnit])
            html = fs.readFileSync('./lib/web/html/result.html', 'utf8');
            html = eval('`' + html + '`');
            response.send(html);
            return;
        }
        else {
            message = `${soldierName} 훈련병의 생년월일 및 입대일이 정확하지 않습니다.`
            error_title = `${soldierName} 훈련병의 생년월일 및 입대일이 정확하지 않습니다.`
            error_msg = `입력 | 생년월일 : ${soldierBirth} | 입대일 : ${enterDate}`
        }
    }
    html = fs.readFileSync('./lib/web/html/error.html', 'utf8');
    html = eval('`' + html + '`');
    response.send(html);
    console.log(message)
});

app.post('/delete', async function (request, response) {
    let ajaxResult = request.body;
    let flag = -1;
    let pos_flag = -1;
    if (writeableSoldierList[ajaxResult['soldier-name']] === undefined) {
        soldierArray = unwriteableSoldierList[ajaxResult['soldier-name']];
        pos_flag = 1;
    }
    else {
        soldierArray = writeableSoldierList[ajaxResult['soldier-name']];
        pos_flag = 0;
    }

    console.log(`${ajaxResult['soldier-name']} 삭제 요청`)

    if (soldierArray === undefined) {
        flag = -1;
        message = '그런 이름의 훈련병은 없습니다.'
    }
    else {
        if (soldierArray['joinDate'] === ajaxResult['enterdate'] && soldierArray['birth'] === ajaxResult['soldier-birth']) {
            if (soldierArray['password'] === ajaxResult['password']) {
                flag = 1;
            }
            else {
                flag = 0;
            }
        }
        else {
            message = '그런 이름의 훈련병은 없습니다.';
            flag = -1;
        }
    }
    switch (flag) {
        case -1:
            script = `<script>
            $('#popup-box-background').css('display','block');
            $("#submit-popup").attr("class","popup-box slideUp");
            $('#submit-popup-title-icon').attr('class','fas fa-exclamation-triangle');
            $('#submit-popup-title').html('${ajaxResult['soldier-name']} 훈련병은 <br>등록되지 않습니다.');
            $("#submit-popup-button").val('확인');
            $("#submit-popup-button").attr("onclick","location.href='/'");
            $('#submit-popup-button').attr('tabindex','0');
            </script>`
            message = ajaxResult['soldier-name'] + ' 훈련병 등록되지 않음'
            break;
        case 0:
            script = `<script>
            $('#popup-box-background').css('display','block');
            $("#submit-popup").attr("class","popup-box slideUp");
            $('#submit-popup-title-icon').attr('class','fas fa-exclamation-triangle');
            $('#submit-popup-title').html('비밀번호가 <br>다릅니다.');
            $("#submit-popup-button").val('확인');
            $("#submit-popup-button").attr("onclick","popup_down();");
            $('#submit-popup-button').attr('tabindex','0');
            </script>`
            message = ajaxResult['soldier-name'] + ' 훈련병 비밀번호 오류'
            break;
        case 1:
            script = `<script>
            $('#popup-box-background').css('display','block');
            $("#submit-popup").attr("class","popup-box slideUp");
            $('#submit-popup-title-icon').attr('class','fas fa-check');
            $('#submit-popup-title').html('성공적으로 <br>삭제했습니다.');
            $("#submit-popup-button").val('확인');
            $("#submit-popup-button").attr("onclick","location.href='/'");
            $('#submit-popup-button').attr('tabindex','0');
            </script>`
            backupJSON('soldier');
            (pos_flag === 0 ? delete writeableSoldierList[ajaxResult['soldier-name']] : delete unwriteableSoldierList[ajaxResult['soldier-name']]);
            message = ajaxResult['soldier-name'] + ' 훈련병 삭제 완료'
            saveJSON('soldier');
            break;
        default:
            break;
    }
    response.send(script);
    console.log(message)
});

app.post('/edit', async function (request, response) {
    let message;

    let ajaxResult = request.body;

    let soldierName = ajaxResult['soldier-name'];
    let soldierBirth = ajaxResult['soldier-birth'];
    let enterDate = ajaxResult['enterdate'];
    let password = ajaxResult['password_'];

    let error_title = '';
    let error_msg = '';

    console.log(`${ajaxResult['soldier-name']} 수정 요청`)

    let pos_flag = -1;
    if (writeableSoldierList[soldierName] === undefined) {
        soldierArray = unwriteableSoldierList[soldierName];
        pos_flag = 1;
    }
    else {
        soldierArray = writeableSoldierList[soldierName];
        pos_flag = 0;
    }

    if (soldierArray['joinDate'] === enterDate && soldierArray['birth'] === soldierBirth) {
        if (password === soldierArray['password']) {
            message = '찾았습니다.'
            let type = soldierArray['type'];
            let trainingUnit = type === "army" ? unitArrValue[unitArr.indexOf(soldierArray['joinTrainUnit'])] : schoolArrValue[(soldierArray['school'])];
            let interested = soldierArray['option']['interested'];
            let maxMail = soldierArray['option']['maxMail'];
            let interestedStack = '';
            let onloadScript = ``;

            onloadScript += (interested & Math.pow(2, 2) ? `$('.logo-box')[${0}].click();` : "");
            onloadScript += (interested & Math.pow(2, 3) ? `$('.logo-box')[${1}].click();` : "");
            onloadScript += (interested & Math.pow(2, 1) ? `$('.logo-box')[${2}].click();` : "");
            onloadScript += (interested & Math.pow(2, 0) ? `$('.logo-box')[${3}].click();` : "");
            console.log(trainingUnit)
            for (let i = 0; i < maxMail; i++) {
                onloadScript += 'control_count(1);';
            }
            onloadScript += (type === "army" ? `$('.logo-box')[4].click();set_detailed(0,'${trainingUnit}');` : `$('.logo-box')[6].click();set_detailed(1,'${trainingUnit}');`)
            onloadScript += `for(let i=4;i<8;i++){$('.logo-box')[i].setAttribute('onclick','')}`
            html = fs.readFileSync('./lib/web/html/edit.html', 'utf8');
            html = eval('`' + html + '`');
            response.send(html);
            return;
        }
        else {
            message = `${soldierName} 훈련병의 비밀번호가 일치하지 않습니다.`
            error_title = `${soldierName} 훈련병의 비밀번호가 일치하지 않습니다.`
        }
    }
    else {
        message = `${soldierName} 훈련병의 생년월일 및 입대일이 정확하지 않습니다.`
        error_title = `${soldierName} 훈련병의 생년월일 및 입대일이 정확하지 않습니다.`
        error_msg = `입력 | 생년월일 : ${soldierBirth} | 입대일 : ${enterDate}`
    }

    html = fs.readFileSync('./lib/web/html/error.html', 'utf8');
    html = eval('`' + html + '`');
    response.send(html);
    console.log(message)
});

app.post('/submit', async function (req, res) {
    let ajaxResult = req.body;
    let body_HTML = '';
    let message = "결과가 저장되었습니다.";
    let pos_flag = -1;
    if (writeableSoldierList[ajaxResult.soldierName] === undefined) {
        soldierArray = unwriteableSoldierList[ajaxResult.soldierName];
        pos_flag = 1;
    }
    else {
        soldierArray = writeableSoldierList[ajaxResult.soldierName];
        pos_flag = 0;
    }
    switch (parseInt(ajaxResult['submit-type'])) {
        case 0:
            if (!(soldierArray === undefined)) {
                if (soldierArray['joinDate'] === ajaxResult.enterdate && soldierArray['birth'] === ajaxResult.soldierBirth) {
                    body_HTML += `<script>$('#popup-box-background').css('display','block');$("#submit-popup").attr("class","popup-box slideUp");$('#submit-popup-title-icon').attr('class','fas fa-exclamation-triangle');$('#submit-popup-title').html('이미 등록된 <br>훈련병입니다.');$("#submit-popup-button").val('확인');$("#submit-popup-button").attr("onclick","location.href='/result?soldier-name=${ajaxResult.soldierName}&soldier-birth=${ajaxResult.soldierBirth}&enterdate=${ajaxResult.enterdate}'");$('#submit-popup-button').attr('tabindex','0');</script>`;
                    console.log(`${ajaxResult.soldierName} 훈련병 중복 저장 방지.`)
                    res.send(body_HTML);
                    return;
                }
            }

            let dataValidCount = dataValidation(ajaxResult);
            if (dataValidCount) {
                console.log('전송된 데이터에 이상 발견 : ' + dataValidCount);
                body_HTML += `<script>$('#popup-box-background').css('display','block');$("#submit-popup").attr("class","popup-box slideUp");$('#submit-popup-title-icon').attr('class','fas fa-exclamation-triangle');$('#submit-popup-title').html('데이터 수정 금지 <br> :`;
                for (index in modifiedErrArr) {
                    body_HTML += (dataValidCount & Math.pow(2, index) ? ' ' + modifiedErrArr[index] : '');
                }
                body_HTML += `');$("#submit-popup-button").val('다시하기');$("#submit-popup-button").attr("onclick","$('#submit-popup').attr('class','popup-box slideDown');$('#popup-box-background').css('display','none');setTimeout(() => {$('#submit-popup').attr('class','popup-box detailed-hidden');},800);");$('#submit-popup-button').attr('tabindex','0');</script>`;
                res.send(body_HTML);
                return;
            } else {
                switch (parseInt(ajaxResult.type)) {
                    case 0:
                        console.log("새로운 육군 " + ajaxResult.soldierName + "을 등록합니다.")
                        unwriteableSoldierList[ajaxResult.soldierName] = {
                            "type": "army",
                            "birth": ajaxResult.soldierBirth,
                            "joinTrainUnit": unitArr[ajaxResult.training],
                            "isRegistered": 0,
                            "isEnrolled": 0,
                            "joinDate": ajaxResult.enterdate,
                            "option": {
                                "interested": parseInt(ajaxResult.interested),
                                "maxMail": parseInt(ajaxResult.maxMail),
                            },
                            "password": ajaxResult.password,
                            "sentMail": 0
                        }
                        backupJSON('soldier');
                        saveJSON('soldier');
                        body_HTML += `<script>$('#popup-box-background').css('display','block');$("#submit-popup").attr("class","popup-box slideUp");$('#submit-popup-title-icon').attr('class','fas fa-check ');$('#submit-popup-title').html('성공적으로 <br> 등록되었습니다.');$("#submit-popup-button").val('조회하기');$("#submit-popup-button").attr("onclick","location.href='/result?soldier-name=${ajaxResult.soldierName}&soldier-birth=${ajaxResult.soldierBirth}&enterdate=${ajaxResult.enterdate}'");$('#submit-popup-button').attr('tabindex','0');</script>`
                        break;
                    case 2:
                        console.log("새로운 공군 " + ajaxResult.soldierName + "을 등록합니다.")
                        unwriteableSoldierList[ajaxResult.soldierName] = {
                            "type": "airforce",
                            "birth": ajaxResult.soldierBirth,
                            "school": schoolArr[ajaxResult.training],
                            "joinDate": ajaxResult.enterdate,
                            "option": {
                                "interested": parseInt(ajaxResult.interested),
                                "maxMail": parseInt(ajaxResult.maxMail)
                            },
                            "password": ajaxResult.password,
                            "sentMail": 0
                        }
                        backupJSON('soldier');
                        saveJSON('soldier');
                        body_HTML += `<script>$('#popup-box-background').css('display','block');$("#submit-popup").attr("class","popup-box slideUp");$('#submit-popup-title-icon').attr('class','fas fa-check ');$('#submit-popup-title').html('성공적으로 <br> 등록되었습니다.');$("#submit-popup-button").val('조회하기');$("#submit-popup-button").attr("onclick","location.href='/result?soldier-name=${ajaxResult.soldierName}&soldier-birth=${ajaxResult.soldierBirth}&enterdate=${ajaxResult.enterdate}'");$('#submit-popup-button').attr('tabindex','0');</script>`;
                        break;
                    default:
                        console.log('전송된 데이터에 이상 발견 : ' + dataValidCount);
                        body_HTML += `<script>$('#popup-box-background').css('display','block');$("#submit-popup").attr("class","popup-box slideUp");$('#submit-popup-title-icon').attr('class','fas fa-exclamation-triangle');$('#submit-popup-title').html('데이터 수정 금지 <br> :`;
                        for (index in modifiedErrArr) {
                            body_HTML += (dataValidCount & Math.pow(2, index) ? ' ' + modifiedErrArr[index] : '');
                        }
                        body_HTML += `');$("#submit-popup-button").val('다시하기');$("#submit-popup-button").attr("onclick","$('#submit-popup').attr('class','popup-box slideDown');$('#popup-box-background').css('display','none');setTimeout(() => {$('#submit-popup').attr('class','popup-box detailed-hidden');},800);");$('#submit-popup-button').attr('tabindex','0');</script>`;
                        break;
                }
                res.send(body_HTML);
                return;
            }
            break;
        case 1:
            if (ajaxResult.password === soldierArray[ajaxResult.soldierName]) {
                switch (pos_flag) {
                    case 0:
                        writeableSoldierList[ajaxResult.soldierName]['option']['interested'] = parseInt(ajaxResult['interested']);
                        writeableSoldierList[ajaxResult.soldierName]['option']['maxMail'] = parseInt(ajaxResult['maxMail']);
                        break;
                    case 1:
                        unwriteableSoldierList[ajaxResult.soldierName]['option']['interested'] = parseInt(ajaxResult['interested']);
                        unwriteableSoldierList[ajaxResult.soldierName]['option']['maxMail'] = parseInt(ajaxResult['maxMail']);
                        break;
                }
                body_HTML += `<script>$('#popup-box-background').css('display','block');$("#submit-popup").attr("class","popup-box slideUp");$('#submit-popup-title-icon').attr('class','fas fa-check ');$('#submit-popup-title').html('성공적으로 <br> 수정되었습니다.');$("#submit-popup-button").val('조회하기');$("#submit-popup-button").attr("onclick","location.href='/result?soldier-name=${ajaxResult.soldierName}&soldier-birth=${ajaxResult.soldierBirth}&enterdate=${ajaxResult.enterdate}'");$('#submit-popup-button').attr('tabindex','0');</script>`;
                res.send(body_HTML);
                backupJSON('soldier');
                saveJSON('soldier');
            } else {
                body_HTML += `<script>$('#popup-box-background').css('display','block');$("#submit-popup").attr("class","popup-box slideUp");$('#submit-popup-title-icon').attr('class','fas fa-exclamation-triangle');$('#submit-popup-title').html('비밀번호가 <br>다릅니다');$("#submit-popup-button").val('확인');$("#submit-popup-button").attr("onclick","$('#submit-popup').attr('class','popup-box slideDown');$('#popup-box-background').css('display','none');setTimeout(() => {$('#submit-popup').attr('class','popup-box detailed-hidden');},800);");$('#submit-popup-button').attr('tabindex','0');</script>`;
            }
            break;
        default:
            res.sendStatus(404);
    }

})

app.listen(6125, function () {
    // console.log(__dirname + '/lib/web')
});

app.get('/admin', async function (req, res) {
    let auth = req.headers.authorization;
    let query = req.query;
    if (!auth) {
        res.setHeader('WWW-Authenticate', 'Basic realm="need login"');
        console.log('Attemption to access admin page');
        res.sendStatus(401)
    }
    else {
        let encoded = req.headers.authorization.split(' ')[1];
        let decoded = new Buffer.alloc(16, encoded, 'base64').toString();
        let name = decoded.split(':')[0];
        let password = decoded.split(':')[1];
        if (name === admin_id && password === admin_pw) {
            console.log('관리자 페이지에 접속')
            html = await adminPagePrint();
            res.send(html);
            if (query.run === '1' && preventDuplicateRunFlag != 1) {
                let currentTime = new Date();
                let timeZone = currentTime.getTimezoneOffset();
                currentTime.setHours(currentTime.getHours() + (timeZone + 540) / 60); // 미국 타임존 기준 우리나라 시간 구함.
                console.log('작동을 시작합니다. ')

                preventDuplicateRunFlag = 1;
                mailWriterRunTime = `${currentTime.getHours()}시 ${currentTime.getMinutes()}분 ${currentTime.getSeconds()}초`;

                mailWriteTimer = setInterval(async () => {
                    console.log('서버시간' + currentTime);
                    await updateDate();
                    if (preventDuplicateRunFlag) {
                        console.log('메일 작성 시작');
                        writeableSoldierList = await sendMail.main(writeableSoldierList);
                        console.log('메일 작성 완료');
                        await saveJSON(`soldier`);
                    }
                }, 86400000);

                //타이머 작동중 먼저 작동 
                console.log('서버시간' + currentTime);
                await updateDate();
                console.log('메일 작성 시작');
                writeableSoldierList = await sendMail.main(writeableSoldierList);
                console.log('메일 작성 완료');
                console.log(writeableSoldierList);
                await saveJSON(`soldier`);
                //==끝==          
            }
            else if (query.run === '0' && preventDuplicateRunFlag === 1) {
                let currentTime = new Date();
                let timeZone = currentTime.getTimezoneOffset();
                currentTime.setHours(currentTime.getHours() + (timeZone + 540) / 60); // 미국 타임존 기준 우리나라 시간 구함.
                console.log('작동을 정지합니다. ')
                console.log('서버시간' + currentTime);
                await updateDate();
                preventDuplicateRunFlag = 0;
                mailWriterRunTime = ``;
                clearTimeout(mailWriteTimer);
            }
        }
        else {
            res.setHeader('WWW-Authenticate', 'Basic realm="need login"');
            console.log('wrong id & pw');
            res.sendStatus(401)
        }
    }
});

setInterval(async () => {
    let currentTime = new Date();
    let timeZone = currentTime.getTimezoneOffset();
    currentTime.setHours(currentTime.getHours() + (timeZone + 540) / 60); // 미국 타임존 기준 우리나라 시간 구함.
    console.log(`서버시간 : ${currentTime}`);
}, 3600000);
