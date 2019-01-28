'use strict';

const unmarshal = require('../../../lib/unmarshal');

describe('unmarshal', () => {
    describe('xmlToObject', () => {
        let xml, callback;

        beforeEach(() => {
            callback = sinon.stub();

            xml = '<pdf>' +
            '<tag attrib="value" numberattrib="123" booleanattrib="true"/>' +
            '<text>This is text</text>' +
            '<MixedCaseTag MixedCaseAttrib="true"/>' +
            '<multitag/><multitag/>' +
            '</pdf>';
        });

        it('should be a function with 2 arguments', () => {
            unmarshal.xmlToObject.should.be.a('function').and.have.lengthOf(2);
        });

        it('should callback an error for bad XML', () => {
            unmarshal.xmlToObject('<badxml', callback);
            callback.should.have.been.calledWithExactly(sinon.match.instanceOf(Error));
        });

        it('should callback an error if no pdf tag is given', () => {
            unmarshal.xmlToObject('<xml></xml>', callback);
            callback.should.have.been.calledWithExactly(sinon.match.instanceOf(Error));
        });

        it('should callback an error if no pdf tag is given', () => {
            unmarshal.xmlToObject('<xml></xml>', callback);
            callback.should.have.been.calledWithExactly(sinon.match.instanceOf(Error));
        });

        it('should callback an object for correct XML', () => {
            unmarshal.xmlToObject(xml, callback);
            callback.should.have.been.calledWithExactly(null, sinon.match.object);
        });

        it('should unmarshal XML according to the parser options', () => {
            unmarshal.xmlToObject(xml, callback);
            let result = callback.args[0][1];

            result['#name'].should.equal('pdf');
            result.children.should.be.an('array');
            result.children[0].options.should.deep.equal(result.tag[0].options);
            result.tag[0].options.should.deep.equal({
                attrib: 'value',
                numberattrib: 123,
                booleanattrib: true
            });
            result.multitag.should.be.an('array').and.have.lengthOf(2);
            result.text[0].textContent.should.equal('This is text');
            result.text[0].children[0].should.deep.equal({
                '#name': '__text__',
                textContent: 'This is text'
            });
            result.should.contain.keys('mixedcasetag');
            result.mixedcasetag[0].options.should.contain.keys('MixedCaseAttrib');
        });

    });
});
