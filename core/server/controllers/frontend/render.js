module.exports = function render(options) {
    /*jshint unused:false*/
    return function render(req, res) {
        res.render(res.view, res.data);
    };
};
