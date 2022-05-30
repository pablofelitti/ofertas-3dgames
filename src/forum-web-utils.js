async function getBodyFromPost(page) {
    try {
        await page.waitForSelector('[id^=\'post_\'].postcontainer', {timeout: 5000})
    } catch (error) {
        console.log('Error trying to load posts', error)
        return []
    }
    return await page.evaluate(() => {
            let posts = Array.from(document.querySelectorAll('[id^=\'post_\'].postcontainer'))

            function getChildWithClass(e, clazz) {
                if (e === undefined || e.childNodes === undefined) return
                return Array.from(e.childNodes)
                    .filter(it => it.classList !== undefined)
                    .find(it => it.classList.contains(clazz))
            }

            function getChildWithAttributeStartingWith(e, value, attr) {
                if (e === undefined || e.childNodes === undefined) return
                return Array.from(e.childNodes)
                    .filter(it => it.classList !== undefined)
                    .find(it => it[attr].startsWith(value))
            }

            function getQuoteMessage(e) {
                let bbCodeQuote = getChildWithClass(e, 'bbcode_quote')
                let quoteContainer = getChildWithClass(bbCodeQuote, 'quote_container')
                let message = getChildWithClass(quoteContainer, 'message')
                if (message) return message.innerText
            }

            function getQuoteFrom(e) {
                let bbCodeQuote = getChildWithClass(e, 'bbcode_quote')
                let quoteContainer = getChildWithClass(bbCodeQuote, 'quote_container')
                let message = getChildWithClass(quoteContainer, 'bbcode_postedby')
                if (message) return message.innerText
            }

            function getPostFrom(e) {
                let postDetails = getChildWithClass(e, 'postdetails')
                let userInfo = getChildWithClass(postDetails, 'userinfo')
                let usernameContainer = getChildWithClass(userInfo, 'username_container')
                let memberactionContainer = getChildWithClass(usernameContainer, 'memberaction')
                let usernameLine = getChildWithClass(memberactionContainer, 'username')
                if (usernameLine) return usernameLine.innerText
            }

            function sanitizeText(text) {
                let trimmedText = text.trim()
                if (trimmedText.length === 1) {
                    trimmedText = trimmedText.replace('@', '')
                }

                return trimmedText
            }

            function searchTree(element, matchingNodeType) {
                if (element.nodeName == matchingNodeType) {
                    return element
                } else if (element.children != null) {
                    let i
                    let result = null
                    for (i = 0; result == null && i < element.children.length; i++) {
                        result = searchTree(element.children[i], matchingNodeType)
                    }
                    return result
                }
                return null
            }

            function getPostQuotesAndAnswers(e) {
                let node1 = getChildWithClass(e, 'postdetails')
                let node0 = getChildWithClass(node1, 'postbody')
                let node8 = getChildWithClass(node0, 'postrow')
                let node7 = getChildWithClass(node8, 'content')
                let node9 = getChildWithAttributeStartingWith(node7, 'post_message_', 'id')
                let node6 = getChildWithClass(node9, 'postcontent')

                if (node6) {
                    let messages = []
                    Array.from(node6.childNodes).forEach(elem => {
                        if (elem.nodeType === 1) {
                            if (elem.nodeName === 'A') {
                                messages.push({message: elem.innerText, link: elem.href, post_type: 'link'})
                            } else {
                                let quoteFrom = getQuoteFrom(elem); //TODO si es un link (a) hacerlo parte del mensaje
                                let quoteMessage = getQuoteMessage(elem);
                                if (quoteFrom !== undefined) {
                                    messages.push({messageFrom: quoteFrom, message: quoteMessage, post_type: 'quote'})
                                } else {
                                    let anchor = searchTree(elem, 'A')
                                    if (anchor) {
                                        messages.push({message: anchor.innerText, link: anchor.href, post_type: 'link'})
                                    }
                                }
                            }
                        } else if (elem.nodeType === 3) {
                            let sanitizedText = sanitizeText(elem.nodeValue)
                            if (sanitizedText !== '') {
                                messages.push({message: sanitizedText, post_type: 'answer'})
                            }
                        }
                    })
                    return messages
                }
            }

            let result = []
            posts.forEach(post => {
                result.push({
                    id: parseInt(post.id.replace("post_", "")),
                    name: getPostFrom(post),
                    messages: getPostQuotesAndAnswers(post)
                })
            })

            return result
        }
    )
}

async function openPage(page, firstPage) {
    await page.setJavaScriptEnabled(false)
    return await page.goto('https://foros.3dgames.com.ar/threads/942062-ofertas-online-argentina/page' + firstPage, {
        waitUntil: 'load',
        timeout: 45000
    })
}

async function removeQuotesFromPage(page) {
    let selectorToRemoveElement = ".postrow .content .bbcode_container";
    await page.evaluate((sel) => {
        let elements = document.querySelectorAll(sel);
        for (let i = 0; i < elements.length; i++) {
            elements[i].parentNode.removeChild(elements[i]);
        }
    }, selectorToRemoveElement)
}

async function getIdFromPost(posts, i) {
    return await (await posts[i].getProperty('id')).jsonValue()
}

exports.getBodyFromPost = getBodyFromPost
exports.removeQuotesFromPage = removeQuotesFromPage
exports.openPage = openPage
exports.getIdFromPost = getIdFromPost