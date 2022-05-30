const AWS = require('aws-sdk')
AWS.config.update({region: 'us-east-1'})
const sqs = new AWS.SQS({apiVersion: '2012-11-05'});
const forumService = require('./forum-service')

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

exports.lambdaHandler = async (event, context) => {
    let newPosts = await forumService.readNewPosts()

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
    await sqs.sendMessage(sqsOrderData).promise();
    console.log('message sent')
}