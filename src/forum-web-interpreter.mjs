import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import {getBodyFromPost, openPage} from "./forum-web-utils.mjs"

chromium.setHeadlessMode = true;
chromium.setGraphicsMode = false;

export async function loadPostsFromSite(pageNumber) {

    const browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
        ignoreHTTPSErrors: true
    });

    try {
        const page = await browser.newPage()
        await openPage(page, pageNumber)

        const posts = await getBodyFromPost(page)

        browser.close().then(() => console.log('Browser closed'))
        return posts
    } catch (e) {
        console.log('An error occurred: ')
        console.log(e)
        browser.close().then(() => console.log('Browser closed'))
        return []
    }
}
