import {ObjectId} from 'bson';
import * as chai from 'chai';
import {ObjectIdConverter} from './ObjectIdConverter';

/**
 * ObjectId converter
 */
describe('ObjectIdConverter', () => {

    const converter = new ObjectIdConverter();

    /**
     * Serialize
     */
    describe('serialize', () => {

        it('should serialize when object id is undefined', () => {
            chai.expect(converter.serialize(undefined)).equal(undefined);
        });

        it('should serialize when object id is a string', () => {
            chai.expect(converter.serialize.apply(this, ['1234567890'])).equal('1234567890');
        });

        it('should serialize', () => {
            const objectId = new ObjectId('5c1503a1d82dd127f4c18189');
            chai.expect(converter.serialize(objectId)).equal('5c1503a1d82dd127f4c18189');
        });
    });

    /**
     * Deserialize
     */
    describe('deserialize', () => {

        it('should deserialize when undefined', () => {
            chai.expect(converter.deserialize(undefined)).equal(undefined);
        });

        it('should deserialize when id is a string', () => {
            chai.expect(converter.deserialize('5c1503a1d82dd127f4c18189').toHexString())
                .equal('5c1503a1d82dd127f4c18189');
        });

        it('should serialize when id already an objectId', () => {
            const objectId = new ObjectId('5c1503a1d82dd127f4c18189');
            chai.expect(converter.deserialize(objectId)).equal(objectId);
        });
    });
});
