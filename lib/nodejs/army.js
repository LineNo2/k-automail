const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const { thecamp_id, thecamp_pw } = require('../../db/account.json');


module.exports = {
    mailWrite: async function (soldierName, articles, writeablePeriodMax) {

        console.log('sending ' + Object.keys(articles).length + 'articles to army ' + soldierName)

        let articleSent = 0;

        const browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox"]
        });
        const page = await browser.newPage();

        await page.goto('https://www.thecamp.or.kr/eduUnitCafe/viewEduUnitCafeMain.do');

        await page.waitForSelector('#userId');

        await page.addScriptTag({
            content: `
        $('#userId').attr('value','${thecamp_id}');
        $('#userPwd').attr('value','${thecamp_pw}');
        $('#emailLoginBtn').click();
        `});

        await page.waitForNavigation();

        await page.goto('https://www.thecamp.or.kr/eduUnitCafe/viewEduUnitCafeMain.do');

        var $ = cheerio.load(await page.content());

        var script = '';


        for (i = 0; i < $('.cafe-card-box').length; i++) {
            if ($('.cafe-card-box').eq(i).find('.id').text().trim().split(' ')[0] === soldierName) {
                if ($('.cafe-card-box').eq(0).find('.btn-wrap').find('.btn-green').text() === '위문편지') {
                    console.log('moving to  ' + soldierName + ' \'s cafe')
                    script = $('.cafe-card-box').eq(i).find('.btn-wrap').find('.btn-green').attr('href');
                    break;
                }
            }
        }

        console.log(script);

        await page.addScriptTag({
            content: script
        });

        await page.waitForSelector('.btn-gradation').catch( (e) => {
            console.log(e);
        });

        if (writeablePeriodMax === 1) {
            console.log(soldierName + '\'s WPM is not crawled. crawling.. ')
            var $ = cheerio.load(await page.content());
            periodMax = $('.info-list').find('li').eq(1).find('span').text().replace(/\./g, '-')
            console.log(soldierName + '\'s WPM is : ' + periodMax)
        }

        for (i = 0; i < Object.keys(articles).length; i++) {

            await page.addScriptTag({
                content: `javascript:fn_moveInsert();`
            });

            await page.waitForNavigation();

            console.log('writting with script')

            // await page.waitForSelector('#sympathyLetterSubject')

            await page.type('#sympathyLetterSubject', articles[i].title, { delay: 100 })

            const frameHandle = await page.$("iframe");

            const frame = await frameHandle.contentFrame();

            await page.waitForTimeout(Math.random() * 5000 + 5000)


            await page.keyboard.press('Tab', {
                delay: 100
            });

            await page.keyboard.type(articles[i].contents, { delay: 10 })

            // try {
            //     await frame.type('body.cke_editable', articles[i].contents, { delay: 30 });
            // }
            // catch (error) {
            //     console.log(error);


            //     return { 'articles': articleSent };
            // }
            try {
                page.on('dialog', async dialog => {

                    console.log(dialog.type());

                    if (dialog.message() === `\"제목\"에 금지단어 ''가 포함되어 있습니다.`) {
                        console.log('버그에 당했습니다. 다시 시도해보는중입니다.');
                    }

                    await dialog.accept();

                    await page.click('a[href="javascript:fn_insert(1);"]')
                });
            }
            catch (e) {
                console.log(e)
            }

            await page.click('a[href="javascript:fn_insert(1);"]')

            articleSent++;

            await page.waitForSelector('.btn-gradation');

        }

        console.log('편지를 다 보냈습니다. 종료합니다.')

        await browser.close();

        if (writeablePeriodMax === 1) {
            return { 'articles': articleSent, 'writeablePeriodMax': periodMax };
        }

        return { 'articles': articleSent };

    },
    enrollSoldier: async function (soldierArray) {

        var soldierCheck = [];

        const browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox"]
        });
        const page = await browser.newPage();

        await page.goto('https://www.thecamp.or.kr/missSoldier/viewMissSoldierSearch.do');

        await page.waitForTimeout(1000);

        await page.addScriptTag({
            content: `
        $('#userId').attr('value','${thecamp_id}');
        $('#userPwd').attr('value','${thecamp_pw}');
        $('#emailLoginBtn').click();
        `});

        await page.waitForNavigation();

        page.on('dialog', async dialog => {

            console.log(dialog.message());

            await dialog.accept()

            console.log('accepted');
        });

        for (arrayIndex in soldierArray) {
            var soldierName = Object.keys(soldierArray[arrayIndex])[0];
            var birthInfo = soldierArray[arrayIndex][soldierName]['birth'];
            var joinTrainUnit = soldierArray[arrayIndex][soldierName]['joinTrainUnit'];
            var joinDate = soldierArray[arrayIndex][soldierName]['joinDate'];

            await page.goto('https://www.thecamp.or.kr/missSoldier/viewMissSoldierSearch.do');

            await page.waitForTimeout(1000);

            await page.addScriptTag({
                content: `
        $('#name').attr('value','${soldierName}');
        $('#birth').attr('value','${birthInfo.slice(0, 4)}-${birthInfo.slice(4, 6)}-${birthInfo.slice(6, 8)}');
        $('#trainUnitCd option').each(function() {
            if($(this).text().search('${joinTrainUnit === 0 ? '육군훈련소' : joinTrainUnit + '사단'}') === 0){
                $('#trainUnitCd').val($(this).attr('value'));
            } 
        });
        $('#enterDate').attr('value','${joinDate.slice(0, 4)}-${joinDate.slice(4, 6)}-${joinDate.slice(6, 8)}');
        $('#missSoldierRelationshipCd').val('0000420006');
        `});


            await page.waitForTimeout(1000);

            await page.click('#searchBtn');

            soldierCheck[soldierName] = 1;

        }

        await browser.close()

        return soldierCheck;

    },
    registerCafe: async function (armyList) {
        const browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox"]
        });
        const page = await browser.newPage();

        await page.goto('https://www.thecamp.or.kr/eduUnitCafe/viewEduUnitCafeMain.do');

        await page.waitForTimeout(1000);

        await page.addScriptTag({
            content: `
        $('#userId').attr('value','${thecamp_id}');
        $('#userPwd').attr('value','${thecamp_pw}');
        $('#emailLoginBtn').click();
        `});

        await page.waitForNavigation();

        await page.goto('https://www.thecamp.or.kr/eduUnitCafe/viewEduUnitCafeMain.do');

        //login

        //카페확인 

        var $ = cheerio.load(await page.content());

        var script = '';

        var soldierCheck = [];

        try {
            page.on('dialog', async dialog => {



                if (dialog.message().includes('개설된 카페가 있습니다.')) {
                    console.log('cafe is created.');
                }

                if (dialog.message().includes('카페가 아직 개설전 입니다.')) {
                    console.log('cafe is not created.');
                }

                await dialog.accept()

            });
        }
        catch (e) {
            console.log(e)
        }


        for (i = 0; i < $('.cafe-card-box').length; i++) {
            for (arrayIndex in armyList) {
                var soldierName = Object.keys(armyList[arrayIndex])[0];
                if (soldierCheck[soldierName] != 1) {
                    if ($('.cafe-card-box').eq(i).find('.id').text().trim().split(' ')[0] === soldierName) {
                        if ($('.cafe-card-box').eq(i).find('.btn-wrap').find('a').text() === '카페확인') {
                            console.log('checking ' + soldierName + ' cafe created')
                            script += $('.cafe-card-box').eq(i).find('.btn-wrap').find('a').attr('href');
                            soldierCheck[soldierName] = 1;
                        }
                    }
                }

            }
        }

        console.log(script);

        await page.addScriptTag({
            content: script
        });

        await page.waitForTimeout(1000);

        await page.goto('https://www.thecamp.or.kr/eduUnitCafe/viewEduUnitCafeMain.do')

        //카페가입

        var $ = cheerio.load(await page.content());

        script = '';

        soldierCheck = [];

        for (i = 0; i < $('.cafe-card-box').length; i++) {
            for (arrayIndex in armyList) {
                var soldierName = Object.keys(armyList[arrayIndex])[0];
                if (soldierCheck[soldierName] != 1) {
                    if ($('.cafe-card-box').eq(i).find('.id').text().trim().split(' ')[0] === soldierName) {
                        if ($('.cafe-card-box').eq(i).find('.btn-wrap').find('a').text() === '가입하기') {
                            console.log('entering ' + soldierName + '\'s valid cafe')
                            script += $('.cafe-card-box').eq(i).find('.btn-wrap').find('a').attr('href');
                            soldierCheck[soldierName] = 1;
                        }
                    }
                }

            }
        }


        for (soldierName in soldierCheck) {
            armyList[soldierName]['isRegistered'] = 1
        }

        await page.addScriptTag({
            content: script
        });

        await page.goto('https://www.thecamp.or.kr/eduUnitCafe/viewEduUnitCafeMain.do')

        var $ = cheerio.load(await page.content());

        for (i = 0; i < $('.cafe-card-box').length; i++) {
            for (arrayIndex in armyList) {
                var soldierName = Object.keys(armyList[arrayIndex])[0];
                if (soldierCheck[soldierName] != 1) {
                    if ($('.cafe-card-box').eq(i).find('.id').text().trim().split(' ')[0] === soldierName) {
                        if ($('.cafe-card-box').eq(i).find('.btn-wrap').find('a').text() === '위문편지카페바로가기') {
                            console.log('entered ' + soldierName + '\'s valid cafe')
                            soldierCheck[soldierName] = 1;
                        }
                    }
                }

            }
        }

        await browser.close()

        return soldierCheck;

    }
}
