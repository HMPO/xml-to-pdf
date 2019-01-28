'use strict';

const PDF = require('../../../lib/pdf');

describe('pdf', () => {
    let obj, options, pdf;

    beforeEach(() => {
        // <pdf>
        // <head><title>A Title</title><colors bright="#EEA"></head>
        // <head/>
        // <page><div><hr thickness="4"/><p color="bright">some text</p></div></page>
        // <page>page 2</page>
        // </pdf>

        obj = {
            head: [{
                children: [
                    {
                        '#name': 'title',
                        textContent: 'A Title'
                    },
                    {
                        '#name': 'colors',
                        options: {
                            bright: '#EEA'
                        }
                    }
                ]
            }, {}],
            page: [{
                children: [{
                    '#name': 'div',
                    children: [
                        {
                            '#name': 'hr',
                            thickness: 4
                        },
                        {
                            '#name': 'p',
                            options: { color: 'bright' },
                            children: [{
                                '#name': '__text__',
                                textContent: 'some text'
                            }]
                        }
                    ]
                }]
            }, {
                children: [{
                    '#name': '__text__',
                    textContent: 'page 2'
                }]
            }]
        };

        options = {
            colors: {
                dark: '#333'
            }
        };
    });

    describe('constructor', () => {
        beforeEach(() => {
            sinon.stub(PDF.prototype, 'configure');
        });

        afterEach(() => {
            PDF.prototype.configure.restore();
        });

        it('should set the config to the default extended with options', () => {
            pdf = new PDF(obj, options);
            pdf.config.colors.should.contain.key('grey');
            pdf.config.colors.should.contain.key('dark');
        });

        it('should set the head property to the first head tag', () => {
            pdf = new PDF(obj, options);
            pdf.head.should.equal(obj.head[0]).and.be.an('object');
        });

        it('should set the pages property to the array of pages', () => {
            pdf = new PDF(obj, options);
            pdf.pages.should.equal(obj.page).and.be.an('array');
        });

        it('should call configure with the head object', () => {
            pdf = new PDF(obj, options);
            PDF.prototype.configure.should.have.been.calledWithExactly(pdf.config, pdf.head);
        });

        it('should not call configure if there is no head object', () => {
            delete obj.head;
            pdf = new PDF(obj, options);
            PDF.prototype.configure.should.not.have.been.called;
        });
    });

    describe('configure', () => {
        beforeEach(() => {
            pdf = new PDF(obj, options);
        });

        it('should extend a root node with an xml tree of options', () => {
            let root = {
                a: 11, d: 44
            };
            let tree = {
                options: {
                    a: 1, b: 2, c: 3
                }
            };
            pdf.configure(root, tree);
            root.should.deep.equal({
                a: 1, b: 2, c: 3, d: 44
            });
        });

        it('should recursively extend a tree of options', () => {
            let root = {
                a: 11,
                b: 22,
                c: {
                    d: 44
                }
            };
            let tree = {
                options: {
                    a: 1
                },
                children: [
                    {
                        '#name': 'c',
                        options: {
                            d: 4,
                            e: 5
                        }
                    },
                    {
                        '#name': 'f',
                        options: {
                            g: 7
                        }
                    }
                ]
            };
            pdf.configure(root, tree);
            root.should.deep.equal({
                a: 1,
                b: 22,
                c: {
                    d: 4,
                    e: 5
                },
                f: {
                    g: 7
                }
            });
        });
    });

    describe('setMetaData', () => {
        beforeEach(() => {
            pdf = new PDF(obj, options);
        });

        it('should set title from head', () => {
            let info = {};
            let head = {
                title: [{
                    textContent: 'Old title'
                }, {
                    textContent: 'New title'
                }]
            };
            pdf.setMetaData(info, head);
            info.should.deep.equal({
                Title: 'New title'
            });
        });

        it('should set filename from head', () => {
            let info = {};
            let head = {
                filename: [{
                    textContent: 'filename.pdf'
                }]
            };
            pdf.setMetaData(info, head);
            info.should.deep.equal({
                Filename: 'filename.pdf'
            });
        });

        it('should set meta data from meta tag', () => {
            let info = {};
            let head = {
                title: [{
                    textContent: 'Title tag'
                }],
                meta: [{
                    children: [{
                        '#name': 'author',
                        textContent: 'test'
                    }, {
                        '#name': 'title',
                        textContent: 'Title meta'
                    }, {
                        '#name': 'filename',
                        textContent: 'filename.pdf'
                    }]
                }]
            };
            pdf.setMetaData(info, head);
            info.should.deep.equal({
                Author: 'test',
                Title: 'Title meta',
                Filename: 'filename.pdf'
            });
        });
    });

    describe('convertEdgeOptions', () => {
        beforeEach(() => {
            pdf = new PDF(obj, options);
        });

        it('should set a default for a set of edge options', () => {
            let options = {
                foo: 'bar',
                test: 123
            };
            pdf.convertEdgeOptions(options, 'test');
            options.should.deep.equal({
                foo: 'bar',
                testTop: 123,
                testLeft: 123,
                testRight: 123,
                testBottom: 123
            });
        });

        it('should not overwrite existing settings', () => {
            let options = {
                foo: 'bar',
                test: 123,
                testTop: 456,
                testRight: 789
            };
            pdf.convertEdgeOptions(options, 'test');
            options.should.deep.equal({
                foo: 'bar',
                testTop: 456,
                testLeft: 123,
                testRight: 789,
                testBottom: 123
            });
        });

        it('should not set up a default if not a number', () => {
            let options = {
                foo: 'bar',
                test: 'abc',
                testTop: 456,
                testRight: 789
            };
            pdf.convertEdgeOptions(options, 'test');
            options.should.deep.equal({
                foo: 'bar',
                test: 'abc',
                testTop: 456,
                testRight: 789,
            });
        });
    });

    describe('cleanTagStyle', () => {
        beforeEach(() => {
            pdf = new PDF(obj, {
                colors: {
                    mycolor: '#888'
                },
                fonts: {
                    mysans: 'sans'
                },
                basePath: '/base/path'
            });
            sinon.stub(PDF.prototype, 'convertEdgeOptions');
        });

        afterEach(() => {
            PDF.prototype.convertEdgeOptions.restore();
        });

        it('should lookup the alias for a color', () => {
            let options = { color: 'mycolor' };
            pdf.cleanTagStyle(options);
            options.color.should.equal('#888');
        });

        it('should use the specified color if not an alias', () => {
            let options = { color: '#abc' };
            pdf.cleanTagStyle(options);
            options.color.should.equal('#abc');
        });

        it('should lookup the alias for a background color', () => {
            let options = { backgroundColor: 'mycolor' };
            pdf.cleanTagStyle(options);
            options.backgroundColor.should.equal('#888');
        });

        it('should use the specified background color if not an alias', () => {
            let options = { backgroundColor: '#abc' };
            pdf.cleanTagStyle(options);
            options.backgroundColor.should.equal('#abc');
        });

        it('should lookup the alias for a font', () => {
            let options = { font: 'mysans' };
            pdf.cleanTagStyle(options);
            options.font.should.equal('sans');
        });

        it('should use the specified font if not an alias', () => {
            let options = { font: 'times' };
            pdf.cleanTagStyle(options);
            options.font.should.equal('times');
        });

        it('should resolve the absolute path of a font with a slash', () => {
            let options = { font: '../fonts/times' };
            pdf.cleanTagStyle(options);
            options.font.should.equal('/base/fonts/times');
        });

        it('should call convertEdgeOptions for padding', () => {
            let options = {};
            pdf.cleanTagStyle(options);
            PDF.prototype.convertEdgeOptions.should.have.been.calledWithExactly(options, 'padding');
        });

        it('should call convertEdgeOptions for margin', () => {
            let options = {};
            pdf.cleanTagStyle(options);
            PDF.prototype.convertEdgeOptions.should.have.been.calledWithExactly(options, 'margin');
        });
    });

    describe('getTagOptions', () => {
        beforeEach(() => {
            pdf = new PDF(obj, options);
        });

        it('should throw an error if the tag style is not found', () => {
            expect(() => pdf.getTagOptions('unknown')).to.throw();
        });

        it('should load up the base and tag options for a tag', () => {
            let options = pdf.getTagOptions('span');
            options.should.deep.equal({
                color: 'black',
                display: 'inline',
                font: 'Helvetica',
                marginBottom: 0,
                marginLeft: 0,
                marginRight: 0,
                marginTop: 0,
                paddingBottom: 0,
                paddingLeft: 0,
                paddingRight: 0,
                paddingTop: 0,
                pre: false,
                size: 12
            });
        });

        it('should let atributes on the tag override styles', () => {
            let options = pdf.getTagOptions('span', { display: 'block' });
            options.should.deep.equal({
                color: 'black',
                display: 'block',
                font: 'Helvetica',
                marginBottom: 0,
                marginLeft: 0,
                marginRight: 0,
                marginTop: 0,
                paddingBottom: 0,
                paddingLeft: 0,
                paddingRight: 0,
                paddingTop: 0,
                pre: false,
                size: 12
            });
        });

        it('should let a specified style on the tag override styles', () => {
            pdf.config.styles.bluestyle = {
                color: 'blue'
            };
            let options = pdf.getTagOptions('span', { style: 'bluestyle' });
            options.should.deep.equal({
                style: 'bluestyle',
                color: 'blue',
                display: 'inline',
                font: 'Helvetica',
                marginBottom: 0,
                marginLeft: 0,
                marginRight: 0,
                marginTop: 0,
                paddingBottom: 0,
                paddingLeft: 0,
                paddingRight: 0,
                paddingTop: 0,
                pre: false,
                size: 12
            });
        });

        it('should inherit the behviour of a built in tag when extending the style', () => {
            pdf.config.styles.bluehr = {
                color: 'blue',
                extends: 'hr'
            };
            let options = pdf.getTagOptions('bluehr');
            options.behaviour.should.equal('hr');
        });

        it('should handle extend loops gracefully', () => {
            pdf.config.styles.loop1 = {
                extends: 'loop2'
            };
            pdf.config.styles.loop2 = {
                extends: 'loop1'
            };
            expect(() => pdf.getTagOptions('loop1')).to.not.throw();
        });
    });

    describe('getOptionalPercentageValue', () => {
        beforeEach(() => {
            pdf = new PDF(obj, options);
        });

        it('should pass through a number', () => {
            let result = pdf.getOptionalPercentageValue(123, 1000);
            result.should.equal(123);
        });

        it('should pass through a string of a number', () => {
            let result = pdf.getOptionalPercentageValue('123', 1000);
            result.should.equal(123);
        });

        it('should treat a bad number as zero', () => {
            let result = pdf.getOptionalPercentageValue('abc', 1000);
            result.should.equal(0);
        });

        it('should work out a percentage of the total if value ends with a %', () => {
            let result = pdf.getOptionalPercentageValue('25%', 1000);
            result.should.equal(250);
        });

        it('should default total to 1 if not a number', () => {
            let result = pdf.getOptionalPercentageValue('25%', 'abc');
            result.should.equal(0.25);
        });

        it('should default total to 1 if it is missing', () => {
            let result = pdf.getOptionalPercentageValue('25%');
            result.should.equal(0.25);
        });
    });

    describe('getTagPosition', () => {
        let state;
        beforeEach(() => {
            pdf = new PDF(obj, options);
            let doc = {
                page: {
                    margins: {
                        left: 10,
                        right: 10
                    },
                    width: 1000,
                    height: 1000,
                },
                x: 30,
                y: 10
            };
            state = pdf.initState(doc);
            state.pageWidth = doc.page.width;
            state.pageHeight = doc.page.height;
        });

        it('should get the position of a block element', () => {
            let options = pdf.getTagOptions('div');
            let position = pdf.getTagPosition(state, options);
            position.should.deep.equal({
                height: null,
                left: 10,
                right: 10,
                top: 10,
                width: 980
            });
        });

        it('should get the position of an inline element', () => {
            let options = pdf.getTagOptions('span');
            let position = pdf.getTagPosition(state, options);
            position.should.deep.equal({
                height: null,
                left: 30,
                right: 10,
                top: 10,
                width: 960
            });
        });

        it('should get the position of a block element width height', () => {
            let options = pdf.getTagOptions('div', { height: 20 });
            let position = pdf.getTagPosition(state, options);
            position.should.deep.equal({
                height: 20,
                left: 10,
                right: 10,
                top: 10,
                width: 980
            });
        });

        it('should take into account margins', () => {
            let options = pdf.getTagOptions('div', {
                height: 20,
                marginTop: 1,
                marginBottom: 2,
                marginLeft: 3,
                marginRight: 4
            });
            let position = pdf.getTagPosition(state, options);
            position.should.deep.equal({
                height: 20,
                left: 13,
                right: 14,
                top: 11,
                width: 973
            });
        });

        it('should use top and left as an absolute positions from the edge', () => {
            let options = pdf.getTagOptions('div', {
                left: 20,
                top: 40
            });
            let position = pdf.getTagPosition(state, options);
            position.should.deep.equal({
                height: null,
                left: 20,
                right: 10,
                top: 40,
                width: 970
            });
        });

        it('should use left and right as an absolute positions from the edge', () => {
            let options = pdf.getTagOptions('div', {
                left: 20,
                right: 40
            });
            let position = pdf.getTagPosition(state, options);
            position.should.deep.equal({
                height: null,
                left: 20,
                right: 40,
                top: 10,
                width: 940
            });
        });

        it('should use right and bottom as an absolute positions from the edge', () => {
            let options = pdf.getTagOptions('div', {
                height: 100,
                right: 20,
                width: 500,
                bottom: 30
            });
            let position = pdf.getTagPosition(state, options);
            position.should.deep.equal({
                bottom: 30,
                height: 100,
                left: 480,
                right: 20,
                top: 870,
                width: 500
            });
        });

        it('should use top and bottom as an absolute positions from the edge', () => {
            let options = pdf.getTagOptions('div', {
                top: 100,
                bottom: 30
            });
            let position = pdf.getTagPosition(state, options);
            position.should.deep.equal({
                bottom: 30,
                height: 870,
                left: 10,
                right: 10,
                top: 100,
                width: 980
            });
        });

    });

});
