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
function ENV(){const e="undefined"!=typeof $task,t="undefined"!=typeof $loon,s="undefined"!=typeof $httpClient&&!this.isLoon,o="function"==typeof require&&"undefined"!=typeof $jsbox;return{isQX:e,isLoon:t,isSurge:s,isNode:"function"==typeof require&&!o,isJSBox:o,isRequest:"undefined"!=typeof $request,isScriptable:"undefined"!=typeof importModule}}function HTTP(e,t={}){const{isQX:s,isLoon:o,isSurge:i,isScriptable:n,isNode:r}=ENV();const u={};return["GET","POST","PUT","DELETE","HEAD","OPTIONS","PATCH"].forEach(h=>u[h.toLowerCase()]=(u=>(function(u,h){(h="string"==typeof h?{url:h}:h).url=e?e+h.url:h.url;const c=(h={...t,...h}).timeout,d={onRequest:()=>{},onResponse:e=>e,onTimeout:()=>{},...h.events};let l,a;if(d.onRequest(u,h),s)l=$task.fetch({method:u,...h});else if(o||i||r)l=new Promise((e,t)=>{(r?require("request"):$httpClient)[u.toLowerCase()](h,(s,o,i)=>{s?t(s):e({statusCode:o.status||o.statusCode,headers:o.headers,body:i})})});else if(n){const e=new Request(h.url);e.method=u,e.headers=h.headers,e.body=h.body,l=new Promise((t,s)=>{e.loadString().then(s=>{t({statusCode:e.response.statusCode,headers:e.response.headers,body:s})}).catch(e=>s(e))})}const f=c?new Promise((e,t)=>{a=setTimeout(()=>(d.onTimeout(),t(`${u} URL: ${h.url} exceeds the timeout ${c} ms`)),c)}):null;return(f?Promise.race([f,l]).then(e=>(clearTimeout(a),e)):l).then(e=>d.onResponse(e))})(h,u))),u}function API(e="untitled",t=!1){const{isQX:s,isLoon:o,isSurge:i,isNode:n,isJSBox:r}=ENV();return new class{constructor(e,t){this.name=e,this.debug=t,this.http=HTTP(),this.env=ENV(),this.node=(()=>{if(n){return{fs:require("fs")}}return null})(),this.initCache();Promise.prototype.delay=function(e){return this.then(function(t){return((e,t)=>new Promise(function(s){setTimeout(s.bind(null,t),e)}))(e,t)})}}initCache(){if(s&&(this.cache=JSON.parse($prefs.valueForKey(this.name)||"{}")),(o||i)&&(this.cache=JSON.parse($persistentStore.read(this.name)||"{}")),n){let e="root.json";this.node.fs.existsSync(e)||this.node.fs.writeFileSync(e,JSON.stringify({}),{flag:"wx"},e=>console.log(e)),this.root={},e=`${this.name}.json`,this.node.fs.existsSync(e)?this.cache=JSON.parse(this.node.fs.readFileSync(`${this.name}.json`)):(this.node.fs.writeFileSync(e,JSON.stringify({}),{flag:"wx"},e=>console.log(e)),this.cache={})}}persistCache(){const e=JSON.stringify(this.cache);s&&$prefs.setValueForKey(e,this.name),(o||i)&&$persistentStore.write(e,this.name),n&&(this.node.fs.writeFileSync(`${this.name}.json`,e,{flag:"w"},e=>console.log(e)),this.node.fs.writeFileSync("root.json",JSON.stringify(this.root),{flag:"w"},e=>console.log(e)))}write(e,t){this.log(`SET ${t}`),-1!==t.indexOf("#")?(t=t.substr(1),i&o&&$persistentStore.write(e,t),s&&$prefs.setValueForKey(e,t),n&&(this.root[t]=e)):this.cache[t]=e,this.persistCache()}read(e){return this.log(`READ ${e}`),-1===e.indexOf("#")?this.cache[e]:(e=e.substr(1),i&o?$persistentStore.read(e):s?$prefs.valueForKey(e):n?this.root[e]:void 0)}delete(e){this.log(`DELETE ${e}`),-1!==e.indexOf("#")?(e=e.substr(1),i&o&&$persistentStore.write(null,e),s&&$prefs.removeValueForKey(e),n&&delete this.root[e]):delete this.cache[e],this.persistCache()}notify(e,t="",u="",h={}){const c=h["open-url"],d=h["media-url"],l=u+(c?`\n点击跳转: ${c}`:"")+(d?`\n多媒体: ${d}`:"");if(s&&$notify(e,t,u,h),i&&$notification.post(e,t,l),o&&$notification.post(e,t,u,c),n)if(r){require("push").schedule({title:e,body:(t?t+"\n":"")+l})}else console.log(`${e}\n${t}\n${l}\n\n`)}log(e){this.debug&&console.log(e)}info(e){console.log(e)}error(e){console.log("ERROR: "+e)}wait(e){return new Promise(t=>setTimeout(t,e))}done(e={}){s||o||i?$done(e):n&&!r&&"undefined"!=typeof $context&&($context.headers=e.headers,$context.statusCode=e.statusCode,$context.body=e.body)}}(e,t)}
/*****************************************************************************/


