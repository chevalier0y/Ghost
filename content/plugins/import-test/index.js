var importPlugin,
    xml2js = require('xml2js');

importPlugin = {
    activate: function (ghost) {
        ghost.registerFilter('import', function (importer) {
            //console.log('fn', importer.fn);

            return importer;
        });
    },
    deactivate: function (ghost) {
    },
    install: function () {},
    uninstall: function () {}
};

module.exports = importPlugin;