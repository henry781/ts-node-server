import * as chai from 'chai';
import {Util} from './Util';

/**
 * Util
 */
describe('Util', () => {

    describe('isTrue', () => {

        it('should return true, when argument is true (boolean)', () => {
            chai.expect(Util.isTrue(true)).to.be.true;
        });

        it('should return true, when argument is false (boolean)', () => {
            chai.expect(Util.isTrue(false)).to.be.false;
        });

        it('should return true, when argument is true (string)', () => {
            chai.expect(Util.isTrue('true')).to.be.true;
        });

        it('should return true, when argument is false (string)', () => {
            chai.expect(Util.isTrue('false')).to.be.false;
        });

    });
});
