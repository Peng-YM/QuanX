const app = express();
app.all("/home", async function (req, res) {
  res.send("HELLO from express!");
});
app
  .route("/Users/:userid")
  .post(function (req, res) {
    res.send(`POST USER: ${req.params.userid}`);
  })
  .get(function (req, res) {
    res.send(`GET USER ${req.params.userid}`);
  });
app.start();

/*****************************************************************************/
function express(){const t=[],e=["GET","POST","PUT","DELETE","PATCH","OPTIONS","HEAD'","ALL"],n=(e,s,h=0)=>{const{path:u,query:l}=function(t){const e=(t.match(/https?:\/\/[^\/]+(\/[^?]*)/)||[])[1]||"/",n=t.indexOf("?"),s={};if(-1!==n){let e=t.slice(t.indexOf("?")+1).split("&");for(let t=0;t<e.length;t++)hash=e[t].split("="),s[hash[0]]=hash[1]}return{path:e,query:s}}(s);let a,f=null;for(a=h;a<t.length;a++)if("ALL"===t[a].method||e===t[a].method){const{pattern:e}=t[a];if(r(e,u)){f=t[a];break}}if(f){const t=()=>{n(e,s,a)},r={method:e,url:s,path:u,query:l,params:i(f.pattern,u)},h=o();f.callback(r,h,t)}else{o().status("404").send("ERROR: 404 not found")}},s={};return e.forEach(e=>{s[e.toLowerCase()]=((n,s)=>{t.push({method:e,pattern:n,callback:s})})}),s.route=(n=>{const s={};return e.forEach(e=>{s[e.toLowerCase()]=(o=>(t.push({method:e,pattern:n,callback:o}),s))}),s}),s.start=(()=>{const{method:t,url:e}=$request;n(t,e)}),s;function o(){let t="200";const{isQX:e,isLoon:n,isSurge:s}=function(){const t="undefined"!=typeof $task,e="undefined"!=typeof $loon,n="undefined"!=typeof $httpClient&&!this.isLoon;return{isQX:t,isLoon:e,isSurge:n}}(),o={"Content-Type":"text/plain;charset=UTF-8"};return new class{status(e){return t=e,this}send(r=""){const i={status:t,body:r,headers:o};e?$done(...i):(n||s)&&$done({response:i})}end(){this.send()}html(t){this.set("Content-Type","text/html;charset=UTF-8"),this.send(t)}json(t){this.set("Content-Type","application/json;charset=UTF-8"),this.send(JSON.stringify(t))}set(t,e){return o[t]=e,this}}}function r(t,e){if(t instanceof RegExp&&t.test(e))return!0;if(-1===t.indexOf(":")){const n=e.split("/"),s=t.split("/");for(let t=0;t<s.length;t++)if(n[t]!==s[t])return!1;return!0}return!!i(t,e)}function i(t,e){if(-1===t.indexOf(":"))return null;{const n={};for(let s=0,o=0;s<t.length;s++,o++)if(":"===t[s]){let r=[],i=[];for(;"/"!==t[++s]&&s<t.length;)r.push(t[s]);for(;"/"!==e[o]&&o<e.length;)i.push(e[o++]);n[r.join("")]=i.join("")}else if(t[s]!==e[o])return null;return n}}}