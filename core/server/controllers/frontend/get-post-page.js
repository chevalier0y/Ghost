var api         = require('../../api');

function getPostPage(options) {
    return api.settings.read('postsPerPage').then(function (response) {
        var postPP = response.settings[0],
            postsPerPage = parseInt(postPP.value, 10);

        // No negative posts per page, must be number
        if (!isNaN(postsPerPage) && postsPerPage > 0) {
            options.limit = postsPerPage;
        }
        options.include = 'author,tags,fields';
        return api.posts.browse(options);
    });
}

module.exports = getPostPage;
