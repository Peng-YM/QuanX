/**
 * 监控汇率变化
 * @author: Peng-YM
 * 更新地址：https://raw.githubusercontent.com/Peng-YM/QuanX/master/Tasks/exchange.js
 * 配置方法：
 * 1. 设置基准货币，默认人民币(CNY)。
 * 2. 设置保留几位小数。
 */

const base = "CNY"; // 基准货币，可以改成其他币种
const digits = 2; // 保留几位有效数字

const $ = API("exchange");
const currencyNames = {
    CNY: ["人民币", "🇨🇳"],
    USD: ["美元", "🇺🇸"],
    HKD: ["港币", "🇭🇰"],
    JPY: ["日元", "🇯🇵"],
    EUR: ["欧元", "🇪🇺"],
    GBP: ["英镑", "🇬🇧"],
};


$.http.get({url: "https://api.ratesapi.io/api/latest?base=CNY"})
    .then((response) => {
        const data = JSON.parse(response.body);
        const source = currencyNames[base];

        const info = Object.keys(currencyNames).reduce((accumulator, key) => {
            let line = "";
            if (key !== base && data.rates.hasOwnProperty(key)) {
                const rate = parseFloat(data.rates[key]);
                const target = currencyNames[key];
                if (rate > 1) {
                    line = `${target[1]} 1${source[0]}兑${roundNumber(rate, digits)}${
                        target[0]
                    }\n`;
                } else {
                    line = `${target[1]} 1${target[0]}兑${roundNumber(1 / rate, digits)}${
                        source[0]
                    }\n`;
                }
            }
            return accumulator + line;
        }, "");
        $.notify(
            `[今日汇率] 基准：${source[1]} ${source[0]}`,
            `⏰ 更新时间：${data.date}`,
            `📈 汇率情况：\n${info}`
        );
    })
    .then(() => $.done());

function roundNumber(num, scale) {
    if (!("" + num).includes("e")) {
        return +(Math.round(num + "e+" + scale) + "e-" + scale);
    } else {
        let arr = ("" + num).split("e");
        let sig = "";
        if (+arr[1] + scale > 0) {
            sig = "+";
        }
        return +(
            Math.round(+arr[0] + "e" + sig + (+arr[1] + scale)) +
            "e-" +
            scale
        );
    }
}

// prettier-ignore
/*********************************** API *************************************/
function ENV(){const e="undefined"!=typeof $task,t="undefined"!=typeof $loon,s="undefined"!=typeof $httpClient&&!this.isLoon,o="function"==typeof require&&"undefined"!=typeof $jsbox;return{isQX:e,isLoon:t,isSurge:s,isNode:"function"==typeof require&&!o,isJSBox:o}}function HTTP(e,t={}){const{isQX:s,isLoon:o,isSurge:n}=ENV();const i={};return["GET","POST","PUT","DELETE","HEAD","OPTIONS","PATCH"].forEach(r=>i[r.toLowerCase()]=(i=>(function(i,r){(r="string"==typeof r?{url:r}:r).url=e?e+r.url:r.url;const u=(r={...t,...r}).timeout,h={onRequest:()=>{},onResponse:e=>e,onTimeout:()=>{},...r.events};let c,l;h.onRequest(i,r),c=s?$task.fetch({method:i,...r}):new Promise((e,t)=>{(n||o?$httpClient:require("request"))[i.toLowerCase()](r,(s,o,n)=>{s?t(s):e({statusCode:o.status||o.statusCode,headers:o.headers,body:n})})});const a=u?new Promise((e,t)=>{l=setTimeout(()=>(h.onTimeout(),t(`${i} URL: ${r.url} exceeds the timeout ${u} ms`)),u)}):null;return(a?Promise.race([a,c]).then(e=>(clearTimeout(l),e)):c).then(e=>h.onResponse(e))})(r,i))),i}function API(e="untitled",t=!1){const{isQX:s,isLoon:o,isSurge:n,isNode:i,isJSBox:r}=ENV();return new class{constructor(e,t){this.name=e,this.debug=t,this.http=HTTP(),this.env=ENV(),this.node=(()=>{if(i){return{fs:require("fs")}}return null})(),this.initCache();Promise.prototype.delay=function(e){return this.then(function(t){return((e,t)=>new Promise(function(s){setTimeout(s.bind(null,t),e)}))(e,t)})}}initCache(){if(s&&(this.cache=JSON.parse($prefs.valueForKey(this.name)||"{}")),(o||n)&&(this.cache=JSON.parse($persistentStore.read(this.name)||"{}")),i){let e="root.json";this.node.fs.existsSync(e)||this.node.fs.writeFileSync(e,JSON.stringify({}),{flag:"wx"},e=>console.log(e)),this.root={},e=`${this.name}.json`,this.node.fs.existsSync(e)?this.cache=JSON.parse(this.node.fs.readFileSync(`${this.name}.json`)):(this.node.fs.writeFileSync(e,JSON.stringify({}),{flag:"wx"},e=>console.log(e)),this.cache={})}}persistCache(){const e=JSON.stringify(this.cache);s&&$prefs.setValueForKey(e,this.name),(o||n)&&$persistentStore.write(e,this.name),i&&(this.node.fs.writeFileSync(`${this.name}.json`,e,{flag:"w"},e=>console.log(e)),this.node.fs.writeFileSync("root.json",JSON.stringify(this.root),{flag:"w"},e=>console.log(e)))}write(e,t){this.log(`SET ${t}`),-1!==t.indexOf("#")?(t=t.substr(1),n&o&&$persistentStore.write(e,t),s&&$prefs.setValueForKey(e,t),i&&(this.root[t]=e)):this.cache[t]=e,this.persistCache()}read(e){return this.log(`READ ${e}`),-1===e.indexOf("#")?this.cache[e]:(e=e.substr(1),n&o?$persistentStore.read(e):s?$prefs.valueForKey(e):i?this.root[e]:void 0)}delete(e){this.log(`DELETE ${e}`),-1!==e.indexOf("#")?(e=e.substr(1),n&o&&$persistentStore.write(null,e),s&&$prefs.removeValueForKey(e),i&&delete this.root[e]):delete this.cache[e],this.persistCache()}notify(e,t="",u="",h={}){const c=h["open-url"],l=h["media-url"],a=u+(c?`\n点击跳转: ${c}`:"")+(l?`\n多媒体: ${l}`:"");if(s&&$notify(e,t,u,h),n&&$notification.post(e,t,a),o&&$notification.post(e,t,u,c),i)if(r){require("push").schedule({title:e,body:(t?t+"\n":"")+a})}else console.log(`${e}\n${t}\n${a}\n\n`)}log(e){this.debug&&console.log(e)}info(e){console.log(e)}error(e){console.log("ERROR: "+e)}wait(e){return new Promise(t=>setTimeout(t,e))}done(e={}){s||o||n?$done(e):i&&!r&&"undefined"!=typeof $context&&($context.headers=e.headers,$context.statusCode=e.statusCode,$context.body=e.body)}}(e,t)}
/*****************************************************************************/
