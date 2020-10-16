import {expect} from 'chai';
import nock from 'nock';
import {isString, jsonObject, jsonProperty} from 'tipify';
import {Principal} from '../auth/Principal';
import {SimpleClient} from './SimpleClient';
import {SimpleClientError} from './SimpleClientError';

describe('SimpleClient', () => {

    const client = new SimpleClient();
    const principal = new Principal({
        login: 'someone',
        token: {token: 'okfopsdfsdfsd5f4sd6f4sd65f', scheme: 'bearer', params: undefined},
        params: {
            clientHeaders: {
                'extra-header': 'header value'
            }
        }
    });

    @jsonObject()
    class Person {
        @jsonProperty('firstname')
        public firstName: string;
        @jsonProperty('lastname')
        public lastName: string;
    }

    const basePath = 'https://api.test.com';
    const path = '/api/person';
    const fullPath = basePath + path;
    const json = {
        firstname: 'steve',
        lastname: 'jobs'
    };

    describe('get', () => {

        describe('with authentication', () => {

            it('should set auth header from principal', async () => {

                // MOCK
                const scope = nock(basePath)
                    .get(path)
                    .matchHeader('authorization', 'bearer okfopsdfsdfsd5f4sd6f4sd65f')
                    .reply(200, json);

                // TEST
                await client.get(fullPath, {mode: 'json', principal});

                // VERIFY
                expect(scope.isDone()).to.be.true;
            });

            it('should set auth header from token', async () => {

                // MOCK
                const scope = nock(basePath)
                    .get(path)
                    .matchHeader('authorization', 'token')
                    .reply(200, json);

                // TEST
                await client.get(fullPath, {mode: 'json', principal, token: 'token'});

                // VERIFY
                expect(scope.isDone()).to.be.true;
            });

            it('should set client headers from token', async () => {

                // MOCK
                const scope = nock(basePath)
                    .get(path)
                    .matchHeader('extra-header', 'header value')
                    .reply(200, json);

                // TEST
                await client.get(fullPath, {mode: 'json', principal});

                // VERIFY
                expect(scope.isDone()).to.be.true;
            });
        });

        describe('when nok', () => {

            it('should return error when status is not expected', async () => {
                // MOCK
                const scope = nock(basePath)
                    .get(path)
                    .reply(401, 'Not Authorized');

                // TEST
                try {
                    await client.get(fullPath, {mode: 'json'});
                    expect.fail();
                } catch (e) {
                    // VERIFY
                    expect(e).instanceof(SimpleClientError);
                    const clientError = e as SimpleClientError;
                    expect(clientError.responseStatus).equals(401);
                    expect(clientError.responseBody).equals('Not Authorized');
                    expect(scope.isDone()).to.be.true;
                }
            });

            it('should return response body when status is not expected', async () => {
                // MOCK
                const expectedErrorBody = {reason: 'Not Authorized'};
                const scope = nock(basePath)
                    .get(path)
                    .reply(401, expectedErrorBody);

                // TEST
                try {
                    await client.get(fullPath, {mode: 'json'});
                    expect.fail();
                } catch (e) {
                    // VERIFY
                    expect(e).instanceof(SimpleClientError);
                    const clientError = e as SimpleClientError;
                    expect(clientError.responseStatus).equals(401);
                    expect(clientError.responseBody).deep.equal(expectedErrorBody);
                    expect(scope.isDone()).to.be.true;
                }
            });
        });

        describe('when ok', () => {

            let scope: nock.Scope;

            beforeEach(() => {
                scope = nock(basePath)
                    .get(path)
                    .reply(200, json);
            });

            describe('when json', () => {

                it('should return json', async () => {

                    // TEST
                    const result = await client.get(fullPath, {mode: 'json'});

                    // VERIFY
                    expect(result).deep.equal(json);
                    expect(scope.isDone()).to.be.true;
                });

                it('should return person', async () => {

                    // TEST
                    const result = await client.get<Person>(fullPath, {
                        mode: 'json',
                        deserializeType: Person
                    });

                    // VERIFY
                    expect(result).instanceOf(Person);
                    expect(result.firstName).equal(json.firstname);
                    expect(result.lastName).equal(json.lastname);
                    expect(scope.isDone()).to.be.true;
                });

                it('should return custom result', async () => {

                    // TEST
                    const result = await client.get<string>(fullPath, {
                        mode: 'json',
                        deserializer: (data) => data.firstname + '-' + data.lastname,
                    });

                    // VERIFY
                    expect(result).equals('steve-jobs');
                    expect(scope.isDone()).to.be.true;
                });
            });

            describe('when response', () => {

                it('should return response', async () => {

                    // TEST
                    const result = await client.get(basePath + path, {mode: 'response'});

                    // VERIFY
                    expect(await result.json()).deep.equal(json);
                    expect(scope.isDone()).to.be.true;
                });

                it('should return text', async () => {

                    // TEST
                    const result = await client.get(fullPath, {mode: 'response'});

                    // VERIFY
                    const text = await result.text();
                    expect(isString(text)).to.be.true;
                    expect(JSON.parse(text)).deep.equal(json);
                    expect(scope.isDone()).to.be.true;
                });
            });
        });
    });

    describe('post', () => {

        describe('when form', () => {

            it('should return response', async () => {

                // MOCK
                const scope = nock(basePath)
                    .matchHeader('content-type', new RegExp('application\/x-www-form-urlencoded'))
                    .post(path, new RegExp('^name=steve$', 'm'))
                    .reply(200, json);

                // TEST
                const result = await client.post(fullPath, {
                    form: {
                        name: 'steve'
                    },
                    mode: 'json'
                });

                // VERIFY
                expect(result).deep.equal(json);
                expect(scope.isDone()).to.be.true;
            });
        });

        describe('when json', () => {

            it('should serialize', () => {

            });
        });
    });
});
