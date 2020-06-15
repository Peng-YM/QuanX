function API(name = "untitled", debug = false) {
  class wrapper {
    constructor(name, debug) {
      this.name = name;
      this.debug = debug;

      this.isQX = typeof $task != "undefined";
      this.isLoon = typeof $loon != "undefined";
      this.isSurge = typeof $httpClient != "undefined" && !this.isLoon;
      this.isNode = typeof require == "function";

      this.node = (() => {
        if (this.isNode) {
          const request = require("request");
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
      }
      if (this.isLoon || this.isSurge) return $httpClient.get(options);
      if (this.isNode)
        return new Promise((resolve, reject) => {
          this.node.request(options, (err, response) => {
            if (err) reject(err);
            else resolve(response);
          });
        });
    }

    post(options) {
      if (this.isQX) return $task.fetch(options);
      if (this.isLoon || this.isSurge) return $httpClient.post(options);
      if (this.isNode)
        return new Promise((resolve, reject) => {
          this.node.request.post(options, (err, response) => {
            if (err) reject(err);
            else resolve(response);
          });
        });
    }

    // persistance

    // initialize cache
    initCache() {
      if (this.isQX) return $prefs.valueForKey(this.name) || {};
      if (this.isLoon || this.isSurge)
        return $persistentStore.read(this.name) || {};
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
      const data = this.cache;
      if (this.isQX) $prefs.setValueForKey(data, this.name);
      if (this.isSurge) $persistentStore.write(data, this.name);
      if (this.isNode)
        this.node.fs.writeFileSync(
          `${this.name}.json`,
          JSON.stringify(data),
          { flag: "w" },
          (err) => console.log(err)
        );
    }

    write(data, key) {
      this.log(`SET ${key} = ${data}`);
      this.cache = {
        ...this.cache,
        [key]: data,
      };
    }

    read(key) {
      this.log(`READ ${key}`);
      return this.cache[key];
    }

    delete(key) {
      this.log(`DELETE ${key}`)
      this.write(undefined, key);
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
      if (this.isLoon) $notification.post(title, subtitle, content, url);
      if (this.isNode) console.log(`${title}\n${subtitle}\n${content_}`);
    }

    // other helper functions
    log(msg) {
      if ((this.debug = true)) console.log(msg);
    }

    info(msg) {
      console.log(msg);
    }

    error(msg) {
      this.log("ERROR: " + msg);
    }

    wait(millisec) {
      return new Promise((resolve) => setTimeout(resolve, millisec));
    }

    done(value = {}) {
      this.persistCache();
      if (this.isQX) $done(value);
      if (this.isLoon || this.isSurge) $done(value);
    }

    formatTime(timestamp) {
      const date = new Date(timestamp);
      return `${date.getFullYear()}年${
        date.getMonth() + 1
      }月${date.getDate()}日${date.getHours()}时`;
    }
  }
  return new wrapper(name, debug);
}
