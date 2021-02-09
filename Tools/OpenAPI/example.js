const $ = API("APP", true); // API("APP") --> 无log输出
// 测试console
$.log("测试输出");
$.error("这是一条错误信息");

// 测试通知
$.error({
  message: "Test ERROR"
});
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
function ENV(){const e="undefined"!=typeof $task,t="undefined"!=typeof $loon,s="undefined"!=typeof $httpClient&&!t,i="function"==typeof require&&"undefined"!=typeof $jsbox;return{isQX:e,isLoon:t,isSurge:s,isNode:"function"==typeof require&&!i,isJSBox:i,isRequest:"undefined"!=typeof $request,isScriptable:"undefined"!=typeof importModule}}function HTTP(e={baseURL:""}){const{isQX:t,isLoon:s,isSurge:i,isScriptable:n,isNode:o}=ENV(),r=/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&\/\/=]*)/;const u={};return["GET","POST","PUT","DELETE","HEAD","OPTIONS","PATCH"].forEach(l=>u[l.toLowerCase()]=(u=>(function(u,l){l="string"==typeof l?{url:l}:l;const h=e.baseURL;h&&!r.test(l.url||"")&&(l.url=h?h+l.url:l.url);const a=(l={...e,...l}).timeout,c={onRequest:()=>{},onResponse:e=>e,onTimeout:()=>{},...l.events};let f,d;if(c.onRequest(u,l),t)f=$task.fetch({method:u,...l});else if(s||i||o)f=new Promise((e,t)=>{(o?require("request"):$httpClient)[u.toLowerCase()](l,(s,i,n)=>{s?t(s):e({statusCode:i.status||i.statusCode,headers:i.headers,body:n})})});else if(n){const e=new Request(l.url);e.method=u,e.headers=l.headers,e.body=l.body,f=new Promise((t,s)=>{e.loadString().then(s=>{t({statusCode:e.response.statusCode,headers:e.response.headers,body:s})}).catch(e=>s(e))})}const p=a?new Promise((e,t)=>{d=setTimeout(()=>(c.onTimeout(),t(`${u} URL: ${l.url} exceeds the timeout ${a} ms`)),a)}):null;return(p?Promise.race([p,f]).then(e=>(clearTimeout(d),e)):f).then(e=>c.onResponse(e))})(l,u))),u}function API(e="untitled",t=!1){const{isQX:s,isLoon:i,isSurge:n,isNode:o,isJSBox:r,isScriptable:u}=ENV();return new class{constructor(e,t){this.name=e,this.debug=t,this.http=HTTP(),this.env=ENV(),this.node=(()=>{if(o){return{fs:require("fs")}}return null})(),this.initCache();Promise.prototype.delay=function(e){return this.then(function(t){return((e,t)=>new Promise(function(s){setTimeout(s.bind(null,t),e)}))(e,t)})}}initCache(){if(s&&(this.cache=JSON.parse($prefs.valueForKey(this.name)||"{}")),(i||n)&&(this.cache=JSON.parse($persistentStore.read(this.name)||"{}")),o){let e="root.json";this.node.fs.existsSync(e)||this.node.fs.writeFileSync(e,JSON.stringify({}),{flag:"wx"},e=>console.log(e)),this.root={},e=`${this.name}.json`,this.node.fs.existsSync(e)?this.cache=JSON.parse(this.node.fs.readFileSync(`${this.name}.json`)):(this.node.fs.writeFileSync(e,JSON.stringify({}),{flag:"wx"},e=>console.log(e)),this.cache={})}}persistCache(){const e=JSON.stringify(this.cache,null,2);s&&$prefs.setValueForKey(e,this.name),(i||n)&&$persistentStore.write(e,this.name),o&&(this.node.fs.writeFileSync(`${this.name}.json`,e,{flag:"w"},e=>console.log(e)),this.node.fs.writeFileSync("root.json",JSON.stringify(this.root,null,2),{flag:"w"},e=>console.log(e)))}write(e,t){if(this.log(`SET ${t}`),-1!==t.indexOf("#")){if(t=t.substr(1),n||i)return $persistentStore.write(e,t);if(s)return $prefs.setValueForKey(e,t);o&&(this.root[t]=e)}else this.cache[t]=e;this.persistCache()}read(e){return this.log(`READ ${e}`),-1===e.indexOf("#")?this.cache[e]:(e=e.substr(1),n||i?$persistentStore.read(e):s?$prefs.valueForKey(e):o?this.root[e]:void 0)}delete(e){if(this.log(`DELETE ${e}`),-1!==e.indexOf("#")){if(e=e.substr(1),n||i)return $persistentStore.write(null,e);if(s)return $prefs.removeValueForKey(e);o&&delete this.root[e]}else delete this.cache[e];this.persistCache()}notify(e,t="",l="",h={}){const a=h["open-url"],c=h["media-url"];if(s&&$notify(e,t,l,h),n&&$notification.post(e,t,l+`${c?"\n多媒体:"+c:""}`,{url:a}),i){let s={};a&&(s.openUrl=a),c&&(s.mediaUrl=c),"{}"===JSON.stringify(s)?$notification.post(e,t,l):$notification.post(e,t,l,s)}if(o||u){const s=l+(a?`\n点击跳转: ${a}`:"")+(c?`\n多媒体: ${c}`:"");if(r){require("push").schedule({title:e,body:(t?t+"\n":"")+s})}else console.log(`${e}\n${t}\n${s}\n\n`)}}log(e){this.debug&&console.log(`[${this.name}] LOG: ${this.stringify(e)}`)}info(e){console.log(`[${this.name}] INFO: ${this.stringify(e)}`)}error(e){console.log(`[${this.name}] ERROR: ${this.stringify(e)}`)}wait(e){return new Promise(t=>setTimeout(t,e))}done(e={}){s||i||n?$done(e):o&&!r&&"undefined"!=typeof $context&&($context.headers=e.headers,$context.statusCode=e.statusCode,$context.body=e.body)}stringify(e){if("string"==typeof e||e instanceof String)return e;try{return JSON.stringify(e,null,2)}catch(e){return"[object Object]"}}}(e,t)}
/*****************************************************************************/

