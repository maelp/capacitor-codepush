import { Http } from "code-push/script/acquisition-sdk";
import type { Callback } from "./callbackUtil";
import { Verb } from "./http";
import {
  CapacitorHttp,
  type HttpResponse,
  type HttpOptions,
} from "@capacitor/core";

console.log("---- loaded Verb", Verb.GET, Verb.HEAD);

/**
 * XMLHttpRequest-based implementation of Http.Requester.
 */
export class HttpRequester implements Http.Requester {
  private contentType: string | undefined;

  constructor(contentType?: string | undefined) {
    this.contentType = contentType;
  }

  public request(
    verb: Verb,
    url: string,
    callbackOrRequestBody: Callback<Http.Response> | string,
    callback?: Callback<Http.Response>
  ): void {
    console.log("---- calling httpRequester.request");
    var requestBody: any;
    var requestCallback: Callback<Http.Response> = callback!;

    // request(verb, url, callback)
    if (!requestCallback && typeof callbackOrRequestBody === "function") {
      requestCallback = <Callback<Http.Response>>callbackOrRequestBody;
    }

    // request(verb, url, requestBody, callback)
    if (typeof callbackOrRequestBody === "string") {
      requestBody = <string>callbackOrRequestBody;
    }

    if (typeof requestBody === "string") {
      try {
        requestBody = JSON.parse(requestBody); // if it is stringify JSON string, parse
      } catch (e) {
        // do nothing
      }
    }

    var methodName = this.getHttpMethodName(verb);
    console.log("----- methodName", methodName);
    if (methodName === null) {
      return requestCallback(new Error("Method Not Allowed"), null);
    }

    const headers: { [key: string]: string } = {
      "X-CodePush-Plugin-Name": "cordova-plugin-code-push",
      "X-CodePush-Plugin-Version": "1.11.13",
      "X-CodePush-SDK-Version": "3.1.5",
    };
    if (this.contentType) {
      headers["Content-Type"] = this.contentType;
    }
    const options: HttpOptions = {
      method: methodName,
      url,
      headers,
    };
    if (methodName === "GET") {
      options.params = requestBody;
    } else {
      options.data = requestBody;
    }
    CapacitorHttp.request(options).then((nativeRes: HttpResponse) => {
      if (typeof nativeRes.data === "object")
        nativeRes.data = JSON.stringify(nativeRes.data);
      var response: Http.Response = {
        statusCode: nativeRes.status,
        body: nativeRes.data,
      };
      requestCallback && requestCallback(null, response);
    });
  }

  /**
   * Gets the HTTP method name as a string.
   * The reason for which this is needed is because the Http.Verb enum corresponds to integer values from native runtime.
   */
  private getHttpMethodName(verb: Verb): string | null {
    switch (verb) {
      case Verb.GET:
        return "GET";
      case Verb.DELETE:
        return "DELETE";
      case Verb.HEAD:
        return "HEAD";
      case Verb.PATCH:
        return "PATCH";
      case Verb.POST:
        return "POST";
      case Verb.PUT:
        return "PUT";
      case Verb.TRACE:
      case Verb.OPTIONS:
      case Verb.CONNECT:
      default:
        return null;
    }
  }
}
