var express = require('express');
var router = express.Router();
const axios = require('axios');
const NodeCache = require("node-cache");

var BlogOverview = require('../models/blogoverview');
var BlogCard = require('../models/blogcard');


const root = 'http://localhost:8080'
const blogroot = root + '/api/content/render/false/type/json/query/';
const blogdetailUrl = root + '/api/content/id/'
const myCache = new NodeCache({ stdTTL: 300, checkperiod: 150 });

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

function createLimitUrl(limit = 6, offset = 0) {
    return `/limit/${limit}/offset/${offset}/type/json`;
}

function createDotCmsQuery(contentType = "Blog", languageId = "1", orderby = "modDate%20desc", offset = 0, limit = 6, tagSearch=null) {
    let query = ""
    if(tagSearch === null){
        query = blogroot + `+contentType:${contentType}%20+languageId:${languageId}%20+deleted:false%20+working:true%20+live:true/orderby/${orderby}` + createLimitUrl(limit, offset);
    } else {
        query = blogroot + `+contentType:${contentType}%20+Blog.tags:%22${tagSearch}%22%20+languageId:${languageId}%20+deleted:false%20+working:true%20+live:true/orderby/${orderby}` + createLimitUrl(limit, offset);
    }
    return query;
}


/* GET users listing. */
router.get('/blog', function (req, res, next) {

    let cachedValue = myCache.get("blogs");

    if (cachedValue == undefined) {
        //there is no cached value
        let url = createDotCmsQuery("Blog", "1", null, 0, 6);
        axios.get(url)
            .then(response => {
                let overview = functionMapToBlogOverview(response.data.contentlets);
                myCache.set("blogs", overview);
                res.json(overview);
            })
            .catch(error => {
                console.log(error);
            });
    }
    else {
        res.json(cachedValue);
    }
});

//To get last 6 Blogs -> http://localhost:3000/api/blog/lastblogsbycount/6
router.get('/blog/lastblogsbycount/:count', function (req, res) {

    let count = req.params.count;
    if (count) {

        let cacheKey = "lastblogsbycount-" + count
        let cachedValue = myCache.get(cacheKey);
        if (cachedValue == undefined) {
            let url = createDotCmsQuery("Blog", "1", null, 0, count);
            axios.get(url)
                .then(response => {
                    let overview = functionMapToBlogOverview(response.data.contentlets);
                    myCache.set(cacheKey, overview);
                    res.json(overview);
                })
                .catch(error => {
                    console.log(error);
                });
        }
        else {
            res.json(cachedValue);
        }
    }
});

// start : starting index, 0 means first item 
// count : how many items you want
//Sample1 : http://localhost:3000/api/blog/start/0/count/3
//Sample2 : http://localhost:3000/api/blog/start/2/count/5 
router.get('/blog/start/:offset/count/:limit', function (req, res) {

    let limit = req.params.limit;
    let offset = req.params.offset;

    if (limit && offset) {

        let cacheKey = "offset-" + offset + "limit-" + limit
        let cachedValue = myCache.get(cacheKey);
        if (cachedValue == undefined) {
            let url = createDotCmsQuery("Blog", "1", null, offset, limit);
            axios.get(url)
                .then(response => {
                    let overview = functionMapToBlogOverview(response.data.contentlets);
                    myCache.set(cacheKey, overview);
                    res.json(overview);
                })
                .catch(error => {
                    console.log(error);
                });
        }
        else {
            res.json(cachedValue);
        }
    }
});

//Sample 1: http://localhost:3000/api/blog/detail/4badeaad-809e-468d-9cfe-8cbb20b5d11a
router.get('/blog/detail/:id', function (req, res) {

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
                    res.json(detail);
                })
                .catch(error => {
                    console.log(error);
                });

        } else {
            res.json(cachedValue);
        }
    }
});

//Sample 1: http://localhost:3000/api/blog/lastblogsbytag/ta/1
router.get('/blog/lastblogsbytag/:tag/:count', function (req, res) {

    let tag = req.params.tag;
    console.log(tag)
    if (tag) {
        let count = req.params.count;
        console.log(count)
        let tagStr= tag.toString();
        let cacheKey = "lastblogsbytag-" + tagStr
        let cachedValue = myCache.get(cacheKey);
        if (cachedValue == undefined) {
            let url = createDotCmsQuery("Blog", "1", "score,modDate%20desc", null, count, tagStr);
            axios.get(url)
                .then(response => {
                    let overview = functionMapToBlogOverview(response.data.contentlets);
                    myCache.set(cacheKey, overview);
                    res.json(overview);
                })
                .catch(error => {
                    console.log(error);
                });
        }
        else {
            res.json(cachedValue);
        }
    }
});

module.exports = router;
