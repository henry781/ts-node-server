import {AxiosError} from 'axios';
import {expect} from 'chai';
import nock from 'nock';
import {isString, jsonObject, jsonProperty} from 'tipify';
import * as url from 'url';
import {Principal} from '../auth/Principal';
import {simpleClient} from './simpleClient';

describe('simpleClient', () => {

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
                await simpleClient.get(fullPath, {principal});

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
                await simpleClient.get(fullPath, {principal, token: 'token'});

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
                await simpleClient.get(fullPath, {principal});

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
                    await simpleClient.get(fullPath, {});
                    expect.fail();
                } catch (e) {
                    // VERIFY
                    const err = e as AxiosError;
                    expect(err.response.status).equals(401);
                    expect(err.response.data).equals('Not Authorized');
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
                    await simpleClient.get(fullPath, {});
                    expect.fail();
                } catch (e) {
                    // VERIFY
                    const err = e as AxiosError;
                    expect(err.response.status).equals(401);
                    expect(err.response.data).deep.equal(expectedErrorBody);
                    expect(scope.isDone()).to.be.true;
                }
            });
        });

        describe('when ok', () => {

            describe('when json', () => {

                let scope: nock.Scope;

                beforeEach(() => {
                    scope = nock(basePath)
                        .get(path)
                        .reply(200, json);
                });

                it('should return json', async () => {

                    // TEST
                    const result = await simpleClient.get(fullPath, {});

                    // VERIFY
                    expect(result.data).deep.equal(json);
                    expect(scope.isDone()).to.be.true;
                });

                it('should return person', async () => {

                    // TEST
                    const result = await simpleClient.get<Person>(fullPath, {deserializeType: Person});

                    // VERIFY
                    const actualPerson = result.data;
                    expect(actualPerson).instanceOf(Person);
                    expect(actualPerson.firstName).equal(json.firstname);
                    expect(actualPerson.lastName).equal(json.lastname);
                    expect(scope.isDone()).to.be.true;
                });

                it('should return custom result', async () => {

                    // TEST
                    const result = await simpleClient.get<string>(fullPath, {
                        deserializer: (data) => data.firstname + '-' + data.lastname,
                    });

                    // VERIFY
                    expect(result.data).equals('steve-jobs');
                    expect(scope.isDone()).to.be.true;
                });
            });

            describe('when response', () => {

                it('should return text', async () => {

                    const scope = nock(basePath)
                        .get(path)
                        .reply(200, 'text');

                    // TEST
                    const result = await simpleClient.get<string>(fullPath, {responseType: 'text'});

                    // VERIFY
                    const text = result.data;
                    expect(isString(text)).to.be.true;
                    expect(text).deep.equal('text');
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

                const params = new url.URLSearchParams({ name: 'steve' });

                // TEST
                const result = await simpleClient.post(fullPath, params,{
                    serializer: false
                });

                // VERIFY
                expect(result.data).deep.equal(json);
                expect(scope.isDone()).to.be.true;
            });
        });

        describe('when json', () => {

            it('should serialize', () => {

            });
        });
    });
});
