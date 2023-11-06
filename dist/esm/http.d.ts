import { Callback } from "./callbackUtil";
export declare const enum Verb {
    GET = 0,
    HEAD = 1,
    POST = 2,
    PUT = 3,
    DELETE = 4,
    TRACE = 5,
    OPTIONS = 6,
    CONNECT = 7,
    PATCH = 8
}
export interface Response {
    statusCode: number;
    body?: string;
}
export interface Requester {
    request(verb: Verb, url: string, callback: Callback<Response>): void;
    request(verb: Verb, url: string, requestBody: string, callback: Callback<Response>): void;
}
