'use strict';

const xml2js = require('xml2js');

let xmlToObject = (xml, callback) => {
    let parser = new xml2js.Parser({
        attrkey: 'options',
        charkey: 'textContent',
        childkey: 'children',
        normalizeTags: true,
        trim: true,
        attrValueProcessors: [
            xml2js.processors.parseNumbers,
            xml2js.processors.parseBooleans,
        ],
        explicitArray: true,
        explicitChildren: true,
        preserveChildrenOrder: true,
        charsAsChildren: true,
    });

    parser.parseString(xml, (err, data) => {
        if (err) {
            return callback(err);
        }
        if (!data.pdf) {
            return callback(new Error('Document must be wrapped in a <pdf></pdf> tag'));
        }

        callback(null, data.pdf);
    });
};

module.exports = {
    xmlToObject
};
