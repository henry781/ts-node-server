import * as chai from 'chai';
import * as sinon from 'sinon';
import {Principal} from './Principal';

describe('Principal', () => {

    const sandbox = sinon.createSandbox();

    const principal = new Principal({
        email: 'test@a.fr',
        firstname: 'Bobby',
        lastname: 'Bob',
        login: '15aa15',
        roles: ['Developper', 'StagiereCafé'],
        token: {token: 'okfopsdfsdfsd5f4sd6f4sd65f', scheme: 'bearer', params: undefined},
    });

    beforeEach(() => {
        sandbox.restore();
    });

    /**
     * hasRole
     */
    describe('hasRole', () => {

        it('should return false', () => {
            chai.expect(principal.hasRole('admin')).to.be.false;
        });

        it('roles array,  should return false', () => {
            chai.expect(principal.hasRole(['admin', 'admin-form'])).to.be.false;
        });

        it('should return true', () => {
            chai.expect(principal.hasRole('Developper')).to.be.true;
        });

        it('roles array,  should return true', () => {
            chai.expect(principal.hasRole(['admin', 'Developper'])).to.be.true;
        });
    });
});