import * as chai from 'chai';
import * as sinon from 'sinon';
import {Principal} from './Principal';

describe('Principal', () => {

    const sandbox = sinon.createSandbox();

    beforeEach(() => {
        sandbox.restore();
    });

    /**
     * hasRole
     */
    describe('hasRole', () => {

        const principal = new Principal({
            email: 'test@a.fr',
            firstname: 'Bobby',
            lastname: 'Bob',
            login: '15aa15',
            roles: ['Developer', 'ProductOwner'],
            token: {token: 'okfopsdfsdfsd5f4sd6f4sd65f', scheme: 'bearer', params: undefined},
        });

        it('should return false', () => {
            chai.expect(principal.hasRole('admin')).to.be.false;
        });

        it('roles array,  should return false', () => {
            chai.expect(principal.hasRole(['admin', 'admin-form'])).to.be.false;
        });

        it('should return true', () => {
            chai.expect(principal.hasRole('Developer')).to.be.true;
        });

        it('roles array,  should return true', () => {
            chai.expect(principal.hasRole(['admin', 'Developer'])).to.be.true;
        });
    });

    /**
     * Constructor
     */
    describe('constructor', () => {

        describe('when password is set', () => {

            it('should build Basic token', () => {

                const principal = new Principal({
                    login: 'myLogin',
                    password: 'myPassword',
                });

                chai.expect(principal.token).not.undefined;
                chai.expect(principal.token.scheme).equal('Basic');
                chai.expect(principal.token.params).deep.equal({});
                chai.expect(principal.token.token).equal('bXlMb2dpbjpteVBhc3N3b3Jk');
            });
        });
    });
});
