/**
 * TG频道图片推送
 * @author: Peng-YM
 * 更新地址：https://raw.githubusercontent.com/Peng-YM/QuanX/master/Tasks/telegram.js
 * 使用方法：
 * 1. 在channels里面添加频道的id，比如说对于频道https://t.me/ABCD，则填入"ABCD"
 * 比如 channels = ["ABCD", "CDEF"]
 * 2. 在maxMedias设置每个频道最多显示的图片数量，比如说设置为3，则只会显示最近3张图片。
 * 3. alwaysNotice控制是否重复显示已经看过的图片，如果设置为false，则只会显示更新的图片。
 */

let channels = ["xqsranimegif"];
let maxMedias = 3;
let alwaysNotice = false;

const $ = API("telegram");
if ($.read("channels") !== undefined) {
    channels = JSON.parse($.read("channels"));
}
if ($.read("maxMedias") !== undefined) {
    maxMedias = parseInt($.read("maxMedias"));
}
if ($.read("alwaysNotice") !== undefined) {
    alwaysNotice = $.read("alwaysNotice");
}

const updated = JSON.parse($.read("updated") || "{}");

Promise.all(
    channels.map(async (channel) => {
        $.log(`Checking channel ${channel}...`);
        await $.http.get(`https://rsshub.app/telegram/channel/${channel}`)
            .then((response) => {
                const body = response.body;
                const channelLink = `https://t.me/s/${channel}`;
                const channelName = body.match(/CDATA\[(.*) - Telegram 频道\]/)[1];


                $.log(`Channel Name: ${channelName}, Link: ${channelLink}`);

                // collect medias
                let medias = [];
                response.body.match(/<item>[\s\S]*?<\/item>/g).forEach((item) => {
                    const mediaCollection = Array.from(item.matchAll(/(?:img|video) src="(.*?)"/g), m => m[1]).filter(m => m !== "undefined");
                    const updateTime = new Date(item.match(/<pubDate>(.*?)<\/pubDate>/)[1]).getTime();
                    if (mediaCollection) {
                        if (alwaysNotice || updated[channel] === undefined || updated[channel] < updateTime) {
                            medias = medias.concat(mediaCollection);
                            $.log(mediaCollection);
                        } else return;
                    }
                });

                $.log(`All medias: ${medias}`)

                // push notifications
                for (let i = 0; i < Math.min(medias.length, maxMedias); i++) {
                    $.notify(`[Telegram] ${channelName}`, "", "", {
                        "media-url": medias[i],
                        "open-url": medias[i]
                    });
                    $.log(`MEDIA: ${medias[i]}`);
                }

                // update timestamp
                updated[channel] = new Date().getTime();
                $.write(JSON.stringify(updated), "updated");
            })
            .catch((error) => {
                $.notify("[Telegram]", "", `❌ 未找到频道: ${channel}`);
                $.error(error);
            });
    })
)
    .catch((err) => $.error(err))
    .finally(() => $.done());


// prettier-ignore
/*********************************** API *************************************/
function ENV(){const e="undefined"!=typeof $task,t="undefined"!=typeof $loon,s="undefined"!=typeof $httpClient&&!t,o="function"==typeof require&&"undefined"!=typeof $jsbox;return{isQX:e,isLoon:t,isSurge:s,isNode:"function"==typeof require&&!o,isJSBox:o,isRequest:"undefined"!=typeof $request,isScriptable:"undefined"!=typeof importModule}}function HTTP(e,t={}){const{isQX:s,isLoon:o,isSurge:i,isScriptable:n,isNode:r}=ENV();const u={};return["GET","POST","PUT","DELETE","HEAD","OPTIONS","PATCH"].forEach(c=>u[c.toLowerCase()]=(u=>(function(u,c){(c="string"==typeof c?{url:c}:c).url=e?e+c.url:c.url;const h=(c={...t,...c}).timeout,l={onRequest:()=>{},onResponse:e=>e,onTimeout:()=>{},...c.events};let a,d;if(l.onRequest(u,c),s)a=$task.fetch({method:u,...c});else if(o||i||r)a=new Promise((e,t)=>{(r?require("request"):$httpClient)[u.toLowerCase()](c,(s,o,i)=>{s?t(s):e({statusCode:o.status||o.statusCode,headers:o.headers,body:i})})});else if(n){const e=new Request(c.url);e.method=u,e.headers=c.headers,e.body=c.body,a=new Promise((t,s)=>{e.loadString().then(s=>{t({statusCode:e.response.statusCode,headers:e.response.headers,body:s})}).catch(e=>s(e))})}const f=h?new Promise((e,t)=>{d=setTimeout(()=>(l.onTimeout(),t(`${u} URL: ${c.url} exceeds the timeout ${h} ms`)),h)}):null;return(f?Promise.race([f,a]).then(e=>(clearTimeout(d),e)):a).then(e=>l.onResponse(e))})(c,u))),u}function API(e="untitled",t=!1){const{isQX:s,isLoon:o,isSurge:i,isNode:n,isJSBox:r,isScriptable:u}=ENV();return new class{constructor(e,t){this.name=e,this.debug=t,this.http=HTTP(),this.env=ENV(),this.node=(()=>{if(n){return{fs:require("fs")}}return null})(),this.initCache();Promise.prototype.delay=function(e){return this.then(function(t){return((e,t)=>new Promise(function(s){setTimeout(s.bind(null,t),e)}))(e,t)})}}initCache(){if(s&&(this.cache=JSON.parse($prefs.valueForKey(this.name)||"{}")),(o||i)&&(this.cache=JSON.parse($persistentStore.read(this.name)||"{}")),n){let e="root.json";this.node.fs.existsSync(e)||this.node.fs.writeFileSync(e,JSON.stringify({}),{flag:"wx"},e=>console.log(e)),this.root={},e=`${this.name}.json`,this.node.fs.existsSync(e)?this.cache=JSON.parse(this.node.fs.readFileSync(`${this.name}.json`)):(this.node.fs.writeFileSync(e,JSON.stringify({}),{flag:"wx"},e=>console.log(e)),this.cache={})}}persistCache(){const e=JSON.stringify(this.cache);s&&$prefs.setValueForKey(e,this.name),(o||i)&&$persistentStore.write(e,this.name),n&&(this.node.fs.writeFileSync(`${this.name}.json`,e,{flag:"w"},e=>console.log(e)),this.node.fs.writeFileSync("root.json",JSON.stringify(this.root),{flag:"w"},e=>console.log(e)))}write(e,t){this.log(`SET ${t}`),-1!==t.indexOf("#")?(t=t.substr(1),i&o&&$persistentStore.write(e,t),s&&$prefs.setValueForKey(e,t),n&&(this.root[t]=e)):this.cache[t]=e,this.persistCache()}read(e){return this.log(`READ ${e}`),-1===e.indexOf("#")?this.cache[e]:(e=e.substr(1),i&o?$persistentStore.read(e):s?$prefs.valueForKey(e):n?this.root[e]:void 0)}delete(e){this.log(`DELETE ${e}`),-1!==e.indexOf("#")?(e=e.substr(1),i&o&&$persistentStore.write(null,e),s&&$prefs.removeValueForKey(e),n&&delete this.root[e]):delete this.cache[e],this.persistCache()}notify(e,t="",c="",h={}){const l=h["open-url"],a=h["media-url"];if(s&&$notify(e,t,c,h),i&&$notification.post(e,t,c+`${a?"\n多媒体:"+a:""}`,{url:l}),o){let s={};l&&(s.openUrl=l),a&&(s.mediaUrl=a),"{}"==JSON.stringify(s)?$notification.post(e,t,c):$notification.post(e,t,c,s)}if(n||u){const s=c+(l?`\n点击跳转: ${l}`:"")+(a?`\n多媒体: ${a}`:"");if(r){require("push").schedule({title:e,body:(t?t+"\n":"")+s})}else console.log(`${e}\n${t}\n${s}\n\n`)}}log(e){this.debug&&console.log(e)}info(e){console.log(e)}error(e){console.log("ERROR: "+e)}wait(e){return new Promise(t=>setTimeout(t,e))}done(e={}){s||o||i?$done(e):n&&!r&&"undefined"!=typeof $context&&($context.headers=e.headers,$context.statusCode=e.statusCode,$context.body=e.body)}}(e,t)}
/*****************************************************************************/


