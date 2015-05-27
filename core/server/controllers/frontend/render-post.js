var composer = require('./composer');

function getViewTemplates(post) {
    var viewTemplates = ['post'];
    if (post.page) {
        viewTemplates.unshift('page');
        viewTemplates.unshift('page-' + post.slug);
    }

    return viewTemplates;
}

/*
 * Sets the response context around a post and renders it
 * with the current theme's post view. Used by post preview
 * and single post methods.
 * Returns a function that takes the post to be rendered.
 */
function renderPost(req, res) {
    return function (post) {
        return composer({
            data: post,
            formatter: 'single',
            views: getViewTemplates(post)
        })(req, res);
    };
}

module.exports = renderPost;
