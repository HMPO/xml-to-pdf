'use strict';

const unmarshal = require('./unmarshal');
const PDF = require('./pdf');
const fs = require('fs');
const concat = require('concat-stream');

const generate = {
    toStream(xml, basePath, callback) {
        unmarshal.xmlToObject(xml, (err, data) => {
            if (err) return callback(err);

            let pdf, doc;

            try {
                pdf = new PDF(data, { basePath });
                doc = pdf.render();
            } catch (e) {
                return callback(e);
            }

            callback(null, doc);
        });
    },

    toBuffer(xml, basePath, callback) {
        generate.toStream(xml, basePath, (err, doc) => {
            if (err) return callback(err);
            doc.pipe(concat(data => {
                if (doc.filename) data.filename = doc.filename;
                callback(null, data);
            }));
        });
    },

    toFile(xml, basePath, destFile, callback) {
        generate.toStream(xml, basePath, (err, doc) => {
            if (err) return callback(err);
            let stream = fs.createWriteStream(destFile);
            doc.pipe(stream);
            stream.on('finish', callback);
        });
    },
};

module.exports = generate;
