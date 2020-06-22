function API(name = "untitled", debug = false) {
  class wrapper {
    constructor(name, debug) {
      this.name = name;
      this.debug = debug;

      this.isQX = typeof $task != "undefined";
      this.isLoon = typeof $loon != "undefined";
      this.isSurge = typeof $httpClient != "undefined" && !this.isLoon;
      this.isNode = typeof require == "function";
      this.isJSBox = this.isNode && typeof $jsbox != "undefined";

      this.node = (() => {
        if (this.isNode) {
          const request =
            typeof $request != "undefined" ? undefined : require("request");
          const fs = require("fs");

          return {
            request,
            fs,
          };
        } else {
          return null;
        }
      })();
      this.cache = this.initCache();
      this.log(`INITIAL CACHE:\n${JSON.stringify(this.cache)}`);

      const delay = (t, v) =>
        new Promise(function (resolve) {
          setTimeout(resolve.bind(null, v), t);
        });

      Promise.prototype.delay = function (t) {
        return this.then(function (v) {
          return delay(t, v);
        });
      };
    }

    // http methods
    get(options) {
      if (this.isQX) {
        if (typeof options == "string")
          options = { url: options, method: "GET" };
        return $task.fetch(options);
      } else {
        return new Promise((resolve, reject) => {
          if (this.isLoon || this.isSurge)
            $httpClient.get(options, (err, response, body) => {
              if (err) reject(err);
              else resolve({ status: response.status, headers: response.headers, body });
            });
          else
            this.node.request(options, (err, response, body) => {
              if (err) reject(err);
              else resolve({ ...response, status: response.statusCode, body });
            });
        });
      }
    }

    post(options) {
      if (this.isQX) {
        if (typeof options == "string") options = { url: options };
        options["method"] = "POST";
        return $task.fetch(options);
      } else {
        return new Promise((resolve, reject) => {
          if (this.isLoon || this.isSurge) {
            $httpClient.post(options, (err, response, body) => {
              if (err) reject(err);
              else resolve({ status: response.status, headers: response.headers, body });
            });
          } else {
            this.node.request.post(options, (err, response, body) => {
              if (err) reject(err);
              else resolve({ ...response, status: response.statusCode, body });
            });
          }
        });
      }
    }

    // persistance

    // initialize cache
    initCache() {
      if (this.isQX) return JSON.parse($prefs.valueForKey(this.name) || "{}");
      if (this.isLoon || this.isSurge)
        return JSON.parse($persistentStore.read(this.name) || "{}");

      if (this.isNode) {
        // create a json file with the given name if not exists
        const fpath = `${this.name}.json`;
        if (!this.node.fs.existsSync(fpath)) {
          this.node.fs.writeFileSync(
            fpath,
            JSON.stringify({}),
            { flag: "wx" },
            (err) => console.log(err)
          );
          return {};
        } else {
          return JSON.parse(this.node.fs.readFileSync(`${this.name}.json`));
        }
      }
    }

    // store cache
    persistCache() {
      const data = JSON.stringify(this.cache);
      this.log(`FLUSHING DATA:\n${data}`);
      if (this.isQX) $prefs.setValueForKey(data, this.name);
      if (this.isLoon || this.isSurge) $persistentStore.write(data, this.name);
      if (this.isNode)
        this.node.fs.writeFileSync(
          `${this.name}.json`,
          data,
          { flag: "w" },
          (err) => console.log(err)
        );
    }

    write(data, key) {
      this.log(`SET ${key} = ${JSON.stringify(data)}`);
      this.cache[key] = data;
      this.persistCache();
    }

    read(key) {
      this.log(`READ ${key} ==> ${JSON.stringify(this.cache[key])}`);
      return this.cache[key];
    }

    delete(key) {
      this.log(`DELETE ${key}`);
      delete this.cache[key];
      this.persistCache();
    }

    // notification
    notify(title, subtitle, content, options) {
      const url = typeof options == "string" ? options : undefined;
      const content_ = content + (url == undefined ? "" : `\n${url}`);

      if (this.isQX) {
        if (url !== undefined)
          $notify(title, subtitle, content, { "open-url": url });
        else $notify(title, subtitle, content, options);
      }
      if (this.isSurge) $notification.post(title, subtitle, content_);
      if (this.isLoon) $notification.post(title, subtitle, content);
      if (this.isNode) {
        if (this.isJSBox) {
          const push = require("push");
          push.schedule({
            title: title,
            body: subtitle ? subtitle + "\n" + content : content,
          });
        } else {
          console.log(`${title}\n${subtitle}\n${content_}\n\n`);
        }
      }
    }

    // other helper functions
    log(msg) {
      if (this.debug) console.log(msg);
    }

    info(msg) {
      console.log(msg);
    }

    error(msg) {
      console.log("ERROR: " + msg);
    }

    wait(millisec) {
      return new Promise((resolve) => setTimeout(resolve, millisec));
    }

    done(value = {}) {
      if (this.isQX || this.isLoon || this.isSurge) {
        $done(value);
      } else if (this.isNode && !this.isJSBox) {
        if (typeof $context !== 'undefined'){
          $context.headers = value.headers;
          $context.statusCode = value.statusCode;
          $context.body = value.body;
        }
      }
    }
  }
  return new wrapper(name, debug);
}
