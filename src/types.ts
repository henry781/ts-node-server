import {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify';
import * as http from 'http';
import * as http2 from 'http2';
import {Principal} from './auth/Principal';

export const types = {
    AuthProvider: 'AuthProvider',
    Controller: 'Controller',
    Healthcheck: 'Healthcheck',
    Logger: 'Logger',
    MongoService: 'MongoService',
};

export type HttpRequest = http.IncomingMessage | http2.Http2ServerRequest;
export type HttpResponse = http.ServerResponse | http2.Http2ServerResponse;
export type HttpServer = http.Server | http2.Http2Server;

type RouteGeneric = { Querystring: { [key: string]: (string | string[]) } };

export type Request = FastifyRequest<RouteGeneric> & {
    user?: Principal,
};
export type Reply = FastifyReply;
export type Instance = FastifyInstance<HttpServer, HttpRequest, HttpResponse>;
