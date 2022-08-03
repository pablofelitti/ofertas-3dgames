import chromium from "chrome-aws-lambda"
import {getBodyFromPost, openPage} from "./forum-web-utils.mjs"

export async function loadPostsFromSite(pageNumber) {

    const browser = await chromium.puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath,
        headless: true,
        ignoreHTTPSErrors: true,
    })

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
