var _ = require('lodash'),
    config = require('../../config');

module.exports = function view(options) {
    return function view(req, res, next) {
        var activeTheme = req.app.get('activeTheme'),
            themePaths = config.paths.availableThemes[activeTheme];

        res.view = _.find(options.views, function (view) {
            return themePaths.hasOwnProperty(view + '.hbs');
        });

        if (!res.view) {
            res.view = options.views[options.views.length - 1];
        }

        next();
    };
};
