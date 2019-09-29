const ArticlesService = require('../src/articles-service')
const knex = require('knex')

describe('Articles service object', () =>{
    let db 
    let testArticles = [
        {
            id: 1,
            date_published: new Date(),
            title: 'First test post!',
            content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?'
        },
        {
            id: 2,
            date_published: new Date(),
            title: 'Second test post!',
            content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum, exercitationem cupiditate dignissimos est perspiciatis, nobis commodi alias saepe atque facilis labore sequi deleniti. Sint, adipisci facere! Velit temporibus debitis rerum.'
        },
        {
            id: 3,
            date_published: new Date(),
            title: 'Third test post!',
            content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Possimus, voluptate? Necessitatibus, reiciendis? Cupiditate totam laborum esse animi ratione ipsa dignissimos laboriosam eos similique cumque. Est nostrum esse porro id quaerat.'
        }
    ]
    
    before('make knex instance', () =>{
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
    })

    after('disconnect from db', () => db.destroy())

    before('clean the table', () => db('blogful_articles').truncate())

    afterEach(() => db('blogful_articles').truncate())

    context(`Given 'blogful_articles' has data`, () =>{
        beforeEach(() =>{
            return db
                .into('blogful_articles')
                .insert(testArticles)
        })
    
        describe(`getAllArticles()`, () => {
            it(`resolves all articles from 'blogful_articles' table`, () => {
                // test that ArticlesService.getAllArticles gets data from table
                return ArticlesService.getAllArticles(db)
                    .then(actual =>{
                        expect(actual).to.eql(testArticles)
                    })
            })
        })

        it(`getById() resolves an article by id from 'blogful_articles' table`, () =>{
            const thirdId = 3
            const thirdTestArticle = testArticles[thirdId-1]

            return ArticlesService.getById(db, thirdId)
                .then(actual =>{
                    expect(actual).to.eql({
                        id: thirdId,
                        title: thirdTestArticle.title,
                        content: thirdTestArticle.content,
                        date_published: thirdTestArticle.date_published,
                    })
                })
        })

        it(`deleteArticle() removes an article by id from 'blogful_articles' table`, () =>{
            const deletedArticleId = 3
            
            return ArticlesService.deleteArticle(db, deletedArticleId)
                .then(() => ArticlesService.getAllArticles(db, ))
                .then(allArticles =>{
                    //copy the rest of the array without 'deleted' article
                    const expected = testArticles.filter(article => article.id !== deletedArticleId)

                    expect(allArticles).to.eql(expected)
                })
        })

        it(`updatedArticle() updates an article from 'blogful_articles' table`, () =>{
            const idOfArticleToUpdate = 3
            const newArticleData = {
                title: 'updated title',
                content: 'updated content',
                date_published: new Date(),
            }

            return ArticlesService.updateArticle(db, idOfArticleToUpdate, newArticleData)
                .then(() => ArticlesService.getAllArticles(db, idOfArticleToUpdate))
                .then(() => ArticlesService.getById(db, idOfArticleToUpdate))
                .then(article =>{
                    expect(article).to.eql({
                        id: idOfArticleToUpdate,
                        ...newArticleData,
                    })
                })
        })
    })

    context(`Given 'blogful_articles' has no data`, () =>{
        it(`getAllArticles() resolves an empty array`, () =>{
            return ArticlesService.getAllArticles(db)
                .then(actual =>{
                    expect(actual).to.eql([])
                })
        })
    })

    describe(`insertArticle()`, () =>{
        it(`inserts a new article and resolves the new article with an 'id'`, () =>{
            //tests ArticlesService.insertArticle()
            const newArticle = {
                title: 'Test new title',
                content: 'test new content',
                date_published: new Date(),
            }

            return ArticlesService.insertArticle(db, newArticle)
                .then(actual =>{
                    expect(actual).to.eql({
                        id: 1,
                        title: newArticle.title,
                        content: newArticle.content,
                        date_published: newArticle.date_published,
                    })
                })
        })
    })
})