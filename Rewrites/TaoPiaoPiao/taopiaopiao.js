/**
替换支付宝内淘票票评分为豆瓣评分
@author: Peng-YM
配置说明：

[Surge]
hostname = guide-acs.m.taobao.com
淘票票豆瓣评分=type=http-response, requires-body=1, pattern=^https:\/\/guide-acs\.m\.taobao\.com\/gw\/mtop\.film\.mtopshowapi\.getextendshowbyid, script-path=https://raw.githubusercontent.com/Peng-YM/QuanX/master/Rewrites/TaoPiaoPiao/taopiaopiao.js

[Loon]
hostname = guide-acs.m.taobao.com
http-response ^https:\/\/guide-acs\.m\.taobao\.com\/gw\/mtop\.film\.mtopshowapi\.getextendshowbyid requires-body=1, script-path=https://raw.githubusercontent.com/Peng-YM/QuanX/master/Rewrites/TaoPiaoPiao/taopiaopiao.js, tag=淘票票豆瓣评分

[QX]
hostname = guide-acs.m.taobao.com
^https:\/\/guide-acs\.m\.taobao\.com\/gw\/mtop\.film\.mtopshowapi\.getextendshowbyid url script-response-body https://raw.githubusercontent.com/Peng-YM/QuanX/master/Rewrites/TaoPiaoPiao/taopiaopiao.js
*/

const $ = API('taopiaopiao', true);

const body = JSON.parse($response.body);

const title = body.data.returnValue.showName;
const imdbId = body.data.returnValue.imdbid;

; (async () => {
    const { rating, folk } = await queryDoubanInfo({ title, imdbId });
    body.data.returnValue.scoreAndFavor.score = {
        score: rating,
        scoreName: "豆瓣评分",
        scoreType: "1",
        scoreCountDesc: folk > 10000 ? `${(folk / 10000).toFixed(1)}万 人评` : `${folk} 人评`,
        scoreCount: folk
    };
})().finally(() => $.done({ body: JSON.stringify(body) }));


function queryDoubanInfo({ title, imdbId }) {
    $.info(`Querying Douban info for movie: ${title}`);
    return $.http.get({
        url: `https://www.douban.com/search?cat=1002&q=${encodeURIComponent(imdbId || title)}`,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15',
            'Cookie': JSON.stringify(Date.now())
        }
    }).then(resp => {
        const html = resp.body;
        if (/\u767b\u5f55<\/a>\u540e\u91cd\u8bd5\u3002/.test(html))
            throw new Error('403 Forbidden!')
        const info = html.replace(/\n| |&#\d{2}/g, '')
            .match(/\[\u7535\u5f71\].+?subject-cast\">.+?<\/span>/g) || [];
        if (info.length == 0) {
            $.error(`豆瓣未能查询到 ${title} 相关信息！`);
            throw new Error(`豆瓣未能查询到 ${title} 相关信息！`);
        }
        const result = info[0];
        return {
            rating: result.split(/">(\d\.\d)</)[1],
            folk: (result.split(/(\d+\u4eba\u8bc4\u4ef7)/)[1] || "").match(/(\d+)/)[1]
        };
    });
}

function ENV() { const e = "undefined" != typeof $task, t = "undefined" != typeof $loon, s = "undefined" != typeof $httpClient && !t, i = "function" == typeof require && "undefined" != typeof $jsbox; return { isQX: e, isLoon: t, isSurge: s, isNode: "function" == typeof require && !i, isJSBox: i, isRequest: "undefined" != typeof $request, isScriptable: "undefined" != typeof importModule } } function HTTP(e = { baseURL: "" }) { const { isQX: t, isLoon: s, isSurge: i, isScriptable: n, isNode: o } = ENV(), r = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&\/\/=]*)/; const u = {}; return ["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS", "PATCH"].forEach(l => u[l.toLowerCase()] = (u => (function (u, l) { l = "string" == typeof l ? { url: l } : l; const h = e.baseURL; h && !r.test(l.url || "") && (l.url = h ? h + l.url : l.url); const a = (l = { ...e, ...l }).timeout, c = { onRequest: () => { }, onResponse: e => e, onTimeout: () => { }, ...l.events }; let f, d; if (c.onRequest(u, l), t) f = $task.fetch({ method: u, ...l }); else if (s || i || o) f = new Promise((e, t) => { (o ? require("request") : $httpClient)[u.toLowerCase()](l, (s, i, n) => { s ? t(s) : e({ statusCode: i.status || i.statusCode, headers: i.headers, body: n }) }) }); else if (n) { const e = new Request(l.url); e.method = u, e.headers = l.headers, e.body = l.body, f = new Promise((t, s) => { e.loadString().then(s => { t({ statusCode: e.response.statusCode, headers: e.response.headers, body: s }) }).catch(e => s(e)) }) } const p = a ? new Promise((e, t) => { d = setTimeout(() => (c.onTimeout(), t(`${u} URL: ${l.url} exceeds the timeout ${a} ms`)), a) }) : null; return (p ? Promise.race([p, f]).then(e => (clearTimeout(d), e)) : f).then(e => c.onResponse(e)) })(l, u))), u } function API(e = "untitled", t = !1) { const { isQX: s, isLoon: i, isSurge: n, isNode: o, isJSBox: r, isScriptable: u } = ENV(); return new class { constructor(e, t) { this.name = e, this.debug = t, this.http = HTTP(), this.env = ENV(), this.node = (() => { if (o) { return { fs: require("fs") } } return null })(), this.initCache(); Promise.prototype.delay = function (e) { return this.then(function (t) { return ((e, t) => new Promise(function (s) { setTimeout(s.bind(null, t), e) }))(e, t) }) } } initCache() { if (s && (this.cache = JSON.parse($prefs.valueForKey(this.name) || "{}")), (i || n) && (this.cache = JSON.parse($persistentStore.read(this.name) || "{}")), o) { let e = "root.json"; this.node.fs.existsSync(e) || this.node.fs.writeFileSync(e, JSON.stringify({}), { flag: "wx" }, e => console.log(e)), this.root = {}, e = `${this.name}.json`, this.node.fs.existsSync(e) ? this.cache = JSON.parse(this.node.fs.readFileSync(`${this.name}.json`)) : (this.node.fs.writeFileSync(e, JSON.stringify({}), { flag: "wx" }, e => console.log(e)), this.cache = {}) } } persistCache() { const e = JSON.stringify(this.cache, null, 2); s && $prefs.setValueForKey(e, this.name), (i || n) && $persistentStore.write(e, this.name), o && (this.node.fs.writeFileSync(`${this.name}.json`, e, { flag: "w" }, e => console.log(e)), this.node.fs.writeFileSync("root.json", JSON.stringify(this.root, null, 2), { flag: "w" }, e => console.log(e))) } write(e, t) { if (this.log(`SET ${t}`), -1 !== t.indexOf("#")) { if (t = t.substr(1), n || i) return $persistentStore.write(e, t); if (s) return $prefs.setValueForKey(e, t); o && (this.root[t] = e) } else this.cache[t] = e; this.persistCache() } read(e) { return this.log(`READ ${e}`), -1 === e.indexOf("#") ? this.cache[e] : (e = e.substr(1), n || i ? $persistentStore.read(e) : s ? $prefs.valueForKey(e) : o ? this.root[e] : void 0) } delete(e) { if (this.log(`DELETE ${e}`), -1 !== e.indexOf("#")) { if (e = e.substr(1), n || i) return $persistentStore.write(null, e); if (s) return $prefs.removeValueForKey(e); o && delete this.root[e] } else delete this.cache[e]; this.persistCache() } notify(e, t = "", l = "", h = {}) { const a = h["open-url"], c = h["media-url"]; if (s && $notify(e, t, l, h), n && $notification.post(e, t, l + `${c ? "\n多媒体:" + c : ""}`, { url: a }), i) { let s = {}; a && (s.openUrl = a), c && (s.mediaUrl = c), "{}" === JSON.stringify(s) ? $notification.post(e, t, l) : $notification.post(e, t, l, s) } if (o || u) { const s = l + (a ? `\n点击跳转: ${a}` : "") + (c ? `\n多媒体: ${c}` : ""); if (r) { require("push").schedule({ title: e, body: (t ? t + "\n" : "") + s }) } else console.log(`${e}\n${t}\n${s}\n\n`) } } log(e) { this.debug && console.log(`[${this.name}] LOG: ${this.stringify(e)}`) } info(e) { console.log(`[${this.name}] INFO: ${this.stringify(e)}`) } error(e) { console.log(`[${this.name}] ERROR: ${this.stringify(e)}`) } wait(e) { return new Promise(t => setTimeout(t, e)) } done(e = {}) { s || i || n ? $done(e) : o && !r && "undefined" != typeof $context && ($context.headers = e.headers, $context.statusCode = e.statusCode, $context.body = e.body) } stringify(e) { if ("string" == typeof e || e instanceof String) return e; try { return JSON.stringify(e, null, 2) } catch (e) { return "[object Object]" } } }(e, t) }

