let forumService
let forumDao
let forumWebInterpreter
let saveLastPostMock = jest.fn().mockImplementation(() => 3)
let saveLastPageMock = jest.fn().mockImplementation(() => 3)
let updateLastPostMock = jest.fn().mockImplementation(() => 333)
let loadPostsFromSiteMock = jest.fn()

describe("Posts are retrieved", function () {

    beforeEach(function () {
        forumWebInterpreter = jest.mock('../forum-web-interpreter.mjs', () => {
            return {
                loadPostsFromSite: loadPostsFromSiteMock
            }
        })
        forumDao = jest.mock('../forum-dao.mjs', () => {
            return {
                getConnection: function () {
                    return {
                        end: function () {
                        }
                    }
                },
                loadLastPageConfig: function () {
                    return []
                },
                loadLastPostConfig: function () {
                    return []
                },
                loadLastPageProcessed: function () {
                    return 1
                },
                loadLastPostProcessed: function () {
                    return 123
                },
                saveLastPost: saveLastPostMock,
                saveLastPage: saveLastPageMock,
                updateLastPost: updateLastPostMock
            }
        });
        forumService = require('../forum-service.mjs')
    })

    it("return only new post from same page", async function () {
        loadPostsFromSiteMock.mockReturnValue([{id: 123, message: 'Post 123'}, {id: 124, message: 'Post 124'}])

        const newPosts = await forumService.readNewPosts()

        expect(newPosts.length).toBe(1)
        expect(newPosts[0].id).toBe(124)
    })

    it('returns nothing as there is no newer post in next page', async function () {
        loadPostsFromSiteMock.mockImplementation((page) => {
            if (page === 1) {
                return [{id: 123, message: 'Post 123'}]
            } else if (page === 2) {
                return []
            }
        })

        const newPosts = await forumService.readNewPosts()

        expect(loadPostsFromSiteMock).toHaveBeenCalledWith(1)
        expect(loadPostsFromSiteMock).toHaveBeenCalledWith(2)
        expect(saveLastPostMock).not.toHaveBeenCalled()
        expect(saveLastPageMock).not.toHaveBeenCalled()
        expect(newPosts.length).toBe(0)
    })

    it('returns new posts from the next page', async function () {
        loadPostsFromSiteMock.mockImplementation((page) => {
            if (page === 1) return [{id: 123, message: 'Post 123'}]
            if (page === 2) return [{id: 124, message: 'Post 124'}, {id: 125, message: 'Post 125'}]
        })

        const newPosts = await forumService.readNewPosts()

        expect(newPosts.length).toBe(2)
        expect(newPosts[0].id).toBe(124)
        expect(newPosts[1].id).toBe(125)
    })

    it('returns only new posts from the next page', async function () {
        loadPostsFromSiteMock.mockImplementation((page) => {
            if (page === 1) return [{id: 123, message: 'Post 123'}]
            if (page === 2) return [{id: 124, message: 'Post 124'}, {id: 125, message: 'Post 125'}]
        })

        const newPosts = await forumService.readNewPosts()

        expect(loadPostsFromSiteMock).toHaveBeenCalledWith(1)
        expect(loadPostsFromSiteMock).toHaveBeenCalledWith(2)
        expect(updateLastPostMock).toHaveBeenCalledWith(expect.anything(), 125)
        expect(saveLastPageMock).toHaveBeenCalledWith(expect.anything(), 2)
        expect(newPosts.length).toBe(2)
        expect(newPosts[1].id).toBe(125)
    })
})