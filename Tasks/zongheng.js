/**
 *  @author: Peng-YM
 *  更新地址: https://raw.githubusercontent.com/Peng-YM/QuanX/master/Tasks/zongheng.js
 *  使用方法：进入纵横小说页面，例如<<剑来>>：http://book.zongheng.com/book/672340.html 则id为672340，将id添加到列表即可。
 */

// 书籍id列表
let ids = ["408586"];
let alwaysNotice = false; // 设置为true则每次运行通知，否则只通知更新

/********************************* SCRIPT START *******************************************************/
const $ = API("zongheng");
if ($.read("ids") !== undefined){
    ids = JSON.parse($.read("ids"));
}
alwaysNotice = $.read('alwaysNotice') || alwaysNotice;

const parsers = {
    title: new RegExp(/bookname="(\S+)"/, "i"),
    latestChapter: new RegExp(/class="tit"><a[^>]*>([^<]*)/, "i"),
    coverURL: new RegExp(
        /<div class="book-img fl">[\s\S]*?<img src="(.*?)".*>[\s\S]*?<\/div>/
    ),
    description: new RegExp(/<div class="con">([\s\S]*?)<\/div>/),
    updateTime: new RegExp(/(\d+)(?:小时|天|周|月|年)前/),
    updateCount: new RegExp(/今日更新\d+章/),
    author: new RegExp(/<div class="au-name"><a [\s\S]*?>(\S*)<\/a><\/div>/),
};
// check update
checkUpdate($.read("books") || {}).finally(() => $.done());

async function checkUpdate(books) {
    let noUpdate = true;
    await Promise.all(
        ids.map(async (id) => {
            $.log(`Handling book with id: ${id}...`);
            // check update from each book
            const config = {
                url: `http://book.zongheng.com/book/${id}.html`,
                headers: {
                    "User-Agent":
                        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.141 Safari/537.36",
                },
            };

            await $.http.get(config)
                .then((response) => {
                    const html = response.body;
                    // parse html
                    const book = {
                        title: html.match(parsers.title)[1],
                        updateCount: html.match(parsers.updateCount)[0],
                        latestChapter: html.match(parsers.latestChapter)[1],
                        coverURL: html.match(parsers.coverURL)[1],
                        updateTime: html.match(parsers.updateTime)[0],
                        description: html.match(parsers.description)[1],
                        author: html.match(parsers.author)[1],
                    };
                    $.log(book);
                    const cachebook = books[id];
                    if (
                        cachebook === undefined ||
                        alwaysNotice ||
                        book.latestChapter !== cachebook.latestChapter
                    ) {
                        // upate database
                        books[id] = book;
                        // push notifications
                        $.notify(
                            `🎉🎉🎉[纵横小说] 《${book.title}》更新`,
                            `⏰ 更新时间: ${book.updateTime}`,
                            `🎩作者: ${book.author}\n📌 最新章节: ${book.latestChapter}\n${book.description}\n⌨️ ${book.updateCount}`,
                            {
                                "open-url": `http://book.zongheng.com/book/${id}.html`,
                                "media-url": book.coverURL,
                            }
                        );
                        noUpdate = false;
                    }
                })
                .catch((e) => $.error(e));
        })
    );
    if (noUpdate) $.info("无更新");
    // update database
    $.write(books, "books");
}

/********************************* SCRIPT END *******************************************************/

// prettier-ignore
/*********************************** API *************************************/
function ENV(){const e="undefined"!=typeof $task,t="undefined"!=typeof $loon,s="undefined"!=typeof $httpClient&&!t,i="function"==typeof require&&"undefined"!=typeof $jsbox;return{isQX:e,isLoon:t,isSurge:s,isNode:"function"==typeof require&&!i,isJSBox:i,isRequest:"undefined"!=typeof $request,isScriptable:"undefined"!=typeof importModule}}function HTTP(e={baseURL:""}){const{isQX:t,isLoon:s,isSurge:i,isScriptable:n,isNode:o}=ENV(),r=/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&\/\/=]*)/;const u={};return["GET","POST","PUT","DELETE","HEAD","OPTIONS","PATCH"].forEach(l=>u[l.toLowerCase()]=(u=>(function(u,l){l="string"==typeof l?{url:l}:l;const h=e.baseURL;h&&!r.test(l.url||"")&&(l.url=h?h+l.url:l.url);const a=(l={...e,...l}).timeout,c={onRequest:()=>{},onResponse:e=>e,onTimeout:()=>{},...l.events};let f,d;if(c.onRequest(u,l),t)f=$task.fetch({method:u,...l});else if(s||i||o)f=new Promise((e,t)=>{(o?require("request"):$httpClient)[u.toLowerCase()](l,(s,i,n)=>{s?t(s):e({statusCode:i.status||i.statusCode,headers:i.headers,body:n})})});else if(n){const e=new Request(l.url);e.method=u,e.headers=l.headers,e.body=l.body,f=new Promise((t,s)=>{e.loadString().then(s=>{t({statusCode:e.response.statusCode,headers:e.response.headers,body:s})}).catch(e=>s(e))})}const p=a?new Promise((e,t)=>{d=setTimeout(()=>(c.onTimeout(),t(`${u} URL: ${l.url} exceeds the timeout ${a} ms`)),a)}):null;return(p?Promise.race([p,f]).then(e=>(clearTimeout(d),e)):f).then(e=>c.onResponse(e))})(l,u))),u}function API(e="untitled",t=!1){const{isQX:s,isLoon:i,isSurge:n,isNode:o,isJSBox:r,isScriptable:u}=ENV();return new class{constructor(e,t){this.name=e,this.debug=t,this.http=HTTP(),this.env=ENV(),this.node=(()=>{if(o){return{fs:require("fs")}}return null})(),this.initCache();Promise.prototype.delay=function(e){return this.then(function(t){return((e,t)=>new Promise(function(s){setTimeout(s.bind(null,t),e)}))(e,t)})}}initCache(){if(s&&(this.cache=JSON.parse($prefs.valueForKey(this.name)||"{}")),(i||n)&&(this.cache=JSON.parse($persistentStore.read(this.name)||"{}")),o){let e="root.json";this.node.fs.existsSync(e)||this.node.fs.writeFileSync(e,JSON.stringify({}),{flag:"wx"},e=>console.log(e)),this.root={},e=`${this.name}.json`,this.node.fs.existsSync(e)?this.cache=JSON.parse(this.node.fs.readFileSync(`${this.name}.json`)):(this.node.fs.writeFileSync(e,JSON.stringify({}),{flag:"wx"},e=>console.log(e)),this.cache={})}}persistCache(){const e=JSON.stringify(this.cache,null,2);s&&$prefs.setValueForKey(e,this.name),(i||n)&&$persistentStore.write(e,this.name),o&&(this.node.fs.writeFileSync(`${this.name}.json`,e,{flag:"w"},e=>console.log(e)),this.node.fs.writeFileSync("root.json",JSON.stringify(this.root,null,2),{flag:"w"},e=>console.log(e)))}write(e,t){if(this.log(`SET ${t}`),-1!==t.indexOf("#")){if(t=t.substr(1),n||i)return $persistentStore.write(e,t);if(s)return $prefs.setValueForKey(e,t);o&&(this.root[t]=e)}else this.cache[t]=e;this.persistCache()}read(e){return this.log(`READ ${e}`),-1===e.indexOf("#")?this.cache[e]:(e=e.substr(1),n||i?$persistentStore.read(e):s?$prefs.valueForKey(e):o?this.root[e]:void 0)}delete(e){if(this.log(`DELETE ${e}`),-1!==e.indexOf("#")){if(e=e.substr(1),n||i)return $persistentStore.write(null,e);if(s)return $prefs.removeValueForKey(e);o&&delete this.root[e]}else delete this.cache[e];this.persistCache()}notify(e,t="",l="",h={}){const a=h["open-url"],c=h["media-url"];if(s&&$notify(e,t,l,h),n&&$notification.post(e,t,l+`${c?"\n多媒体:"+c:""}`,{url:a}),i){let s={};a&&(s.openUrl=a),c&&(s.mediaUrl=c),"{}"===JSON.stringify(s)?$notification.post(e,t,l):$notification.post(e,t,l,s)}if(o||u){const s=l+(a?`\n点击跳转: ${a}`:"")+(c?`\n多媒体: ${c}`:"");if(r){require("push").schedule({title:e,body:(t?t+"\n":"")+s})}else console.log(`${e}\n${t}\n${s}\n\n`)}}log(e){this.debug&&console.log(`[${this.name}] LOG: ${this.stringify(e)}`)}info(e){console.log(`[${this.name}] INFO: ${this.stringify(e)}`)}error(e){console.log(`[${this.name}] ERROR: ${this.stringify(e)}`)}wait(e){return new Promise(t=>setTimeout(t,e))}done(e={}){s||i||n?$done(e):o&&!r&&"undefined"!=typeof $context&&($context.headers=e.headers,$context.statusCode=e.statusCode,$context.body=e.body)}stringify(e){if("string"==typeof e||e instanceof String)return e;try{return JSON.stringify(e,null,2)}catch(e){return"[object Object]"}}}(e,t)}
/*****************************************************************************/



