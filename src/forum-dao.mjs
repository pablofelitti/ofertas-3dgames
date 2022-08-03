
export function loadLastPageProcessed(client) {
    return client
        .query('SELECT value from config where id = \'LAST_PAGE\'')
        .then(queryResult => {
            if (queryResult[0].length === 1) {
                return parseInt(queryResult[0][0].value)
            }
        })
}

export function loadLastPostProcessed(client) {
    return client
        .query('SELECT value from config where id = \'LAST_POST\'')
        .then(queryResult => {
            if (queryResult[0].length === 1) {
                return parseInt(queryResult[0][0].value)
            }
        })
}

export async function saveLastPost(client, post) {
    try {
        await client.query('BEGIN')
        await client.query('insert into config (id, value) values (?, ?)', ['LAST_POST', post])
        await client.query('COMMIT')
        console.log('LAST_POST saved with page ' + post)
    } catch (e) {
        await client.query('ROLLBACK')
        throw e
    }
}

export async function updateLastPost(client, post) {
    try {
        await client.query('BEGIN')
        await client.query('update config set value = ? where id = \'LAST_POST\'', [post])
        await client.query('COMMIT')
        console.log('LAST_POST updated with page ' + post)
    } catch (e) {
        await client.query('ROLLBACK')
        throw e
    }
}

export async function updateLastPage(client, page) {
    try {
        await client.query('BEGIN')
        await client.query('update config set value = ? where id = \'LAST_PAGE\'', [page])
        await client.query('COMMIT')
        console.log('LAST_PAGE updated with page ' + page)
    } catch (e) {
        await client.query('ROLLBACK')
        throw e
    }
}

export async function saveLastPage(client, page) {
    try {
        await client.query('BEGIN')
        await client.query('insert into config (id, value) values (?, ?)', ['LAST_PAGE', page])
        await client.query('COMMIT')
        console.log('LAST_PAGE saved with page ' + page)
    } catch (e) {
        await client.query('ROLLBACK')
        throw e
    }
}

export async function loadLastPageConfig(client) {
    return client
        .query('SELECT value from config where id = \'LAST_PAGE\'')
        .then(queryResult => {
            if (queryResult[0].length === 1) {
                return parseInt(queryResult[0][0].value)
            }
        })
}
