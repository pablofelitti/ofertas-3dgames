const forumWebInterpreter = require('./forum-web-interpreter')
const forumDao = require('./forum-dao')

function getLastItemId(lastPostsFromSite) {
    return lastPostsFromSite[lastPostsFromSite.length - 1].id
}

async function readNewPosts() {
    let client = await forumDao.getConnection()
    let lastPageProcessed = await getLastPageProcessed(client)
    let lastPostIdProcessed = await getLastPostProcessed(client)
    let lastPostsFromSite = await forumWebInterpreter.loadPostsFromSite(lastPageProcessed)

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
    let lastPostIdJustRead = getLastItemId(lastPostsFromSite);
    if (lastPostIdJustRead === lastPostIdProcessed) {
        let nextPageToBeRead = lastPageProcessed + 1
        console.log('Last post read is the same as the last one notified, checking next page: ' + nextPageToBeRead)
        let nextPosts = await forumWebInterpreter.loadPostsFromSite(nextPageToBeRead)
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
        lastPostsFromSite = lastPostsFromSite
            .filter(it => it.id > lastPostIdProcessed)
        console.log('New posts to notify read from last page')
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

async function getLastPostProcessed(client) {
    let result = await forumDao.loadLastPostProcessed(client)

    if (!result) {
        result = 0;
    }

    return result
}

async function getLastPageProcessed(client) {
    let result = await forumDao.loadLastPageProcessed(client)

    if (!result) {
        result = 1
    }

    return result
}

async function saveLastPostRead(client, post) {
    const lastPostConfig = await forumDao.loadLastPostProcessed(client)

    if (lastPostConfig.length === 0) {
        console.log('No LAST_POST configured, will save ' + post)
        await forumDao.saveLastPost(client, post)
    } else {
        console.log('Will update LAST_POST configured, will save ' + post)
        await forumDao.updateLastPost(client, post)
    }
}

async function saveLastPageRead(client, page) {
    const lastPageConfig = await forumDao.loadLastPageConfig(client)

    if (lastPageConfig.length === 0) {
        console.log('No LAST_PAGE configured, will save ' + page)
        await forumDao.saveLastPage(client, page)
    } else {
        console.log('Will update LAST_PAGE configured, will save ' + page)
        await forumDao.updateLastPage(client, page)
    }
}

exports.readNewPosts = readNewPosts