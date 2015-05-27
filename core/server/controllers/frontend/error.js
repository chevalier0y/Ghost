function handleError(next) {
    return function (err) {
        return next(err);
    };
}

module.exports = handleError;
