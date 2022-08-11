import {loadPostsFromSite} from "./forum-web-interpreter.mjs"
import {loadConfig, updateLastPage, updateLastPost} from "./forum-dao.mjs"

function getLastItemId(lastPostsFromSite) {
    return lastPostsFromSite[lastPostsFromSite.length - 1].id
}

export async function readNewPosts(client) {
    let config = await getLastPageProcessed(client)
    let lastPostIdProcessed = config.lastPost
    let lastPageProcessed = config.lastPage
    let lastPostsFromSite = await loadPostsFromSite(lastPageProcessed)

    console.log('Starting to read new posts...')
    console.log('Last page processed: ' + lastPageProcessed)
    console.log('Last post processed: ' + lastPostIdProcessed)

    let result = await processReceivedPosts(lastPostsFromSite, lastPageProcessed, lastPostIdProcessed);

    if (result.nextPosts.length !== 0) {
        if (result.lastPageRead) {
            await saveLastPageRead(client, result.lastPageRead)
        }
        await saveLastPostRead(client, result.lastPostRead)
    }
    client.end()
    return result.nextPosts
}

async function processReceivedPosts(lastPostsFromSite, lastPageProcessed, lastPostIdProcessed) {
    let lastPostIdJustRead = getLastItemId(lastPostsFromSite)
    console.log('Last post id just read: ' + lastPostIdJustRead)
    if (lastPostIdJustRead === lastPostIdProcessed) {
        let nextPageToBeRead = lastPageProcessed + 1
        console.log('Last post read is the same as the last one notified, checking next page: ' + nextPageToBeRead)
        let nextPosts = await loadPostsFromSite(nextPageToBeRead)
        if (nextPosts.length === 0) {
            console.log('No posts in next page')
            return {
                nextPosts: [],
            }
        }
        const lastPostIdFromNextPage = nextPosts[nextPosts.length - 1].id
        if (lastPostIdFromNextPage > lastPostIdProcessed) {
            console.log('New posts found in next page')
            nextPosts = nextPosts.filter(it => it.id > lastPostIdProcessed)
            return {
                nextPosts: nextPosts,
                lastPageRead: nextPageToBeRead,
                lastPostRead: getLastItemId(nextPosts)
            }
        } else {
            console.log('Next page returned same results, so, we can safely assume next page does not exist yet')
            return {
                nextPosts: []
            }
        }
    } else if (lastPostIdJustRead > lastPostIdProcessed) {
        console.log('New posts to notify read from last page')
        lastPostsFromSite = lastPostsFromSite
            .filter(it => it.id > lastPostIdProcessed)
        return {
            nextPosts: lastPostsFromSite.filter(it => it.id > lastPostIdProcessed),
            lastPostRead: getLastItemId(lastPostsFromSite)
        }
    } else {

        return {
            nextPosts: [],
        }
    }
}

async function getLastPageProcessed(client) {
    try {
        return await loadConfig(client)
    } catch (e) {
        return 1
    }
}

async function saveLastPostRead(client, post) {
    console.log('Will update LAST_POST configured, will save ' + post)
    await updateLastPost(client, post)
}

async function saveLastPageRead(client, page) {
    console.log('Will update LAST_PAGE configured, will save ' + page)
    await updateLastPage(client, page)
}
