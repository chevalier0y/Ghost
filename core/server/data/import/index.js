var when = require('when');

module.exports = function (data, file, version) {
    var importer;

    console.log('file', file);

    if (file.name.indexOf('json') === -1) {
        console.log('this is an error...');
        return when.reject(new Error("Ghost importer requires a .json file"));
    }

    try {
        importer = require('./' + version);
    } catch (ignore) {
        // Zero effs given
    }

    if (!importer) {
        return when.reject("No importer found");
    }

    return importer.importData(data);
};
