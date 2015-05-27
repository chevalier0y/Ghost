var _ = require('lodash'),
    formatters;

formatters = {
    /**
     * similar to formatPageResponse, but for single post pages
     * @return {Object} containing page variables
     */
    single: function formatResponse(post) {
        return {
            post: post
        };
    },
    /**
     * formats variables for handlebars in multi-post contexts.
     * If extraValues are available, they are merged in the final value
     * @return {Object} containing page variables
     */
    channel: function formatChannelResponse(data) {
        var posts = data.posts,
            page = data.page,
            extraValues = data.extras || {},
            resp = {
                posts: posts,
                pagination: page.meta.pagination
            };
        return _.extend(resp, extraValues);
    }
};

module.exports = function formatter(options) {
    if (options.formatter) {
        if (_.isString(options.formatter)) {
            return formatters[options.formatter];
        }

        return options.formatter;
    }
};
