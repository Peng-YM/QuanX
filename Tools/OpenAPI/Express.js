function express() {
  // route handlers
  const handlers = [];

  // http methods
  const METHODS_NAMES = [
    "GET",
    "POST",
    "PUT",
    "DELETE",
    "PATCH",
    "OPTIONS",
    "HEAD'",
    "ALL",
  ];

  // dispatch url to route
  const dispatch = (request, start = 0) => {
    const {method, url, headers, body} = request;
    method = method.toUpperCase();
    const { path, query } = extractURL(url);
    let handler = null;
    let i;

    for (i = start; i < handlers.length; i++) {
      if (handlers[i].method === "ALL" || method === handlers[i].method) {
        const { pattern } = handlers[i];
        if (patternMatched(pattern, path)) {
          handler = handlers[i];
          break;
        }
      }
    }
    if (handler) {
      // dispatch to next handler
      const next = () => {
        dispatch(method, url, i);
      };
      const req = {
        method,
        url,
        path,
        query,
        params: extractPathParams(handler.pattern, path),
        headers,
        body
      };
      const res = Response();
      handler.callback(req, res, next);
    } else {
      // no route, return 404
      const res = Response();
      res.status("404").send("ERROR: 404 not found");
    }
  };

  const app = {};

  // attach http methods
  METHODS_NAMES.forEach((method) => {
    app[method.toLowerCase()] = (pattern, callback) => {
      // add handler
      handlers.push({ method, pattern, callback });
    };
  });

  // chainable route
  app.route = (pattern) => {
    const chainApp = {};
    METHODS_NAMES.forEach((method) => {
      chainApp[method.toLowerCase()] = (callback) => {
        // add handler
        handlers.push({ method, pattern, callback });
        return chainApp;
      };
    });
    return chainApp;
  };

  // start service
  app.start = () => {
    dispatch(...$request);
  };

  return app;

  /************************************************
                  Utility Functions
  *************************************************/

  function Response() {
    let statusCode = "200";
    const { isQX, isLoon, isSurge } = ENV();
    const headers = {
      "Content-Type": "text/plain;charset=UTF-8",
    };
    return new (class {
      status(code) {
        statusCode = code;
        return this;
      }
      send(body = "") {
        const response = {
          status: statusCode,
          body,
          headers,
        };
        if (isQX) {
          $done(...response);
        } else if (isLoon || isSurge) {
          $done({
            response,
          });
        }
      }
      end() {
        this.send();
      }
      html(data) {
        this.set("Content-Type", "text/html;charset=UTF-8");
        this.send(data);
      }
      json(data) {
        this.set("Content-Type", "application/json;charset=UTF-8");
        this.send(JSON.stringify(data));
      }
      set(key, val) {
        headers[key] = val;
        return this;
      }
    })();
  }

  function patternMatched(pattern, path) {
    if (pattern instanceof RegExp && pattern.test(path)) {
      return true;
    } else {
      // normal string pattern
      if (pattern.indexOf(":") === -1) {
        const spath = path.split("/");
        const spattern = pattern.split("/");
        for (let i = 0; i < spattern.length; i++) {
          if (spath[i] !== spattern[i]) {
            return false;
          }
        }
        return true;
      }
      // string pattern with path parameters
      else if (extractPathParams(pattern, path)) {
        return true;
      }
    }
    return false;
  }

  function extractURL(url) {
    // extract path
    const match = url.match(/https?:\/\/[^\/]+(\/[^?]*)/) || [];
    const path = match[1] || "/";

    // extract query string
    const split = url.indexOf("?");
    const query = {};
    if (split !== -1) {
      let hashes = url.slice(url.indexOf("?") + 1).split("&");
      for (let i = 0; i < hashes.length; i++) {
        hash = hashes[i].split("=");
        query[hash[0]] = hash[1];
      }
    }
    return {
      path,
      query,
    };
  }

  function extractPathParams(pattern, path) {
    if (pattern.indexOf(":") === -1) {
      return null;
    } else {
      const params = {};
      for (let i = 0, j = 0; i < pattern.length; i++, j++) {
        if (pattern[i] === ":") {
          let key = [];
          let val = [];
          while (pattern[++i] !== "/" && i < pattern.length) {
            key.push(pattern[i]);
          }
          while (path[j] !== "/" && j < path.length) {
            val.push(path[j++]);
          }
          params[key.join("")] = val.join("");
        } else {
          if (pattern[i] !== path[j]) {
            return null;
          }
        }
      }
      return params;
    }
  }

  function ENV() {
    const isQX = typeof $task != "undefined";
    const isLoon = typeof $loon != "undefined";
    const isSurge = typeof $httpClient != "undefined" && !this.isLoon;
    const isRequest = typeof $request !== "undefined";
    return { isQX, isLoon, isSurge };
  }
}
