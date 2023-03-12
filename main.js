const fs = require('fs');
const { parse } = require('path');
const airforce = require('./lib/nodejs/airforce.js');

const airForce = require('./lib/nodejs/airforce.js');
const army = require('./lib/nodejs/army.js')
const crawler = require('./lib/nodejs/crawler.js');

module.exports = {
    main: async function (soldierList) {

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
                        reject("getEmailContents에서 무언가 잘못되었습니다.");

                }
            })
        }

        async function getEmailSource() {
            let articles = [];
            for (soldierName in soldierList) {

                let tempArticles = [];

                // console.log(soldierName);
                // console.log(soldierList[soldierName])

                let maxMail = soldierList[soldierName]['option']['maxMail'];

                if (soldierList[soldierName]['option']['interested'] & 4 && maxMail > 0) {
                    console.log(soldierName + ' 훈련병에게 연합뉴스 기사 수집')
                    tempArticles.push(await getEamilContents(2, maxMail, undefined).then((newsString) => {
                        return { 'title': '연합뉴스 요약본', 'contents': newsString };
                    }));
                    maxMail--;
                }

                if (soldierList[soldierName]['option']['interested'] & 1 && maxMail > 0) {
                    console.log(soldierName + ' 훈련병에게 네이버 스포츠 해외축구 기사 수집')
                    tempArticles.push(await getEamilContents(0, maxMail, undefined).then((newsString) => {
                        return { 'title': '네이버 스포츠 해외 축구 요약본', 'contents': newsString };
                    }));
                    maxMail--;
                }

                if (soldierList[soldierName]['option']['interested'] & 2 && maxMail > 0) {
                    console.log(soldierName + ' 훈련병에게 네이버 야구 기사 수집')
                    tempArticles.push(await getEamilContents(1, maxMail, undefined).then((newsString) => {
                        return { 'title': '네이버 스포츠 야구 요약본', 'contents': newsString };
                    }));
                    maxMail--;
                }

                if (soldierList[soldierName]['option']['interested'] & 8 && maxMail > 0) {
                    console.log(soldierName + ' 훈련병에게 리그 오브 레전드 기사 수집')
                    fileWriteFlag = 1;
                    lolArticles = await getEamilContents(3, maxMail, soldierList[soldierName]['option']['lastArticle']['lolInven']).then((integratedArray) => {
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
                        console.log('새로 수집한 리그 오브 레전드 기사가 없습니다.')
                    }
                    console.log(tempLastArticle)
                    soldierList[soldierName]['option']['lastArticle']['lolInven'] = tempLastArticle;
                    fileWriteFlag = 1;
                }

                articles[soldierName] = tempArticles;
                console.log(`${soldierName} 훈련병에게 전송할 ${tempArticles.length} 개의 기사를 수집했습니다.`)
            }
            console.log('기사 수집이 완료되었습니다.')
            return articles;
        }

        let uncodedAirForceSoldier = {};
        let unenrolledArmy = {};
        let unregisteredArmy = {};

        let uncodeStatusFlag = 0;
        let unenrolledFlag = 0;
        let unregisteredArmyFlag = 0;

        // await updateDate();

        // await getWriteableSoldier();

        // console.log(soldierList);
        for (soldierName in soldierList) {
            // console.log(soldierName + soldierList[soldierName]['type'])
            if ((soldierList[soldierName]['type'] === 'airforce')) {
                if (soldierList[soldierName]['code'] === undefined) {
                    console.log(`${soldierName} 훈련병의 ${soldierList[soldierName]['school']} 코드가 없습니다. `)// 여기 일반병일때랑 정통병일때 구분해서 출력해야됨
                    uncodedAirForceSoldier[soldierName] = soldierList[soldierName];
                    uncodeStatusFlag = 1;
                }
            }
            else {
                if (!soldierList[soldierName]['isEnrolled']) {
                    console.log(`${soldierName} 훈련병은 아직 더캠프에 등록되지 않았습니다.`)
                    unenrolledArmy[soldierName] = soldierList[soldierName];
                    unenrolledFlag = 1;
                }
                if (!soldierList[soldierName]['isRegistered']) {
                    console.log(`${soldierName} 훈련병은 아직 카페에 가입되지 않았습니다.`)
                    unregisteredArmy[soldierName] = soldierList[soldierName];
                    unregisteredArmyFlag = 1;
                }
            }

        }

        console.log('공군코드가 부여되지 않은 공군 훈련병 : ' + Object.keys(uncodedAirForceSoldier).length)

        if (uncodeStatusFlag === 1) {

            console.log('공군코드를 업데이트합니다')

            uncodedAirForceSoldier = await airForce.getSoldierCode(uncodedAirForceSoldier);

            console.log(uncodedAirForceSoldier)

            for (arrayIndex in uncodedAirForceSoldier) {
                let soldierName = Object.keys(uncodedAirForceSoldier[arrayIndex])[0];
                soldierList[soldierName]['code'] = uncodedAirForceSoldier[arrayIndex][soldierName]['code']
            }

        }
        else {
            console.log('공군코드를 업데이트 할 필요가 없습니다.')
        }


        console.log('더캠프에 추가되지 않은 육군 훈련병 : ' + Object.keys(unenrolledArmy).length)

        if (unenrolledFlag === 1) {

            console.log('더캠프에 아직 추가되지 않은 육군이 있습니다.')

            console.log(`${JSON.stringify(unenrolledArmy)}`);

            unenrolledArmy = await army.enrollSoldier(unenrolledArmy);


            for (soldierName in unenrolledArmy) {
                soldierList[soldierName]['isEnrolled'] = unenrolledArmy[soldierName];
            }

        }
        else {
            console.log('더캠프에 추가할 육군이 없습니다')
        }


        console.log('카페에 가입되지 않은 육군 훈련병  : ' + Object.keys(unregisteredArmy).length)

        if (unregisteredArmyFlag === 1) {

            console.log('아직 카페에 가입안된 육군을 카페에 가입시킵니다')

            console.log(unregisteredArmy)

            unregisteredArmy = await army.registerCafe(unregisteredArmy);

            if (Object.keys(unregisteredArmy).length === 0) {
                console.log('새로 카페에 가입한 육군이 없습니다')
            }
            else {
                for (soldierName in unregisteredArmy) {
                    soldierList[soldierName]['isRegistered'] = (unregisteredArmy[soldierName] === undefined ? 0 : 1);
                }
            }
        }
        else {
            console.log('카페에 가입할 육군이 없습니다')
        }

        console.log("기사를 크롤링합니다..")
        articles = await getEmailSource();
        console.log('기사를 성공적으로 크롤링했습니다')

        console.log('인편을 전송합니다.')
        for (soldierName in soldierList) {
            let writeablePeriodMax = soldierList[soldierName]['option']['WPM'] === undefined ? 1 : 0;
            let returnObject;
            if (Object.keys(articles[soldierName]).length) {
                console.log(`${soldierName} 훈련병은 지금까지 ${soldierList[soldierName]['sentMail']}개의 메일을 받았습니다.`)
                switch (soldierList[soldierName]['type']) {
                    case 'airforce':
                        returnObject = await airforce.mailWrite(soldierName, soldierList[soldierName], articles[soldierName], (soldierList[soldierName]['school'] === undefined ? 'HR' : soldierList[soldierName]['school']), writeablePeriodMax)
                        if (returnObject.articles > 0) {
                            console.log('성공적으로 ' + returnObject.articles + '개의 기사를 전송했습니다')
                            soldierList[soldierName]['sentMail'] += returnObject.articles;
                        }
                        else {
                            console.log('메일을 보낼 수 없었습니다. 이미 종료된 것 같습니다.')
                        }
                        break;
                    case 'army':
                        returnObject = await army.mailWrite(soldierName, articles[soldierName], writeablePeriodMax)
                        console.log('성공적으로 ' + soldierName + ' 훈련병 에게 ' + returnObject.articles + '개의 기사를 전송했습니다')
                        soldierList[soldierName]['sentMail'] = parseInt(soldierList[soldierName]['sentMail']) + returnObject.articles;
                        break;
                    default:
                        console.log(soldierName + ' 이사람 어케 뚫었음??');
                        break;
                }
                if (returnObject.writeablePeriodMax) {
                    soldierList[soldierName]['option']['WPM'] = returnObject.writeablePeriodMax;
                }
            }
        }
        console.log('main 함수를 종료합니다.');

        return soldierList;
    }
}

        // async function updateDate() {
        //     let currentTime = new Date();
        //     let timeZone = currentTime.getTimezoneOffset();
        //     let checker = 0;
        //     let week = 604800000;
        //     currentTime.setHours(currentTime.getHours() + (timeZone + 540) / 60); // 미국 타임존 기준 우리나라 시간 구함.

        //     for (soldierName in soldierList) {
        //         let joinDate = soldierList[soldierName]['joinDate'];
        //         if (currentTime > new Date(soldierList[soldierName]['option']['WPM'])) {
        //             console.log(soldierName + '\'s mail duration was expiered')
        //             console.log(delete soldierList[soldierName])
        //             checker = 1;
        //             continue;
        //         }
        //         if (soldierList[soldierName]['writeable'] === 0) {
        //             if (soldierList[soldierName]['type'] === 'army') {
        //                 if (currentTime.getTime() > (1.5 * week + new Date(`${joinDate.slice(0, 4)}-${joinDate.slice(4, 6)}-${joinDate.slice(6, 8)}`).getTime())) {
        //                     soldierList[soldierName]['writeable'] = 1;
        //                     checker = 1;
        //                 }
        //             } else if (soldierList[soldierName]['type'] === 'airforce') {
        //                 if (currentTime.getTime() > (2 * week + new Date(`${joinDate.slice(0, 4)}-${joinDate.slice(4, 6)}-${joinDate.slice(6, 8)}`).getTime())) {
        //                     soldierList[soldierName]['writeable'] = 1;
        //                     checker = 1;
        //                 }
        //             }
        //         }
        //     }
        //     return;
        // }

// async function getWriteableSoldier() {
//     for (soldierName in soldierList) {
//         if (soldierList[soldierName]['writeable'] === 0) {
//             console.log(soldierName + ' is not writeable');
//             delete writeableSoldierList[soldierName];
//         }
//     }
//     return writeableSoldierList;
// }
