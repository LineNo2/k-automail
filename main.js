const fs = require('fs');
const airforce = require('./lib/nodejs/airforce.js');

const airForce = require('./lib/nodejs/airforce.js');
const army = require('./lib/nodejs/army.js')
const crawler = require('./lib/nodejs/crawler.js');

const airForceSchool = ['JT', 'K1', 'K2', 'HJ', 'BP', 'HR']

let fileWriteFlag = 0;



let userList = fs.readFileSync('./db/soldier.json');

let originalList = JSON.parse(userList)

let soldierList = originalList;

let writeableSoldierList = Object.assign(soldierList);

async function getWriteableSoldier() {
    // console.log(writeableSoldierList)
    for (soldierName in soldierList) {
        if (soldierList[soldierName]['writeable'] === 0) {
            console.log(soldierName + ' is not writeable');
            delete writeableSoldierList[soldierName];
        }
    }
    // console.log(writeableSoldierList);
    return writeableSoldierList;
}

async function updateDate() {
    let currentTime = new Date();
    let timeZone = currentTime.getTimezoneOffset();
    let checker = 0;
    let week = 604800000;
    currentTime.setHours(currentTime.getHours() + (timeZone + 540) / 60); // 미국 타임존 기준 우리나라 시간 구함.

    for (soldierName in soldierList) {
        let joinDate = soldierList[soldierName]['joinDate'];
        if (currentTime > new Date(soldierList[soldierName]['option']['WPM'])) {
            console.log(soldierName + '\'s mail duration was expiered')
            console.log(delete soldierList[soldierName])
            checker = 1;
            continue;
        }
        if (soldierList[soldierName]['writeable'] === 0) {
            if (soldierList[soldierName]['type'] === 'army') {
                if (currentTime.getTime() > (1.5 * week + new Date(`${joinDate.slice(0, 4)}-${joinDate.slice(4, 6)}-${joinDate.slice(6, 8)}`).getTime())) {
                    soldierList[soldierName]['writeable'] = 1;
                    checker = 1;
                }
            } else if (soldierList[soldierName]['type'] === 'airforce') {
                if (currentTime.getTime() > (2 * week + new Date(`${joinDate.slice(0, 4)}-${joinDate.slice(4, 6)}-${joinDate.slice(6, 8)}`).getTime())) {
                    soldierList[soldierName]['writeable'] = 1;
                    checker = 1;
                }
            }
        }
    }

    if (checker === 1) {
        dateString = (currentTime.getMonth() + 1) + '-' + currentTime.getDate();
        fs.writeFileSync('./db/backup/soldier-backup-' + dateString + '.json', JSON.stringify(soldierList), 'utf8');
    }

    return;
}

function getEamilContents(type, maxMail, lastArticle) {
    return new Promise((resolve, reject) => {
        switch (type) {
            case 0:
                resolve(crawler.wfootballArticle().then())
                break;
            case 1:
                resolve(crawler.baseballArticle().then());
                break;
            case 2:
                resolve(crawler.ynaArticle().then());
                break;
            case 3:
                resolve(crawler.lolArticle(maxMail, lastArticle).then());
                break;
            default:
                reject("something Went Wrong..");

        }
    })
}

async function getEmailSource() {
    let articles = [];
    for (soldierName in writeableSoldierList) {

        let tempArticles = [];

        console.log(soldierName);
        console.log(writeableSoldierList[soldierName])

        let maxMail = writeableSoldierList[soldierName]['option']['maxMail'];

        if (writeableSoldierList[soldierName]['option']['interested'] & 4 && maxMail > 0) {
            console.log('getting yna news summary for ' + soldierName)
            tempArticles.push(await getEamilContents(2, maxMail, undefined).then((newsString) => {
                return { 'title': '연합뉴스 요약본', 'contents': newsString };
            }));
            maxMail--;
        }

        if (writeableSoldierList[soldierName]['option']['interested'] & 1 && maxMail > 0) {
            console.log('getting naver world football summary for ' + soldierName)
            tempArticles.push(await getEamilContents(0, maxMail, undefined).then((newsString) => {
                return { 'title': '네이버 스포츠 해외 축구 요약본', 'contents': newsString };
            }));
            maxMail--;
        }

        if (writeableSoldierList[soldierName]['option']['interested'] & 2 && maxMail > 0) {
            console.log('getting naver baseball summary for ' + soldierName)
            tempArticles.push(await getEamilContents(1, maxMail, undefined).then((newsString) => {
                return { 'title': '네이버 스포츠 야구 요약본', 'contents': newsString };
            }));
            maxMail--;
        }

        if (writeableSoldierList[soldierName]['option']['interested'] & 8 && maxMail > 0) {
            console.log('getting inven League summary for ' + soldierName)
            fileWriteFlag = 1;
            lolArticles = await getEamilContents(3, maxMail, writeableSoldierList[soldierName]['option']['lastArticle']['lolInven']).then((integratedArray) => {
                tempLastArticle = integratedArray['lastArticle'];
                return integratedArray['newsArray'];
            })
            try {
                lolArticles.forEach(x => {
                    tempArticles.push(x);
                });
            }
            catch {
                console.log(lolArticles)
                console.log('no articles')
            }
            console.log(tempLastArticle)
            writeableSoldierList[soldierName]['option']['lastArticle']['lolInven'] = tempLastArticle;
            fileWriteFlag = 1;
        }

        articles[soldierName] = tempArticles;
        console.log('got ' + tempArticles.length + ' article(s) for ' + soldierName)
    }
    console.log('crawl process completed')
    return articles;
}


async function main() {

    let uncodedAirForceSoldier = {};
    let unenrolledArmy = {};
    let unregisteredArmy = {};

    let uncodeStatusFlag = 0;
    let unenrolledFlag = 0;
    let unregisteredArmyFlag = 0;

    await updateDate();

    await getWriteableSoldier();

    // return;

    for (soldierName in writeableSoldierList) {
        console.log(soldierName + writeableSoldierList[soldierName]['type'])
        if ((writeableSoldierList[soldierName]['type'] === 'airforce')) {
            if (writeableSoldierList[soldierName]['code'] === undefined) {
                console.log(`${soldierName}'s ${writeableSoldierList[soldierName]['school']} code is missing`)// 여기 일반병일때랑 정통병일때 구분해서 출력해야됨
                uncodedAirForceSoldier[soldierName] = writeableSoldierList[soldierName];
                uncodeStatusFlag = 1;
            }
        }
        else {
            if (!writeableSoldierList[soldierName]['isEnrolled']) {
                console.log(`${soldierName} is not enrolled`)
                unenrolledArmy[soldierName] = writeableSoldierList[soldierName];
                unenrolledFlag = 1;
            }
            if (!writeableSoldierList[soldierName]['isRegistered']) {
                console.log(`Bot is not registered at ${soldierName}'s cafe`)
                unregisteredArmy[soldierName] = writeableSoldierList[soldierName];
                unregisteredArmyFlag = 1;
            }
        }

    }

    console.log('uncoded airforce : ' + Object.keys(uncodedAirForceSoldier).length)

    if (uncodeStatusFlag === 1) {

        console.log('it has update at airforce code - updating code..')

        uncodedAirForceSoldier = await airForce.getSoldierCode(uncodedAirForceSoldier);

        console.log(uncodedAirForceSoldier)

        for (arrayIndex in uncodedAirForceSoldier) {
            let soldierName = Object.keys(uncodedAirForceSoldier[arrayIndex])[0];
            writeableSoldierList[soldierName]['code'] = uncodedAirForceSoldier[arrayIndex][soldierName]['code']
        }

    }
    else {
        console.log('no update at airforce code')
    }


    console.log('unenrolled army : ' + Object.keys(unenrolledArmy).length)

    if (unenrolledFlag === 1) {

        console.log('it has unenrolled army - enrolling army..')

        unenrolledArmy = await army.enrollSoldier(unenrolledArmy);

        console.log(unenrolledArmy)

        for (soldierName in unenrolledArmy) {
            writeableSoldierList[soldierName]['isEnrolled'] = unenrolledArmy[soldierName];
        }

    }
    else {
        console.log('no army to enroll')
    }


    console.log('unregistered army : ' + Object.keys(unregisteredArmy).length)

    if (unregisteredArmyFlag === 1) {

        console.log('it has unregistered army - registering army..')

        console.log(unregisteredArmy)

        unregisteredArmy = await army.registerCafe(unregisteredArmy);

        if (Object.keys(unregisteredArmy).length === 0) {
            console.log('there was nothing to register')
        }
        else {
            for (soldierName in unregisteredArmy) {
                writeableSoldierList[soldierName]['isRegistered'] = (unregisteredArmy[soldierName] === undefined ? 0 : 1);
            }
        }
    }
    else {
        console.log('no army to register')
    }

    if (Object.keys(uncodedAirForceSoldier).length || Object.keys(unenrolledArmy).length || Object.keys(unregisteredArmy).length) {
        fs.writeFileSync('./db/soldier.json', JSON.stringify(writeableSoldierList), 'utf8');
        console.log('saved update to json file');
    }
    else {
        console.log('nothing to update ')
    }


    console.log("getting articles..")
    articles = await getEmailSource();
    console.log('email crawled completed')

    console.log('sending Emails')
    for (soldierName in writeableSoldierList) {
        writeablePeriodMax = writeableSoldierList[soldierName]['option']['WPM'] === undefined ? 1 : 0;
        if (Object.keys(articles[soldierName]).length) {
            switch (writeableSoldierList[soldierName]['type']) {
                case 'airforce':
                    returnObject = await airforce.mailWrite(soldierName, writeableSoldierList[soldierName], articles[soldierName], (writeableSoldierList[soldierName]['school'] === undefined ? 'HR' : writeableSoldierList[soldierName]['school']), writeablePeriodMax)
                    if (returnObject.articles > 0) {
                        console.log('성공적으로 ' + returnObject.articles + '개의 기사를 전송했습니다')
                    }
                    else {
                        console.log('메일을 보낼 수 없었습니다. 이미 종료된 것 같습니다.')
                    }
                    break;
                case 'army':
                    returnObject = await army.mailWrite(soldierName, articles[soldierName], writeablePeriodMax)
                    console.log('성공적으로 ' + returnObject.articles + '개의 기사를 전송했습니다')
            }
            if (returnObject.writeablePeriodMax) {
                writeableSoldierList[soldierName]['option']['WPM'] = returnObject.writeablePeriodMax;
                fileWriteFlag = 1;
            }
        }
    }

    if (fileWriteFlag) {
        fs.writeFileSync('./db/soldier.json', JSON.stringify(writeableSoldierList), 'utf8');
    }
}

main();