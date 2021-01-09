const gist = new Gist({key: "Sub-Store 数据库", token: "2fba20a50798eb556f2723d95573619b0a9d1e3a"});
gist.upload({
    filename: "Tempest.yaml",
    content: "Test"
}).then(resp => {
    console.log("Uploaded successfully");
    $done();
});

// const token = "2fba20a50798eb556f2723d95573619b0a9d1e3a";
// const http = HTTP({
//     baseURL: "https://api.github.com",
//     headers: {
//         Authorization: `token ${token}`,
//         "User-Agent":
//             "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.141 Safari/537.36",
//     },
//     events: {
//         onResponse: (resp) => {
//             if (/^[45]/.test(String(resp.statusCode))) {
//                 return Promise.reject(`ERROR: ${JSON.parse(resp.body).message}`);
//             } else {
//                 return resp;
//             }
//         },
//     },
// });

// http.get("/gists").then(resp => {
//     JSON.parse(resp.body);
//     $done();
// })


function ENV() {
    const isQX = typeof $task !== "undefined";
    const isLoon = typeof $loon !== "undefined";
    const isSurge = typeof $httpClient !== "undefined" && !isLoon;
    const isJSBox = typeof require == "function" && typeof $jsbox != "undefined";
    const isNode = typeof require == "function" && !isJSBox;
    const isRequest = typeof $request !== "undefined";
    const isScriptable = typeof importModule !== "undefined";
    return {isQX, isLoon, isSurge, isNode, isJSBox, isRequest, isScriptable};
}

function HTTP(defaultOptions = {baseURL: ""}) {
    const {isQX, isLoon, isSurge, isScriptable, isNode} = ENV();
    const methods = ["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS", "PATCH"];
    const URL_REGEX = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/

    function send(method, options) {
        options = typeof options === "string" ? {url: options} : options;
        const baseURL = defaultOptions.baseURL;
        if (baseURL && !URL_REGEX.test(options.url || "")) {
            options.url = baseURL ? baseURL + options.url : options.url;
        }
        options = {...defaultOptions, ...options};
        const timeout = options.timeout;
        const events = {
            ...{
                onRequest: () => {
                },
                onResponse: (resp) => resp,
                onTimeout: () => {
                },
            },
            ...options.events,
        };

        events.onRequest(method, options);

        let worker;
        if (isQX) {
            worker = $task.fetch({method, url: options.url, headers: options.headers, body: options.body});
        } else if (isLoon || isSurge || isNode) {
            worker = new Promise((resolve, reject) => {
                const request = isNode ? require("request") : $httpClient;
                request[method.toLowerCase()](options, (err, response, body) => {
                    if (err) reject(err);
                    else
                        resolve({
                            statusCode: response.status || response.statusCode,
                            headers: response.headers,
                            body,
                        });
                });
            });
        } else if (isScriptable) {
            const request = new Request(options.url);
            request.method = method;
            request.headers = options.headers;
            request.body = options.body;
            worker = new Promise((resolve, reject) => {
                request
                    .loadString()
                    .then((body) => {
                        resolve({
                            statusCode: request.response.statusCode,
                            headers: request.response.headers,
                            body,
                        });
                    })
                    .catch((err) => reject(err));
            });
        }

        let timeoutid;
        const timer = timeout
            ? new Promise((_, reject) => {
                timeoutid = setTimeout(() => {
                    events.onTimeout();
                    return reject(
                        `${method} URL: ${options.url} exceeds the timeout ${timeout} ms`
                    );
                }, timeout);
            })
            : null;

        return (timer
                ? Promise.race([timer, worker]).then((res) => {
                    clearTimeout(timeoutid);
                    return res;
                })
                : worker
        ).then((resp) => events.onResponse(resp));
    }

    const http = {};
    methods.forEach(
        (method) =>
            (http[method.toLowerCase()] = (options) => send(method, options))
    );
    return http;
}

/**
 * Gist backup
 */
function Gist({token, key}) {
    const http = HTTP({
        baseURL: "https://api.github.com",
        headers: {
            Authorization: `token ${token}`,
            "User-Agent":
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.141 Safari/537.36",
        },
        events: {
            onResponse: (resp) => {
                if (/^[45]/.test(String(resp.statusCode))) {
                    return Promise.reject(`ERROR: ${JSON.parse(resp.body).message}`);
                } else {
                    return resp;
                }
            },
        },
    });

    async function locate() {
        return http.get("/gists").then((response) => {
            const gists = JSON.parse(response.body);
            for (let g of gists) {
                if (g.description === key) {
                    return g.id;
                }
                console.log("LOCATED")
            }
            console.log("NOT FOUND")
            return -1;
        });
    }

    this.upload = async function ({filename, content}) {
        const id = await locate();
        const files = {
            [filename]: {content}
        };

        if (id === -1) {
            console.log("CREATING")
            // create a new gist for backup
            return http.post({
                url: "/gists",
                body: JSON.stringify({
                    description: key,
                    public: false,
                    files
                })
            });
        } else {
            // update an existing gist
            return http.patch({
                url: `/gists/${id}`,
                body: JSON.stringify({files})
            });
        }
    };

    this.download = async function (filename) {
        const id = await locate();
        if (id === -1) {
            return Promise.reject("未找到Gist备份！");
        } else {
            try {
                const {files} = await http
                    .get(`/gists/${id}`)
                    .then(resp => JSON.parse(resp.body));
                const url = files[filename].raw_url;
                return await http.get(url).then(resp => resp.body);
            } catch (err) {
                return Promise.reject(err);
            }
        }
    };
}