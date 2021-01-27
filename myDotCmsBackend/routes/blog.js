var express = require('express');
var router = express.Router();
const axios = require('axios');
const NodeCache = require("node-cache");

var BlogOverview = require('../models/blogoverview');
var BlogCard = require('../models/blogcard');


const root = 'http://localhost:8080'
const blogurl = root + '/api/content/render/false/type/json/query/+contentType:Blog%20+(conhost:48190c8c-42c4-46af-8d1a-0cd5db894797%20conhost:SYSTEM_HOST)%20+languageId:1%20+deleted:false%20+working:true/orderby/modDate%20desc/limit/4/offset/0/type/json'
const blogdetailUrl = root + '/api/content/id/'
const myCache = new NodeCache({ stdTTL: 600, checkperiod: 300 });

function escapeRegExp(string) {
    return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

function replaceBodyImageUrl(body) {
    let replaced = replaceAll(body, "/contentAsset/image", root + "/contentAsset/image");
    replaced = replaceAll(replaced, "/images/blogs", root + "/images/blogs");
    return replaced;
}

function functionMapToBlogOverview(blogResult) {
    if (blogResult) {
        let blogOverview = new BlogOverview();
        let blogArray = [];

        for (let i = 0; i < blogResult.length; i++) {
            let blog = blogResult[i];
            let headerImage = root + blog.image;
            let replacedBody = replaceBodyImageUrl(blog.body);
            let blogCard = new BlogCard(blog.identifier, blog.tags, blog.teaser, blog.modUserName, blog.publishDate, headerImage, replacedBody)
            blogArray.push(blogCard);
        }

        blogOverview.setOverview(blogArray);
        return blogOverview;
    }
}

function functionMapToBlogDetail(blogResult) {
    if (blogResult) {
        if (blogResult.length === 1) {
            let blog = blogResult[0];
            let headerImage = root + blog.image;
            let replacedBody = replaceBodyImageUrl(blog.body);
            let blogCard = new BlogCard(blog.identifier, blog.tags, blog.teaser, blog.modUserName, blog.publishDate, headerImage, replacedBody)
            return blogCard;
        }
        return new BlogCard();
    }

}

/* GET users listing. */
router.get('/blog', function (req, res, next) {

    let cachedValue = myCache.get("blogs");

    if (cachedValue == undefined) {
        //there is no cached value
        axios.get(blogurl)
            .then(response => {
                let overview = functionMapToBlogOverview(response.data.contentlets);
                myCache.set("blogs", overview);
                res.send(overview);
            })
            .catch(error => {
                console.log(error);
            });
    }
    else {
        res.send(cachedValue);
    }
});

router.get('/blog/:id', function (req, res, next) {

    let id = req.params.id;

    if (id) {

        let cacheKey = "blog-" + id;
        let cachedValue = myCache.get(cacheKey);

        if (cachedValue == undefined) {

            let detailUrl = blogdetailUrl + id

            axios.get(detailUrl)
                .then(response => {
                    let detail = functionMapToBlogDetail(response.data.contentlets);
                    myCache.set(cacheKey, detail);
                    res.send(detail);
                })
                .catch(error => {
                    console.log(error);
                });

        } else {
            res.send(cachedValue);
        }
    }
});

module.exports = router;
