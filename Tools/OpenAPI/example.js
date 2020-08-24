const $ = API("APP", true); // API("APP") --> 无log输出
// 测试console
$.log("测试输出");
$.error("这是一条错误信息");

// 测试通知
$.notify("标题");
$.notify("跳转测试", "Subtitle", "点击跳转", {
  "open-url": "http://www.bing.com",
});
$.notify("图片测试（QX有效）", "Subtitle", "", {
  "media-url":
    "https://avatars2.githubusercontent.com/u/21050064?s=460&u=40a74913dd0a3d00670d05148c3a08c787470021&v=4",
});
$.notify("HELLO", "", "");

// 测试缓存
const key = "测试";
const data = "数据";
$.write(data, key);
$.write("Hello", "World");
$.log(`当前缓存：\n${JSON.stringify($.cache)}`);
if ($.read(key) !== data) {
  $.notify("缓存测试炸了！", "", "");
} else {
  $.log("缓存测试通过！");
}
$.delete(key);
if ($.read(key)) {
  $.log("缓存Key未删除！");
}

$.write("World", "#Hello");
if ($.read("#Hello") !== "World") {
  $.notify("缓存测试炸了！", "", "");
} else {
  $.log("缓存测试通过！");
}

$.delete("#Hello");
if ($.read("#Hello")) {
  $.log("缓存Key未删除！");
}

const obj = {
  hello: {
    world: "HELLO",
  },
};

$.write(obj, "obj");

// 测试请求
const headers = {
  "user-agent": "OpenAPI",
};
const rawBody = "This is expected to be sent back as part of response body.";
const jsonBody = {
  HELLO: "WORLD",
  FROM: "OpenAPI",
};

function assertEqual(a, b) {
  for (let [key, value] of Object.entries(a)) {
    if (a[key] !== b[key]) {
      return false;
    }
  }
  return true;
}
!(async () => {
  await $.http
    .get({
      url: "https://postman-echo.com/get?foo1=bar1&foo2=bar2",
      headers,
    })
    .then((response) => {
      const body = JSON.parse(response.body);
      if (!assertEqual(headers, body.headers)) {
        console.log("ERROR: HTTP GET with header test failed!");
      } else {
        console.log("OK: HTTP GET with header test");
      }
    });

  await $.http
    .put({
      url: "https://postman-echo.com/put",
      body: rawBody,
      headers: {
        "content-type": "text/plain",
      },
    })
    .then((response) => {
      const body = JSON.parse(response.body);
      if (body.data !== rawBody) {
        console.log("ERROR: HTTP PUT with raw body test failed!");
      } else {
        console.log("OK: HTTP PUT with raw body test");
      }
    });

  await $.http
    .patch({
      url: "https://postman-echo.com/patch",
      body: JSON.stringify(jsonBody),
    })
    .then((response) => {
      const body = JSON.parse(response.body);
      if (!assertEqual(body.data, jsonBody)) {
        console.log("ERROR: HTTP PATCH with json body test failed!");
      } else {
        console.log("OK: HTTP PATCH with json body test");
      }
    });

  // timeout 测试，不要挂代理
  await $.http
    .get({
      url: "http://www.twitter.com",
      timeout: 100,
      events: {
        onTimeout: () => {
          $.error("OHHHHHHHH")
        }
      }
    })
    .then((response) => {
      console.log(response);
    })
    .catch((error) => {
      console.log(error);
    });

  // 高级用法，自定义HTTP对象，设置默认的baseURL，以及默认的请求选项
  const myHttp = HTTP("http://postman-echo.com", {
    // 这里可以设置默认的请求options，比如timeout，events等
  });
})().then(() => $.done());

// delay
$.wait(1000).then(() => $.log("等待1s"));

$.done();

// prettier-ignore
/*********************************** API *************************************/
function ENV(){const e="undefined"!=typeof $task,t="undefined"!=typeof $loon,s="undefined"!=typeof $httpClient&&!this.isLoon,o="function"==typeof require&&"undefined"!=typeof $jsbox;return{isQX:e,isLoon:t,isSurge:s,isNode:"function"==typeof require&&!o,isJSBox:o,isRequest:"undefined"!=typeof $request,isScriptable:"undefined"!=typeof importModule}}function HTTP(e,t={}){const{isQX:s,isLoon:o,isSurge:i,isScriptable:n,isNode:r}=ENV();const u={};return["GET","POST","PUT","DELETE","HEAD","OPTIONS","PATCH"].forEach(h=>u[h.toLowerCase()]=(u=>(function(u,h){(h="string"==typeof h?{url:h}:h).url=e?e+h.url:h.url;const c=(h={...t,...h}).timeout,d={onRequest:()=>{},onResponse:e=>e,onTimeout:()=>{},...h.events};let l,a;if(d.onRequest(u,h),s)l=$task.fetch({method:u,...h});else if(o||i||r)l=new Promise((e,t)=>{(r?require("request"):$httpClient)[u.toLowerCase()](h,(s,o,i)=>{s?t(s):e({statusCode:o.status||o.statusCode,headers:o.headers,body:i})})});else if(n){const e=new Request(h.url);e.method=u,e.headers=h.headers,e.body=h.body,l=new Promise((t,s)=>{e.loadString().then(s=>{t({statusCode:e.response.statusCode,headers:e.response.headers,body:s})}).catch(e=>s(e))})}const f=c?new Promise((e,t)=>{a=setTimeout(()=>(d.onTimeout(),t(`${u} URL: ${h.url} exceeds the timeout ${c} ms`)),c)}):null;return(f?Promise.race([f,l]).then(e=>(clearTimeout(a),e)):l).then(e=>d.onResponse(e))})(h,u))),u}function API(e="untitled",t=!1){const{isQX:s,isLoon:o,isSurge:i,isNode:n,isJSBox:r}=ENV();return new class{constructor(e,t){this.name=e,this.debug=t,this.http=HTTP(),this.env=ENV(),this.node=(()=>{if(n){return{fs:require("fs")}}return null})(),this.initCache();Promise.prototype.delay=function(e){return this.then(function(t){return((e,t)=>new Promise(function(s){setTimeout(s.bind(null,t),e)}))(e,t)})}}initCache(){if(s&&(this.cache=JSON.parse($prefs.valueForKey(this.name)||"{}")),(o||i)&&(this.cache=JSON.parse($persistentStore.read(this.name)||"{}")),n){let e="root.json";this.node.fs.existsSync(e)||this.node.fs.writeFileSync(e,JSON.stringify({}),{flag:"wx"},e=>console.log(e)),this.root={},e=`${this.name}.json`,this.node.fs.existsSync(e)?this.cache=JSON.parse(this.node.fs.readFileSync(`${this.name}.json`)):(this.node.fs.writeFileSync(e,JSON.stringify({}),{flag:"wx"},e=>console.log(e)),this.cache={})}}persistCache(){const e=JSON.stringify(this.cache);s&&$prefs.setValueForKey(e,this.name),(o||i)&&$persistentStore.write(e,this.name),n&&(this.node.fs.writeFileSync(`${this.name}.json`,e,{flag:"w"},e=>console.log(e)),this.node.fs.writeFileSync("root.json",JSON.stringify(this.root),{flag:"w"},e=>console.log(e)))}write(e,t){this.log(`SET ${t}`),-1!==t.indexOf("#")?(t=t.substr(1),i&o&&$persistentStore.write(e,t),s&&$prefs.setValueForKey(e,t),n&&(this.root[t]=e)):this.cache[t]=e,this.persistCache()}read(e){return this.log(`READ ${e}`),-1===e.indexOf("#")?this.cache[e]:(e=e.substr(1),i&o?$persistentStore.read(e):s?$prefs.valueForKey(e):n?this.root[e]:void 0)}delete(e){this.log(`DELETE ${e}`),-1!==e.indexOf("#")?(e=e.substr(1),i&o&&$persistentStore.write(null,e),s&&$prefs.removeValueForKey(e),n&&delete this.root[e]):delete this.cache[e],this.persistCache()}notify(e,t="",u="",h={}){const c=h["open-url"],d=h["media-url"],l=u+(c?`\n点击跳转: ${c}`:"")+(d?`\n多媒体: ${d}`:"");if(s&&$notify(e,t,u,h),i&&$notification.post(e,t,l),o&&$notification.post(e,t,u,c),n)if(r){require("push").schedule({title:e,body:(t?t+"\n":"")+l})}else console.log(`${e}\n${t}\n${l}\n\n`)}log(e){this.debug&&console.log(e)}info(e){console.log(e)}error(e){console.log("ERROR: "+e)}wait(e){return new Promise(t=>setTimeout(t,e))}done(e={}){s||o||i?$done(e):n&&!r&&"undefined"!=typeof $context&&($context.headers=e.headers,$context.statusCode=e.statusCode,$context.body=e.body)}}(e,t)}
/*****************************************************************************/
