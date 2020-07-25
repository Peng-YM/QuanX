const $http = HTTP();
const headers = {
    "user-agent": "OpenAPI",
}
const rawBody = "This is expected to be sent back as part of response body.";
const jsonBody = {
    HELLO: "WORLD",
    FROM: "OpenAPI"
}

function assertEqual(a, b) {
    for (let [key, value] of Object.entries(a)) {
        if (a[key] !== b[key]) {
            return false;
        }
    }
    return true;
}

!(async () => {
    await $http.get({
        url: "https://postman-echo.com/get?foo1=bar1&foo2=bar2",
        headers
    }).then(response => {
        const body = JSON.parse(response.body);
        if (!assertEqual(headers, body.headers)) {
            console.log("ERROR: HTTP GET with header test failed!");
        } else {
            console.log("OK: HTTP GET with header test");
        }
    })

    await $http.put({
        url: "https://postman-echo.com/put",
        body: rawBody,
        headers: {
            'content-type': 'text/plain'
        }
    }).then(response => {
        const body = JSON.parse(response.body);
        if (body.data !== rawBody) {
            console.log("ERROR: HTTP PUT with raw body test failed!");
        } else {
            console.log("OK: HTTP PUT with raw body test");
        }
    });

    await $http.patch({
        url: "https://postman-echo.com/patch",
        body: JSON.stringify(jsonBody)
    }).then(response => {
        const body = JSON.parse(response.body);
        if (!assertEqual(body.data, jsonBody)) {
            console.log("ERROR: HTTP PATCH with json body test failed!");
        } else {
            console.log("OK: HTTP PATCH with json body test");
        }
    })
})().then(() => $done()).catch(err => console.log("ERROR: " + err));




function ENV() {
    const isQX = typeof $task != "undefined";
    const isLoon = typeof $loon != "undefined";
    const isSurge = typeof $httpClient != "undefined" && !this.isLoon;
    const isJSBox = typeof require == 'function' && typeof $jsbox != "undefined";
    const isNode = typeof require == "function" && !isJSBox;

    return { isQX, isLoon, isSurge, isNode, isJSBox }
}

function HTTP(baseURL) {
    const { isQX, isLoon, isSurge } = ENV();
    const methods = ["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS", "PATCH", "PUT"]

    function send(method, options) {
        options = typeof options === 'string' ? { url: options } : options;
        options.url = baseURL ? baseURL + options.url : options.url;
        if (isQX) {
            return $task.fetch({ method, ...options });
        } else {
            return new Promise((resolve, reject) => {
                const request = (isSurge || isLoon) ? $httpClient : require('request');
                request[method.toLowerCase()](options, (err, response, body) => {
                    if (err) reject(err);
                    else resolve({ statusCode: response.status || response.statusCode, headers: response.headers, body });
                })
            })
        }
    }

    const http = {};
    methods.forEach(method => http[method.toLowerCase()] = options => send(method, options));
    return http;
}