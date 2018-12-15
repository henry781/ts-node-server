import * as chai from 'chai';
import * as sinon from 'sinon';
import {MongoHealthcheck} from './MongoHealthcheck';
import {MongoService} from './MongoService';

describe('MongoHealthcheck', () => {

    const mongoService = sinon.createStubInstance<MongoService>(MongoService);
    const mongoHealthcheck = new MongoHealthcheck(mongoService as any);

    /**
     * Get healthcheck name
     */
    describe('getName', () => {

        it('should return mongodb', () => {
            chai.expect(mongoHealthcheck.getName()).equal('mongodb');
        });
    });

    /**
     * Check mongo health
     */
    describe('check', () => {

        it('should throw an error when db is not master', () => {

            mongoService.isMaster.resolves({
                ismaster: false,
                ok: 0,
                readOnly: true,
            });

            return mongoHealthcheck.check()
                .then(() => chai.expect.fail())
                .catch((err) => chai.expect(err.message).contains('db is not master'));
        });

        it('should throw an error when db is readonly', () => {

            mongoService.isMaster.resolves({
                ismaster: true,
                ok: 0,
                readOnly: false,
            });

            return mongoHealthcheck.check()
                .then(() => chai.expect.fail())
                .catch((err) => chai.expect(err.message).contains('db is readonly'));
        });

        it('should return result when everything is ok', () => {

            mongoService.isMaster.resolves({
                ismaster: true,
                ok: 1,
                readOnly: true,
            });

            return mongoHealthcheck.check()
                .then((result) => chai.expect(result).deep.equal(
                    {
                        ismaster: true,
                        ok: 1,
                        readOnly: true,
                    }))
                .catch(() => chai.expect.fail());
        });
    });
});
