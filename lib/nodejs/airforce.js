const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

const airForceMailLink =
{
    'JT': 'http://atc.airforce.mil.kr:8081/user/indexSub.action?codyMenuSeq=156894686&siteId=tong-new&menuUIType=top',
    'K1': 'http://atc.airforce.mil.kr:8081/user/indexSub.action?codyMenuSeq=157620025&siteId=gisool2&menuUIType=top',
    'K2': 'http://atc.airforce.mil.kr:8081/user/indexSub.action?codyMenuSeq=157615558&siteId=gunsu&menuUIType=top',
    'HJ': 'http://atc.airforce.mil.kr:8081/user/indexSub.action?codyMenuSeq=159014200&siteId=haengjeong&menuUIType=top',
    'BP': 'http://atc.airforce.mil.kr:8081/user/indexSub.action?codyMenuSeq=158327574&siteId=bangpogyo&menuUIType=top',
    'HR': 'http://atc.airforce.mil.kr:8081/user/indexSub.action?codyMenuSeq=156893223&siteId=last2&menuUIType=top'
};

const airForceSearchID =
{
    'JT': 'tong-new',
    'K1': 'gisool2',
    'K2': 'gunsu',
    'HJ': 'haengjeong',
    'BP': 'bangpogyo',
    'HR': 'last2'
};

module.exports = {
    mailWrite: async function (soldierName, soldierInfo, articles, schoolID, writeablePeriodMax) {

        var returnChecker = 0;

        let articleSent = 0;

        birthInfo = soldierInfo.birth;
        soldierCode = soldierInfo.code;
        console.log(soldierName + " " + birthInfo);


        const browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox"]
        });
        const page = await browser.newPage();

        await page.goto(airForceMailLink[schoolID]);

        await page.evaluate((soldierName, birthInfo) => {
            document.querySelector('#searchName').value = soldierName;
            document.querySelector('#birthYear').value = birthInfo.slice(0, 4);
            document.querySelector('#birthMonth').value = birthInfo.slice(4, 6);
            document.querySelector('#birthDay').value = birthInfo.slice(6, 8);
        }, soldierName, birthInfo);

        await page.addScriptTag({ content: `resultSelect('${soldierCode}');` });

        await page.waitForSelector('#btnNext');

        await Promise.all([
            page.click('#btnNext'),
            page.waitForNavigation()]);

        /*위에는 Promise all 문법을 넣어서 만들어본것
        await page.click('#btnNext')

        await page.waitForNavigation(); */

        var $ = cheerio.load(await page.content());

        if (writeablePeriodMax === 1) {
            console.log('인편 작성 기간을 불러옵니다')

            var periodMax = $('#emailPic-container > div.studentInfo > div').text().split('~')[1].trim().replace('년 ', '-').replace('월 ', '-').replace('일', '').split(' ')[0];
            console.log(periodMax)
        }

        if ($('.message').text().includes('인터넷 편지 작성 기간이 아닙니다')) {
            await browser.close()
            return 1;
        }

        for (i = 0; i < Object.keys(articles).length; i++) {
            script = `$('#senderZipcode').attr('value','21340');
            $('#senderAddr1').attr('value','인천광역시 부평구 체육관로 27');
            $('#senderAddr2').attr('value','701동 604호');
            $('#senderName').attr('value','이호선');
            $('#relationship').attr('value','친구');
            $('#title').attr('value',\`${articles[i].title}\`);
            $('#contents').attr('value',\`${articles[i].contents}\`);
            $('#password').attr('value','123123');
            `;

            await page.waitForSelector(`input[value='인터넷 편지쓰기']`).catch(async function _() {
                console.log(soldierName + '에게 현재 인터넷 편지를 쓸 수 없습니다.')

                returnChecker = 1;
            });

            if (returnChecker === 1) {
                try {
                    await page.close()
                    await browser.close()
                }
                catch {
                    console.log('이미 닫혔습니다')
                }
                if (writeablePeriodMax === 1) {
                    return { 'writeablePeriodMax': periodMax };
                }
                return { 'articles': -1 };
            }
            articleSent++;

            await page.click(`input[value='인터넷 편지쓰기']`);

            await page.waitForTimeout(3000);

            await page.addScriptTag({ content: script });

            await page.waitForSelector(`input[value='작성완료']`)

            await page.click(`input[value='작성완료']`);

            await page.waitForSelector(`input[value='목록으로']`)

            await page.click(`input[value='목록으로']`)

        }

        await page.close()

        await browser.close()

        if (writeablePeriodMax === 1) {
            return { 'articles': articleSent, 'writeablePeriodMax': periodMax };
        }

        return { 'articles': articleSent };
    },
    getSoldierCode: async function (soldierArray) {

        if (Object.keys(soldierArray).length === 0) {
            console.log('data is up to date')
        }
        else {
            const browser = await puppeteer.launch({
                headless: true,
                args: ["--no-sandbox"]
            });
            const page = await browser.newPage();

            for (arrayIndex in soldierArray) {

                var soldierName = Object.keys(soldierArray[arrayIndex])[0];
                var schoolID = soldierArray[arrayIndex][soldierName]['school'];
                var birthInfo = soldierArray[arrayIndex][soldierName]['birth'];

                await page.goto(`http://atc.airforce.mil.kr:8081/user/emailPicViewSameMembers.action?siteId=${airForceSearchID[schoolID]}&searchName=${soldierName}&searchBirth=${birthInfo}`);
                console.log(`http://atc.airforce.mil.kr:8081/user/emailPicViewSameMembers.action?siteId=${airForceSearchID[schoolID]}&searchName=${soldierName}&searchBirth=${birthInfo}`)

                var $ = cheerio.load(await page.content());

                var code = $('.choice').attr('onclick');
                if (code) {
                    soldierArray[arrayIndex][soldierName]['code'] = code.match(/\d+/)[0];
                }
                else {
                    console.log('아직 공군에 등록이 안됐습니다.');
                }


            }

            await page.close();

            await browser.close();

            return soldierArray;
        }

    }
}
