import * as chai from 'chai';
import {collection} from './collection.decorator';
import {MongoService} from './MongoService';

/**
 * Collection decorator
 */
describe('collection', () => {

    /**
     * should define collection metadata
     */
    it('should define metadata', () => {

        @collection('users')
        class User {
        }

        const collectionName = MongoService.getCollectionForType(User);
        chai.expect(collectionName).not.undefined;
        chai.expect(collectionName).equal('users');
    });
});
