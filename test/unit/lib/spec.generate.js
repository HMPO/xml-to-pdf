'use strict';

const fs = require('fs');
const path = require('path');
const generate = require('../../../lib/generate');
const unmarshal = require('../../../lib/unmarshal');
const PDF = require('../../../lib/pdf');
const ConcatStream = new require('concat-stream');

describe('generate', () => {
    let stubs, xml, locals, callback, basePath;

    beforeEach(() => {
        stubs = {};
        xml = '<pdf></pdf>';
        basePath = '/path';
        locals = {
            foo: 'bar',
            partials: {
                'partial': 'partial/path'
            }
        };
        callback = sinon.stub();
    });

    describe('toStream', () => {
        beforeEach(() => {
            stubs.obj = {};
            sinon.stub(unmarshal, 'xmlToObject').yields(null, stubs.obj);

            stubs.doc = {};
            sinon.stub(PDF.prototype, 'render').returns(stubs.doc);
        });

        afterEach(() => {
            unmarshal.xmlToObject.restore();
            PDF.prototype.render.restore();
        });

        it('should be a function with 4 arguments', () => {
            generate.toStream.should.be.a('function').and.have.lengthOf(4);
        });

        it('should callback with render error', () => {
            let err = new Error();
            unmarshal.xmlToObject.yields(err);
            generate.toStream(xml, basePath, locals, callback);
            callback.should.have.been.calledWithExactly(err);
        });

        it('should render a PDF from the unmarshalled data', () => {
            generate.toStream(xml, basePath, locals, callback);
            PDF.prototype.render.should.have.been.calledWithExactly();
            callback.should.have.been.calledWithExactly(null, stubs.doc);
        });

        it('should callback a PDF rendering error', () => {
            let err = new Error();
            PDF.prototype.render.throws(err);
            generate.toStream(xml, basePath, locals, callback);
            callback.should.have.been.calledWithExactly(err);
        });
    });

    describe('toBuffer', () => {
        beforeEach(() => {
            stubs.doc = {
                pipe: sinon.stub()
            };
            sinon.stub(generate, 'toStream').yields(null, stubs.doc);
        });

        afterEach(() => {
            generate.toStream.restore();
        });

        it('should be a function with 4 arguments', () => {
            generate.toBuffer.should.be.a('function').and.have.lengthOf(4);
        });

        it('should call toStream', () => {
            generate.toBuffer(xml, basePath, locals, callback);
            generate.toStream.should.have.been.calledWithExactly(xml, basePath, locals, sinon.match.func);
        });

        it('should callback with error from toStream', () => {
            let err = new Error();
            generate.toStream.yields(err);
            generate.toBuffer(xml, basePath, locals, callback);
            callback.should.have.been.calledWithExactly(err);
        });

        it('should pipe the document to contact to provide a buffer', done => {
            generate.toBuffer(xml, basePath, locals, callback);
            stubs.doc.pipe.should.have.been.calledWithExactly(sinon.match.instanceOf(ConcatStream));
            let concat = stubs.doc.pipe.getCall(0).args[0];
            concat.write([1, 2, 3]);
            concat.write([4, 5, 6]);
            concat.end();
            concat.on('finish', () => {
                callback.should.have.been.calledWithExactly(null, [1, 2, 3, 4, 5, 6]);
                done();
            });
        });

        it('should copy the filename from the stream', done => {
            stubs.doc.filename = 'filename';
            generate.toBuffer(xml, basePath, locals, callback);
            let concat = stubs.doc.pipe.getCall(0).args[0];
            concat.write([1, 2, 3]);
            concat.end();
            concat.on('finish', () => {
                let data = callback.args[0][1];
                data.filename.should.equal('filename');
                done();
            });

        });

    });

    describe('toFile', () => {
        let destFileName;

        beforeEach(() => {
            destFileName = 'destfile';
            stubs.doc = {
                pipe: sinon.stub(),
            };
            stubs.stream = {
                on: sinon.stub()
            };
            sinon.stub(generate, 'toStream').yields(null, stubs.doc);
            sinon.stub(fs, 'createWriteStream').returns(stubs.stream);
        });

        afterEach(() => {
            generate.toStream.restore();
            fs.createWriteStream.restore();
        });

        it('should be a function with 5 arguments', () => {
            generate.toFile.should.be.a('function').and.have.lengthOf(5);
        });

        it('should call toStream', () => {
            generate.toFile(xml, basePath, locals, destFileName, callback);
            generate.toStream.should.have.been.calledWithExactly(xml, basePath, locals, sinon.match.func);
        });

        it('should callback with error from toStream', () => {
            let err = new Error();
            generate.toStream.yields(err);
            generate.toFile(xml, basePath, locals, destFileName, callback);
            callback.should.have.been.calledWithExactly(err);
        });

        it('should create a file stream with the dest filename', () => {
            generate.toFile(xml, basePath, locals, destFileName, callback);
            fs.createWriteStream.should.have.been.calledWithExactly(destFileName);
        });

        it('should pipe the document to contact to file stream', () => {
            generate.toFile(xml, basePath, locals, destFileName, callback);
            stubs.doc.pipe.should.have.been.calledWithExactly(stubs.stream);
            callback.should.not.have.been.called;
        });

        it('should call the callback when the pipe is complete', () => {
            stubs.stream.on.withArgs('finish').yields(null);
            generate.toFile(xml, basePath, locals, destFileName, callback);
            callback.should.have.been.calledWithExactly(null);
        });

    });

    it('example pdf render', done => {
        let sourcefilename = path.resolve(__dirname, '..', 'fixtures', 'example.xml');
        let examplepdf = path.resolve(__dirname, '..', 'fixtures', 'example.pdf');
        let xml = fs.readFileSync(sourcefilename);
        generate.toBuffer(xml, path.dirname(sourcefilename), {}, (err, buffer) => {
            expect(err).to.be.null;
            // fs.writeFileSync(examplepdf, buffer);
            let pdf = fs.readFileSync(examplepdf);
            buffer.byteLength.should.equal(pdf.byteLength);
            done();
        });
    });

});
