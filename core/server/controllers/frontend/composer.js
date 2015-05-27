var formatter = require('./format-response'),
    view      = require('./theme-view'),
    context   = require('./context'),
    render    = require('./render');

module.exports = function frontend(options) {
    var _formatter = formatter(options),
         _view    = view(options),
        _context = context(options),
        _render  = render(options);

    return function frontend(req, res, next) {
        /*jshint unused:false*/
        res.data = _formatter ?  _formatter(options.data) : options.data;

        _view(req, res, function () {
            _context(req, res, function () {
                _render(req, res);
            });
        });
    };
};
