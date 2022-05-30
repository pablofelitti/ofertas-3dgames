const AWS = require('aws-sdk')
AWS.config.update({region: 'us-east-1'})
const ssm = new AWS.SSM()
const mysql = require('mysql2/promise')

const getConnection = async function getConnection() {

    const parameters = await getParameters()

    const clientOptions = {
        host: parameters.HOST,
        user: parameters.USER,
        password: parameters.PASSWORD,
        database: parameters.DATABASE,
        ssl: {
            rejectUnauthorized: false
        }
    }

    return mysql.createConnection(clientOptions)
}

const getParameters = async function () {
    const query = {Path: "/applications-db"}
    let ssmResponse = await ssm.getParametersByPath(query).promise();
    return {
        HOST: ssmResponse.Parameters.filter(it => it.Name === '/applications-db/host')[0].Value,
        USER: ssmResponse.Parameters.filter(it => it.Name === '/applications-db/user')[0].Value,
        PASSWORD: ssmResponse.Parameters.filter(it => it.Name === '/applications-db/password')[0].Value,
        DATABASE: ssmResponse.Parameters.filter(it => it.Name === '/applications-db/database-3dgames')[0].Value
    }
}

function loadLastPageProcessed(client) {
    return client
        .query('SELECT value from config where id = \'LAST_PAGE\'')
        .then(queryResult => {
            if (queryResult[0].length === 1) {
                return parseInt(queryResult[0][0].value)
            }
        })
}

function loadLastPostProcessed(client) {
    return client
        .query('SELECT value from config where id = \'LAST_POST\'')
        .then(queryResult => {
            if (queryResult[0].length === 1) {
                return parseInt(queryResult[0][0].value)
            }
        })
}

async function saveLastPost(client, post) {
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

async function updateLastPost(client, post) {
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

async function updateLastPage(client, page) {
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

async function saveLastPage(client, page) {
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

async function loadLastPageConfig(client) {
    return client
        .query('SELECT value from config where id = \'LAST_PAGE\'')
        .then(queryResult => {
            if (queryResult[0].length === 1) {
                return parseInt(queryResult[0][0].value)
            }
        })
}

exports.loadLastPageConfig = loadLastPageConfig
exports.loadLastPageProcessed = loadLastPageProcessed
exports.loadLastPostProcessed = loadLastPostProcessed
exports.saveLastPost = saveLastPost
exports.updateLastPost = updateLastPost
exports.updateLastPage = updateLastPage
exports.saveLastPage = saveLastPage
exports.getConnection = getConnection