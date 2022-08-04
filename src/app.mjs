import {SQSClient, SendMessageCommand} from "@aws-sdk/client-sqs"
import {readNewPosts} from "./forum-service.mjs"
import mysql from "mysql2/promise"
import {GetParametersByPathCommand, SSMClient} from "@aws-sdk/client-ssm"

function createMessage(newPost) {
    return newPost.messages.reduce((result, message) => {
        let msgText
        if (message.post_type === "link") {
            msgText = message.link
        } else {
            msgText = message.message
        }
        return result + "\n" + msgText + ""
    }, "");
}

function filterPosts(newPosts) {
    return newPosts.filter(post => post.messages.filter(msg => msg.post_type === "link").length > 0);
}

const ssmClient = new SSMClient({region: 'us-east-1'})
const command = new GetParametersByPathCommand({Path: "/applications-db"})
const ssmResponse = await ssmClient.send(command)

const clientOptions = {
    host: ssmResponse.Parameters.filter(it => it.Name === '/applications-db/host')[0].Value,
    user: ssmResponse.Parameters.filter(it => it.Name === '/applications-db/user')[0].Value,
    password: ssmResponse.Parameters.filter(it => it.Name === '/applications-db/password')[0].Value,
    database: ssmResponse.Parameters.filter(it => it.Name === '/applications-db/database-3dgames')[0].Value,
    ssl: {
        rejectUnauthorized: false
    }
}

export async function handler() {
    let dbClient = await mysql.createConnection(clientOptions)
    let newPosts = await readNewPosts(dbClient)

    let filteredPosts = filterPosts(newPosts)

    for (let post of filteredPosts) {
        let message = createMessage(post)
        await sendQueue(message);
    }
}

async function sendQueue(data) {

    let sqsOrderData = {
        MessageAttributes: {
            "EnvironmentId": {
                DataType: "String",
                StringValue: process.env.ENVIRONMENT
            },
            "Channel": {
                DataType: "String",
                StringValue: "3dgames"
            }
        },
        MessageBody: data,
        QueueUrl: process.env.SQS_QUEUE_URL
    }

    console.log('sending message')
    await new SQSClient({region: 'us-east-1'}).send(new SendMessageCommand(sqsOrderData));
    console.log('message sent')
}