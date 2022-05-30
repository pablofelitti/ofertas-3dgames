let processService
let forumDao
let saveLastPostMock = jest.fn().mockImplementation(() => 3)
let saveLastPageMock = jest.fn().mockImplementation(() => 3)
let loadPostsFromSiteMock = jest.fn()

describe("New post appears when next page is requested", function () {

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
                },
                loadLastPageConfig: function () {
                    return []
                },
                loadLastPostConfig: function () {
                    return []
                },
                saveLastPost: saveLastPostMock,
                saveLastPage: saveLastPageMock,
                updateLastPost: function () {

                }
            }
        });
        processService = require('../forum-service')
    })

    //This happens because when you load the new page, if it does not exist, then the same content of the last page is retrieved
    //and a new post may show in between calls
    it('no next page, reloads current page and new post showed up', async function () {
        loadPostsFromSiteMock.mockImplementation((x, y) => {
            if (x === 1) return [{id: 123, message: 'Post 123'}]
            if (x === 2) return [{id: 123, message: 'Post 123'}, {id: 124, message: 'Post 124'}]
        })

        const newPosts = await processService.readNewPosts()

        expect(newPosts.length).toBe(1)
        expect(newPosts[0].id).toBe(124)
    })
})