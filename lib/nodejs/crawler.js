const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');
const Keywords = {
    "[KeSPA컵": [' '],
    "[롤챔스": [' '],
    "[롤드컵": [' '],
    "[MSI": [' '],
    "[오피셜]": [
        "세트",
        "합류",
        "영입",
        "입단",
        "이적",
        "취소",
        "은퇴",
        "마무리",
        "재계약",
        "복귀"
    ],
    "[LCK": [' ']
}

// const headKeywords = ['[KeSPA컵', '[롤챔스', '[롤드컵', '[MSI', '[오피셜]', '[LCK'];
// const bodyKeywords = { '[오피셜]': ['세트', '합류', '영입', '입단', '이적', '취소', '은퇴', '마무리', '재계약', '복귀'] }; // json으로 개인화/파트화 하기.

module.exports = {
    lolArticle: async function (maxMail, lastArticle) { // maxMail, lastArticle 받고 -> 뉴스 배열, lastArticle 보냄.

        // console.log( maxMail + '   ' + lastArticle)
        let nextLastArticle;

        let newsArray = [];

        nextLastArticle = lastArticle;

        let updateLastArticleChecker = 0;

        const browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox"]
        });
        const page = await browser.newPage();

        for (pageIndex = 1; maxMail > 0; pageIndex++) {
            

            let navigationPromise1 = page.waitForNavigation();

            await page.goto('http://www.inven.co.kr/webzine/news/?site=lol&page=' + pageIndex);

            await navigationPromise1;

            // console.log('promise1 resolve')

            var $ = cheerio.load(await page.content());

            var titleArray = $('.title');



            for (i = 0; i < titleArray.length && maxMail > 0; i++) {
                let classTitle = titleArray.eq(i);
                validChecker = 0;
                for (headKeyword in Keywords) {
                    if (classTitle.text().includes(headKeyword) == true) {
                        for (index in Keywords[headKeyword]) {
                            if (classTitle.text().includes(Keywords[headKeyword][index]) == true) {
                                // console.log(headKeyword + Keywords[headKeyword][index])
                                // console.log('updateLastArticleChecker : ' + updateLastArticleChecker)
                                let articleLink = classTitle.find('a').attr('href');

                                currentArticle = articleLink.substr((articleLink.search('news=') + 5), 6);

                                console.log(currentArticle)

                                if (currentArticle <= lastArticle) { // article number check
                                    await browser.close();
                                    console.log('reach article index limit')
                                    return { 'newsArray': newsArray, 'lastArticle': nextLastArticle };
                                }
                                
                                if (updateLastArticleChecker === 0) { // update last article
                                    nextLastArticle = currentArticle;
                                    updateLastArticleChecker = 1;
                                }
                                let navigationPromise2 = page.waitForNavigation();

                                await page.goto(articleLink);

                                await navigationPromise2;

                                var $ = cheerio.load(await page.content());

                                var title = classTitle.text();

                                title = title.substr(0, title.match(/\[\d+\]/) - 1)

                                var content = $('.contentBody').text();

                                content = content.replace(/[^(가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\s\"\,\/)]/gi, "");

                                content = content.replace(/\n/gi, ' ').substr(0, 1500);

                                newsArray.push({ 'title': classTitle.text(), 'contents': content });
                                maxMail--;
                                validChecker = 1;
                                break;
                            }
                        }
                        if (validChecker === 1) {
                            break;
                        }
                    }
                    // updateLastArticleChecker = 1;
                }

            }
        }

        console.log('reach max mail limit')


        await browser.close();
        return { 'newsArray': newsArray, 'lastArticle': nextLastArticle };

    },
    ynaArticle: async function () {
        const browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox"]
        });
        const page = await browser.newPage();

        currentTime = new Date();
        timeZone = currentTime.getTimezoneOffset();
        currentTime.setHours(currentTime.getHours() + (timeZone + 540) / 60);

        currentTimeString = currentTime.getUTCFullYear() * 10000 + (currentTime.getUTCMonth() + 1) * 100 + (currentTime.getUTCDate() - 1)

        // console.log('https://www.yna.co.kr/theme/topnews-history?date=' + currentTimeString);

        await page.goto('https://www.yna.co.kr/theme/topnews-history?date=' + currentTimeString);

        // await page.waitForNavigation();

        var $ = cheerio.load(await page.content());

        var titles = $('.list').eq(0).find('strong');

        var titleString = '';

        for (i = 0; i < titles.length - 1; i++) {
            if (titles.eq(i).text() == titles.eq(i + 1).text()) {
                // console.log('duplicated titles');
            }
            titleString += '/' + titles.eq(i).text();
        }
        titleString += titles.eq(titles.length).text();

        // console.log(titleString.substr(0, 1500));

        await page.close();

        await browser.close();

        return titleString.replace(/[^(가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\s\"\,\/)]/gi, "").substr(0, 1500);

    },
    baseballArticle: async function () {

        const browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox"]
        });
        const page = await browser.newPage();

        currentTime = new Date();
        timeZone = currentTime.getTimezoneOffset();
        currentTime.setHours(currentTime.getHours() + (timeZone + 540) / 60); // 미국 타임존 기준 우리나라 시간 구함.

        currentTimeString = currentTime.getUTCFullYear() * 10000 + (currentTime.getUTCMonth() + 1) * 100 + (currentTime.getUTCDate() - 1)

        // console.log('https://sports.news.naver.com/kbaseball/news/index.nhn?isphoto=N&type=popular&date=' + currentTimeString);

        await page.goto('https://sports.news.naver.com/kbaseball/news/index.nhn?isphoto=N&type=popular&date=' + currentTimeString);

        await page.waitForNavigation();

        var $ = cheerio.load(await page.content());

        var titles = $('.news_list').eq(0).find('.title');

        var titleString = '';

        for (i = 0; i < titles.length - 1; i++) {
            if (titles.eq(i).text() == titles.eq(i + 1).text()) {
                // console.log('duplicated titles');
            }
            titleString += '/' + titles.eq(i).text();
        }
        titleString += titles.eq(titles.length).text();

        // console.log(titleString.substr(0, 1500));

        await page.close();

        await browser.close();

        // console.log(titleString)

        return titleString.replace(/[^(가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\s\"\,\/)]/gi, "").substr(0, 1500);

    },
    wfootballArticle: async function () {

        const browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox"]
        });
        const page = await browser.newPage();


        currentTime = new Date();
        timeZone = currentTime.getTimezoneOffset();
        currentTime.setHours(currentTime.getHours() + (timeZone + 540) / 60);

        currentTimeString = currentTime.getUTCFullYear() * 10000 + (currentTime.getUTCMonth() + 1) * 100 + (currentTime.getUTCDate() - 1)


        // console.log('https://sports.news.naver.com/kbaseball/news/index.nhn?isphoto=N&type=popular&date=' + currentTime.getUTCFullYear() + (currentTime.getUTCMonth() + 1) + (currentTime.getUTCDate() - 1))

        await page.goto('https://sports.news.naver.com/wfootball/news/index.nhn?isphoto=N&type=popular&date=' + currentTimeString);

        var $ = cheerio.load(await page.content());

        var titles = $('.news_list').eq(0).find('.title');

        var titleString = '';

        for (i = 0; i < titles.length - 1; i++) {
            if (titles.eq(i).text() == titles.eq(i + 1).text()) {
                // console.log('duplicated titles');
            }
            titleString += '/' + titles.eq(i).text();
        }
        titleString += titles.eq(titles.length).text();

        // console.log(titleString.substr(0, 1500));

        await page.close();

        await browser.close();

        return titleString.replace(/[^(가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\s\"\,\/)]/gi, "").substr(0, 1500);

    }

}




