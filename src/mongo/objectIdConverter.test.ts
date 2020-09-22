import {ObjectId} from 'bson';
import * as chai from 'chai';
import {objectIdCustomConverter} from './objectIdCustomConverter';

/**
 * ObjectId converter
 */
describe('ObjectIdConverter', () => {

    /**
     * Serialize
     */
    describe('serialize', () => {

        it('should serialize when object id is undefined', () => {
            chai.expect(objectIdCustomConverter.serialize(undefined)).equal(undefined);
        });

        it('should serialize when object id is a string', () => {
            chai.expect(objectIdCustomConverter.serialize.apply(this, ['1234567890'])).equal('1234567890');
        });

        it('should serialize', () => {
            const objectId = new ObjectId('5c1503a1d82dd127f4c18189');
            chai.expect(objectIdCustomConverter.serialize(objectId)).equal('5c1503a1d82dd127f4c18189');
        });
    });

    /**
     * Deserialize
     */
    describe('deserialize', () => {

        it('should deserialize when undefined', () => {
            chai.expect(objectIdCustomConverter.deserialize(undefined)).equal(undefined);
        });

        it('should deserialize when id is a string', () => {
            chai.expect(objectIdCustomConverter.deserialize('5c1503a1d82dd127f4c18189').toHexString())
                .equal('5c1503a1d82dd127f4c18189');
        });

        it('should serialize when id already an objectId', () => {
            const objectId = new ObjectId('5c1503a1d82dd127f4c18189');
            chai.expect(objectIdCustomConverter.deserialize(objectId)).equal(objectId);
        });
    });
});
