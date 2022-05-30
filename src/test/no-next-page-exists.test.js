let processService
let forumDao
let loadPostsFromSiteMock = jest.fn()

describe("Posts are loaded from the site", function () {

    beforeEach(function () {
        forumWebInterpreter = jest.mock('../forum-web-interpreter', () => {
            return {
                loadPostsFromSite: loadPostsFromSiteMock
            }
        })
        forumDao = jest.mock('../forum-dao', () => {
            return {
                getConnection: function () {
                    return {
                        end: function () {
                        }
                    }
                },
                loadLastPageProcessed: function () {
                    return 1
                },
                loadLastPostProcessed: function () {
                    return 123
                }
            }
        })
        processService = require('../forum-service')
    })

    it('returns new post from the next page but there is no next page', async function () {
        loadPostsFromSiteMock.mockImplementation(x => {
            if (x === 1) return [{id: 123, message: 'Post 123'}]
            if (x === 2) return [{id: 123, message: 'Post 123'}]
        })

        const newPosts = await processService.readNewPosts()

        expect(newPosts.length).toBe(0)
    })
})