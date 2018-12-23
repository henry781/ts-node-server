export const MONGO_COLLECTION = 'mongo:collection';

/**
 * Collection decorator
 * @param {string} name
 * @returns {(target: any) => void}
 */
export function collection(name: string) {

    return (target: any) => {
        Reflect.defineMetadata(MONGO_COLLECTION, name, target.prototype);
    };
}
