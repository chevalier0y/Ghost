/**
 * # Response config
 *
 * Figures out which context we are currently serving. The biggest challenge with determining this
 * is that the only way to determine whether or not we are a post, or a page, is with data after all the
 *
 */

var config = require('../../config');

function setResponseContext(req, res, next) {
    var contexts = [],
        // @TODO FIX THIS
        data = {},
        pageParam = req.params.page !== undefined ? parseInt(req.params.page, 10) : 1,
        tagPattern = new RegExp('^\\/' + config.routeKeywords.tag + '\\/'),
        authorPattern = new RegExp('^\\/' + config.routeKeywords.author + '\\/'),
        privatePattern = new RegExp('^\\/' + config.routeKeywords.private + '\\/');

    // paged context
    if (!isNaN(pageParam) && pageParam > 1) {
        contexts.push('paged');
    }

    if (req.route.path === '/' + config.routeKeywords.page + '/:page/') {
        contexts.push('index');
    } else if (req.route.path === '/') {
        contexts.push('home');
        contexts.push('index');
    } else if (/\/rss\/(:page\/)?$/.test(req.route.path)) {
        contexts.push('rss');
    } else if (privatePattern.test(req.route.path)) {
        contexts.push('private');
    } else if (tagPattern.test(req.route.path)) {
        contexts.push('tag');
    } else if (authorPattern.test(req.route.path)) {
        contexts.push('author');
    } else if (data && data.post && data.post.page) {
        contexts.push('page');
    } else {
        contexts.push('post');
    }

    res.locals.context = contexts;

    next();
}

module.exports = setResponseContext;
