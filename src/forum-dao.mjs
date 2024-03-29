
export function loadConfig(client) {
    return client
        .query("SELECT value from config where id in (\'LAST_PAGE\', \'LAST_POST\')")
        .then(queryResult => {
            return {'lastPage': parseInt(queryResult[0][0].value), 'lastPost': parseInt(queryResult[0][1].value) }
        })
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
