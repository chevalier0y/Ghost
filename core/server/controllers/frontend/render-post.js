var setResponseContext = require('./context'),
    getActiveThemePaths = require('./theme-paths'),
    formatResponse = require('./format-response').single,

    template    = require('../../helpers/template');

/*
 * Sets the response context around a post and renders it
 * with the current theme's post view. Used by post preview
 * and single post methods.
 * Returns a function that takes the post to be rendered.
 */
function renderPost(req, res) {
    return function (post) {
        return getActiveThemePaths().then(function (paths) {
            var view = template.getThemeViewForPost(paths, post),
                response = formatResponse(post);

            setResponseContext(req, res, function () {
                res.render(view, response);
            });
        });
    };
}

module.exports = renderPost;
