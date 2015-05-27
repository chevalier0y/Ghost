/**
 * Main controller for Ghost frontend
 */

/*global require, module */

var _           = require('lodash'),
    api         = require('../../api'),
    rss         = require('../../data/xml/rss'),
    path        = require('path'),
    config      = require('../../config'),
    errors      = require('../../errors'),
    filters     = require('../../filters'),
    Promise     = require('bluebird'),
    routeMatch  = require('path-match')(),
    setReqCtx   = require('./secure'),

    setResponseContext = require('./context'),
    getActiveThemePaths = require('./theme-paths'),
    renderChannel = require('./render-channel'),
    handleError = require('./error'),
    renderPost = require('./render-post'),

    frontendControllers,
    staticPostPermalink = routeMatch('/:slug/:edit?');

frontendControllers = {
    homepage: renderChannel({
        name: 'home',
        route: '/',
        firstPageTemplate: 'home'
    }),
    tag: renderChannel({
        name: 'tag',
        route: '/' + config.routeKeywords.tag + '/:slug/',
        filter: 'tags',
        slugTemplate: true
    }),
    author: renderChannel({
        name: 'author',
        route: '/' + config.routeKeywords.author + '/:slug/',
        filter: 'author',
        slugTemplate: true
    }),
    preview: function (req, res, next) {
        var params = {
                uuid: req.params.uuid,
                status: 'all',
                include: 'author,tags,fields'
            };

        api.posts.read(params).then(function (result) {
            var post = result.posts[0];

            if (!post) {
                return next();
            }

            if (post.status === 'published') {
                return res.redirect(301, config.urlFor('post', {post: post}));
            }

            setReqCtx(req, post);

            filters.doFilter('prePostsRender', post, res.locals)
                .then(renderPost(req, res));
        }).catch(function (err) {
            if (err.errorType === 'NotFoundError') {
                return next();
            }

            return handleError(next)(err);
        });
    },

    single: function (req, res, next) {
        var postPath = req.path,
            params,
            usingStaticPermalink = false;

        api.settings.read('permalinks').then(function (response) {
            var permalink = response.settings[0].value,
                editFormat,
                postLookup,
                match;

            editFormat = permalink.substr(permalink.length - 1) === '/' ? ':edit?' : '/:edit?';

            // Convert saved permalink into a path-match function
            permalink = routeMatch(permalink + editFormat);
            match = permalink(postPath);

            // Check if the path matches the permalink structure.
            //
            // If there are no matches found we then
            // need to verify it's not a static post,
            // and test against that permalink structure.
            if (match === false) {
                match = staticPostPermalink(postPath);
                // If there are still no matches then return.
                if (match === false) {
                    // Reject promise chain with type 'NotFound'
                    return Promise.reject(new errors.NotFoundError());
                }

                usingStaticPermalink = true;
            }

            params = match;

            // Sanitize params we're going to use to lookup the post.
            postLookup = _.pick(params, 'slug', 'id');
            // Add author, tag and fields
            postLookup.include = 'author,tags,fields';

            // Query database to find post
            return api.posts.read(postLookup);
        }).then(function (result) {
            var post = result.posts[0],
                postUrl = (params.edit) ? postPath.replace(params.edit + '/', '') : postPath;

            if (!post) {
                return next();
            }

            function render() {
                // If we're ready to render the page but the last param is 'edit' then we'll send you to the edit page.
                if (params.edit) {
                    params.edit = params.edit.toLowerCase();
                }
                if (params.edit === 'edit') {
                    return res.redirect(config.paths.subdir + '/ghost/editor/' + post.id + '/');
                } else if (params.edit !== undefined) {
                    // reject with type: 'NotFound'
                    return Promise.reject(new errors.NotFoundError());
                }

                setReqCtx(req, post);

                filters.doFilter('prePostsRender', post, res.locals)
                    .then(renderPost(req, res));
            }

            // If we've checked the path with the static permalink structure
            // then the post must be a static post.
            // If it is not then we must return.
            if (usingStaticPermalink) {
                if (post.page) {
                    return render();
                }
                return next();
            }

            // Check if the url provided with the post object matches req.path
            // If it does, render the post
            // If not, return 404
            if (post.url && post.url === postUrl) {
                return render();
            } else {
                return next();
            }
        }).catch(function (err) {
            // If we've thrown an error message
            // of type: 'NotFound' then we found
            // no path match.
            if (err.errorType === 'NotFoundError') {
                return next();
            }

            return handleError(next)(err);
        });
    },
    rss: rss,
    private: function (req, res) {
        var defaultPage = path.resolve(config.paths.adminViews, 'private.hbs');
        return getActiveThemePaths().then(function (paths) {
            var data = {};
            if (res.error) {
                data.error = res.error;
            }

            setResponseContext(req, res, function () {
                if (paths.hasOwnProperty('private.hbs')) {
                    return res.render('private', data);
                } else {
                    return res.render(defaultPage, data);
                }
            });
        });
    }
};

module.exports = frontendControllers;
