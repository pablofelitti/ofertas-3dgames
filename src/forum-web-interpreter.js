'use strict'

const puppeteer = require("puppeteer");
const foro3dGamesUtils = require("./forum-web-utils");

async function loadPostsFromSite(pageNumber) {

    const browser = await puppeteer.launch({ignoreHTTPSErrors: true, args: ['--no-sandbox']})

    try {
        const page = await browser.newPage()
        await foro3dGamesUtils.openPage(page, pageNumber)

        const posts = await foro3dGamesUtils.getBodyFromPost(page)

        browser.close().then(() => console.log('Browser closed'))
        return posts
    } catch (e) {
        console.log('An error occurred: ')
        console.log(e)
        browser.close().then(() => console.log('Browser closed'))
        return []
    }
}

exports.loadPostsFromSite = loadPostsFromSite