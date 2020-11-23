const app = express({debug: true});
const $request = {
    url: "https://sub.store/users/10086/Peng-YM",
    method: "GET",
    headers: {}
}
const $done = (resp) => {
    console.log("=================== Response ===============================");
    console.log(JSON.stringify(resp, null, 2));
}
const $task = {};

app.all("/home", async function (req, res) {
    res.send("HELLO from express!");
});
app
    .route("/users/:userid")
    .post(function (req, res) {
        res.send(`POST USER: ${req.params.userid}`);
    })
    .get(function (req, res) {
        res.send(`GET USER ${req.params.userid}`);
    });
app.get("/users/:userid/:name", function (req, res) {
    res.send(req.params.name);
})
app.start();

// prettier-ignore
function ENV(){const e="undefined"!=typeof $task,t="undefined"!=typeof $loon;return{isQX:e,isLoon:t,isSurge:"undefined"!=typeof $httpClient&&!t,isNode:"function"==typeof require,isRequest:"undefined"!=typeof $request}}function express({port:e,debug:t}={port:3e3,debug:!1}){const{isNode:n}=!t&&ENV(),s={"Content-Type":"text/plain;charset=UTF-8","Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"POST,GET,OPTIONS,PATCH,PUT,DELETE","Access-Control-Allow-Headers":"Origin, X-Requested-With, Content-Type, Accept"};if(n){const t=require("express"),n=require("body-parser"),r=t();return r.use(n.json({verify:u})),r.use(n.urlencoded({verify:u,extended:!0})),r.use(n.raw({verify:u,type:"*/*"})),r.use((e,t,n)=>{t.set(s),n()}),r.start=(()=>{r.listen(e,()=>{$.info(`Express started on port: ${e}`)})}),r}const r=[],o=["GET","POST","PUT","DELETE","PATCH","OPTIONS","HEAD'","ALL"],i=(e,n=0)=>{let{method:s,url:o,headers:l,body:u}=e;t&&(console.log("=================== Dispatching Request ==============================="),console.log(JSON.stringify(e,null,2))),/json/i.test(l["Content-Type"])&&(u=JSON.parse(u)),s=s.toUpperCase();const{path:h,query:f}=function(e){const t=(e.match(/https?:\/\/[^\/]+(\/[^?]*)/)||[])[1]||"/",n=e.indexOf("?"),s={};if(-1!==n){let t=e.slice(e.indexOf("?")+1).split("&");for(let e=0;e<t.length;e++)hash=t[e].split("="),s[hash[0]]=hash[1]}return{path:t,query:s}}(o);let p,T=null,y=0;for(p=n;p<r.length;p++)if("ALL"===r[p].method||s===r[p].method){const{pattern:e}=r[p];c(e,h)&&e.split("/").length>y&&(T=r[p],y=e.split("/").length)}if(T){t&&console.log(`Pattern: ${T.pattern} matched`);const e=()=>{i(s,o,p)},n={method:s,url:o,path:h,query:f,params:d(T.pattern,h),headers:l,body:u},r=a(),c=e=>{r.status(500).json({status:"failed",message:`Internal Server Error: ${e}`})};if("AsyncFunction"===T.callback.constructor.name)T.callback(n,r,e).catch(c);else try{T.callback(n,r,e)}catch(e){c(e)}}else{a().status(404).json({status:"failed",message:"ERROR: 404 not found"})}},l={};return o.forEach(e=>{l[e.toLowerCase()]=((t,n)=>{r.push({method:e,pattern:t,callback:n})})}),l.route=(e=>{const t={};return o.forEach(n=>{t[n.toLowerCase()]=(s=>(r.push({method:n,pattern:e,callback:s}),t))}),t}),l.start=(()=>{i($request)}),l;function u(e,t,n,s){n&&n.length&&(e.rawBody=n.toString(s||"utf8"))}function a(){let e=200;const{isQX:t,isLoon:n,isSurge:r}=ENV(),o=s,i={200:"HTTP/1.1 200 OK",201:"HTTP/1.1 201 Created",302:"HTTP/1.1 302 Found",307:"HTTP/1.1 307 Temporary Redirect",308:"HTTP/1.1 308 Permanent Redirect",404:"HTTP/1.1 404 Not Found",500:"HTTP/1.1 500 Internal Server Error"};return new class{status(t){return e=t,this}send(s=""){const l={status:t?i[e]:e,body:s,headers:o};t?$done(l):(n||r)&&$done({response:l})}end(){this.send()}html(e){this.set("Content-Type","text/html;charset=UTF-8"),this.send(e)}json(e){this.set("Content-Type","application/json;charset=UTF-8"),this.send(JSON.stringify(e))}set(e,t){return o[e]=t,this}}}function c(e,t){if(e instanceof RegExp&&e.test(t))return!0;if("/"===e)return!0;if(-1===e.indexOf(":")){const n=t.split("/"),s=e.split("/");for(let e=0;e<s.length;e++)if(n[e]!==s[e])return!1;return!0}return!!d(e,t)}function d(e,t){if(-1===e.indexOf(":"))return null;{const n={};for(let s=0,r=0;s<e.length;s++,r++)if(":"===e[s]){let o=[],i=[];for(;"/"!==e[++s]&&s<e.length;)o.push(e[s]);for(;"/"!==t[r]&&r<t.length;)i.push(t[r++]);n[o.join("")]=i.join("")}else if(e[s]!==t[r])return null;return n}}}