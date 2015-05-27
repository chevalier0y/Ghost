var _           = require('lodash'),

    setResponseContext = require('./context'),
    getActiveThemePaths = require('./theme-paths'),
    getPostPage = require('./get-post-page'),
    formatPageResponse = require('./format-response').channel,
    handleError = require('./error'),
    setReqCtx   = require('./secure'),

    template    = require('../../helpers/template'),
    config      = require('../../config'),
    filters     = require('../../filters');

function renderChannel(channelOpts) {
    channelOpts = channelOpts || {};

    return function renderChannel(req, res, next) {
        var pageParam = req.params.page !== undefined ? parseInt(req.params.page, 10) : 1,
            options = {
                page: pageParam
            },
            hasSlug,
            filter, filterKey;

        // Add the slug if it exists in the route
        if (channelOpts.route.indexOf(':slug') !== -1) {
            options[channelOpts.name] = req.params.slug;
            hasSlug = true;
        }

        function createUrl(page) {
            var url = config.paths.subdir + channelOpts.route;

            if (hasSlug) {
                url = url.replace(':slug', options[channelOpts.name]);
            }

            if (page && page > 1) {
                url += 'page/' + page + '/';
            }

            return url;
        }

        if (isNaN(pageParam) || pageParam < 1 || (req.params.page !== undefined && pageParam === 1)) {
            return res.redirect(createUrl());
        }

        return getPostPage(options).then(function (page) {
            // If page is greater than number of pages we have, redirect to last page
            if (pageParam > page.meta.pagination.pages) {
                return res.redirect(createUrl(page.meta.pagination.pages));
            }

            setReqCtx(req, page.posts);
            if (channelOpts.filter && page.meta.filters[channelOpts.filter]) {
                filterKey = page.meta.filters[channelOpts.filter];
                filter = (_.isArray(filterKey)) ? filterKey[0] : filterKey;
                setReqCtx(req, filter);
            }

            filters.doFilter('prePostsRender', page.posts, res.locals).then(function (posts) {
                getActiveThemePaths().then(function (paths) {
                    var view = 'index',
                        result,
                        extra = {};

                    if (channelOpts.firstPageTemplate && paths.hasOwnProperty(channelOpts.firstPageTemplate + '.hbs')) {
                        view = (pageParam > 1) ? 'index' : channelOpts.firstPageTemplate;
                    } else if (channelOpts.slugTemplate) {
                        view = template.getThemeViewForChannel(paths, channelOpts.name, options[channelOpts.name]);
                    } else if (paths.hasOwnProperty(channelOpts.name + '.hbs')) {
                        view = channelOpts.name;
                    }

                    if (channelOpts.filter) {
                        extra[channelOpts.name] = (filterKey) ? filter : '';

                        if (!extra[channelOpts.name]) {
                            return next();
                        }

                        result = formatPageResponse(posts, page, extra);
                    } else {
                        result = formatPageResponse(posts, page);
                    }

                    setResponseContext(req, res, function render() {
                        res.render(view, result);
                    });
                });
            });
        }).catch(handleError(next));
    };
}

module.exports = renderChannel;
