'use strict';

const defaults = {
    basePath: '.',
    document: {
        autoFirstPage: false,
        size: 'A4',
        compress: true,
        margins: {
            top: 36,
            left: 42.5,
            right: 42.5,
            bottom: 36
        }
    },
    colors: {
        grey: '#ddd'
    },
    fonts: {
        regular: 'Helvetica',
        bold: 'Helvetica-Bold',
        fixed: 'Courier'
    },
    styles: {
        '*': {
            display: 'inline',
            margin: 0,
            padding: 0
        },
        span: {
            color: 'black',
            font: 'regular',
            size: 12,
            pre: false
        },
        block: {
            extends: 'span',
            display: 'block',
            width: '100%'
        },
        p: {
            extends: 'block',
            marginTop: 2,
            marginBottom: 5,
            lineGap: 2,
            paragraphGap: 1
        },
        h1: {
            extends: 'block',
            font: 'bold',
            lineGap: 0,
            size: 24
        },
        h2: { extends: 'h1', size: 19, marginTop: 8, marginBottom: 2 },
        h3: { extends: 'h1', size: 15, marginTop: 5, marginBottom: 2 },
        h4: { extends: 'h1', size: 10, marginTop: 5, marginBottom: 2 },
        small: { size: 10 },
        strong: { font: 'bold' },
        hr: {
            color: 'black',
            display: 'block',
            width: '100%',
            marginTop: 2,
            marginBottom: 4,
            thickness: 4
        },
        div: { extends: 'block' },
        indent: {
            extends: 'block',
            paddingLeft: 15,
            color: 'grey',
            thickness: 5,
            marginBottom: -2
        },
        row: {
            extends: 'block'
        },
        column: {
            extends: 'block'
        },
        img: {
            height: null,
            width: null
        },
        br: { display: 'block' },
        a: {
            underline: true,
            color: 'blue'
        }
    }
};

module.exports = defaults;
