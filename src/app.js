require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const {NODE_ENV} = require('./config');
//const logger = require('./logger');
//const uuid = require('uuid/v4');
const ArticlesService = require('./articles-service')

const app = express();
const jsonParser = express.json()

const morganOption = (NODE_ENV === 'production')
    ? 'tiny'
    : 'common';

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

/*app.use(function validateBearerToken(req, res, next){
    const apiToken = process.env.API_TOKEN;
    const authToken = req.get('Authorization');

    if(!authToken || authToken.split(' ')[1] !== apiToken){
        logger.error(`Unauthorized request to path: ${req.path}`);
        return res.status(401).json({error: 'Unauthorized request'})
    }
    next()
})*/

app.get('/articles', (req, res, next) =>{
    const knexInstance = req.app.get('db')

    ArticlesService.getAllArticles(knexInstance)
        .then(articles =>{
            res.json(articles.map(article => ({
                id: article.id,
                title: article.title,
                style: article.style,
                content: article.content,
                date_published: new Date(article.date_published),
            })))
        })
        .catch(next)
})

app.post('/articles', jsonParser, (req, res, next) =>{
    const {title, style, content} = req.body
    const newArticle = {title, style, content}

    ArticlesService.insertArticle(
        req.app.get('db'),
        newArticle
    )
        .then(article =>{
            res
                .status(201)
                .location(`/articles/${article.id}`)
                .json(article)
        })
        .catch(next)
})

app.get('/articles/:article_id', (req, res, next) =>{
    const knexInstance = req.app.get('db')

    ArticlesService.getById(knexInstance, req.params.article_id)
        .then(article =>{
            if(!article) {
                return res.status(404).json({
                    error: {message: `Article doesn't exist`}
                })
            }

            res.json({
                id: article.id,
                title: article.title,
                style: article.style,
                content: article.content,
                date_published: new Date(article.date_published),
            })
        })
        .catch(next)
})

app.get('/', (req, res) =>{
    res.send('Hello, world!');
})

app.use(function errorHandler(error, req, res, next){
    let response
    if(NODE_ENV === 'production'){
        response = {error: {message: 'server error'}}
    } else {
        console.log(error);
        response = {message: error.message, error}
    }
    res.status(500).json(response)
})

module.exports = app;