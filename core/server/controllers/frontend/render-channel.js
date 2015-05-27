var _           = require('lodash'),

    getPostPage = require('./get-post-page'),
    handleError = require('./error'),
    setReqCtx   = require('./secure'),

    composer    = require('./composer'),
    config      = require('../../config'),
    filters     = require('../../filters');

// NOTE: helper function composes a URL to redirect to, should not be here.
function createUrl(channelOpts, page) {
    var url = config.paths.subdir + channelOpts.route;

    if (channelOpts.slug) {
        url = url.replace(':slug', channelOpts.slug);
    }

    if (page && page > 1) {
        url += 'page/' + page + '/';
    }

    return url;
}

function getViewTemplates(channelOpts, pageParam) {
    // Views array should be: ['channel-slug', 'channel', 'index']
    // For home it should be: ['home', 'index']
    var viewTemplates = ['index'];

    if (channelOpts.slugTemplate && channelOpts.slug) {
        viewTemplates.unshift(channelOpts.name);
        viewTemplates.unshift(channelOpts.name + '-' + channelOpts.slug);
    }

    if (channelOpts.firstPageTemplate && pageParam === 1) {
        viewTemplates.unshift(channelOpts.firstPageTemplate);
    }

    return viewTemplates;
}

function renderChannel(channelOpts) {
    channelOpts = channelOpts || {};

    // NOTE: This is a piece of standard middleware, taking req, res, next
    return function renderChannel(req, res, next) {
        // NOTE:  page param handling, for pagination
        var pageParam = req.params.page !== undefined ? parseInt(req.params.page, 10) : 1,
            // NOTE:  options for the API
            options = {
                page: pageParam
            },
            filter, filterKey;

        // NOTE: dynamic handling for fetching channel based on name & slug
        // Add the slug if it exists in the route
        if (channelOpts.route.indexOf(':slug') !== -1) {
            options[channelOpts.name] = req.params.slug;
            channelOpts.slug = req.params.slug;
        }

        // NOTE: more pageParam handling
        if (isNaN(pageParam) || pageParam < 1 || (req.params.page !== undefined && pageParam === 1)) {
            return res.redirect(createUrl(channelOpts));
        }

        // NOTE: get started with fetching data
        // getPostPage fetches the PPP setting, AND does the API call
        // EVERYTHING ABOVE HERE IS PRE DATA FETCH
        return getPostPage(options).then(function (page) {
            // EVERYTHING BELOW HERE IS POST DATA FETCH

            // NOTE: page = our data from the API

            // NOTE: EVEN MORE pageParam handling
            // If page is greater than number of pages we have, redirect to last page
            if (pageParam > page.meta.pagination.pages) {
                return res.redirect(createUrl(channelOpts, page.meta.pagination.pages));
            }

            // NOTE: something to do with secure which needs to GO AWAY
            setReqCtx(req, page.posts);

            // NOTE: filter handling for tag/author channels
            if (channelOpts.filter && page.meta.filters[channelOpts.filter]) {
                filterKey = page.meta.filters[channelOpts.filter];
                filter = (_.isArray(filterKey)) ? filterKey[0] : filterKey;
                setReqCtx(req, filter);
            }

            // NOTE: filters.doFilter
            filters.doFilter('prePostsRender', page.posts, res.locals).then(function (posts) {
                var data = {posts: posts, page: page},
                    extra = {};

                // TODO move all of this into the format response tools
                if (channelOpts.filter) {
                    extra[channelOpts.name] = (filterKey) ? filter : '';

                    if (!extra[channelOpts.name]) {
                        return next();
                    }

                    data.extras = extra;
                }

                return composer({
                    data: data,
                    formatter: 'channel',
                    views: getViewTemplates(channelOpts, pageParam)
                })(req, res);
            });
        }).catch(handleError(next));
    };
}

module.exports = renderChannel;
