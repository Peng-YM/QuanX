const $ = API("psn");
const url =
  "https://store.playstation.com/zh-hant-hk/grid/STORE-MSF86012-PLUS_FTT_CONTENT/1";
$.get({
  url,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.141 Safari/537.36",
  },
})
  .then((resp) => {
    const body = resp.body;
    const data = JSON.parse(body.match(/({"@context"[\s\S]*?)<\/script>/)[1]);
    $.log(data);
    return parse(data['@graph']);
  })
  .catch((err) => $.error(err))
  .finally($.done());

function parse(products) {
    products.forEach(item => {
        let description = item.description;
        // clean up css codes
        description = description.replace(/\s+/g, '');
        description = description.replace(/br|\\r|\\n/g, '');
        description = description.replace(/\w*&\w*?;/g, '');
        description = description.replace(/\w+\s{0,1}\w+="\w+"/g, '')
        const name = item.name.trim().match(/《([\s\Sz]+?)》/)[1];
        $.notify(
            `🎮 [PSN会免] ${name}`,
            `🗓 时间：${getTime()}`,
            `📦 类别：${item.category}\n💡 游戏简介：${description}`,
            {
                'media-url': `${item.image}`,
                'open-url': `https://store.playstation.com/zh-hant-hk/product/${item.sku}`
            }
        )
    })
}

function getTime(){
    const today = new Date();
    return `${today.getFullYear()}年${today.getMonth() + 1}月`;
}

// prettier-ignore
/*********************************** API *************************************/
function API(i="untitled",t=!1){return new class{constructor(i,t){this.name=i,this.debug=t,this.isQX="undefined"!=typeof $task,this.isLoon="undefined"!=typeof $loon,this.isSurge="undefined"!=typeof $httpClient&&!this.isLoon,this.isNode="function"==typeof require,this.node=(()=>this.isNode?{request:require("request"),fs:require("fs")}:null)(),this.cache=this.initCache(),this.log(`INITIAL CACHE:\n${JSON.stringify(this.cache)}`),Promise.prototype.delay=function(i){return this.then(function(t){return((i,t)=>new Promise(function(e){setTimeout(e.bind(null,t),i)}))(i,t)})}}get(i){return this.isQX?("string"==typeof i&&(i={url:i,method:"GET"}),$task.fetch(i)):this.isLoon||this.isSurge?$httpClient.get(i):this.isNode?new Promise((t,e)=>{this.node.request(i,(i,s)=>{i?e(i):t(s)})}):void 0}post(i){return this.isQX?$task.fetch(i):this.isLoon||this.isSurge?$httpClient.post(i):this.isNode?new Promise((t,e)=>{this.node.request.post(i,(i,s)=>{i?e(i):t(s)})}):void 0}initCache(){if(this.isQX)return $prefs.valueForKey(this.name)||{};if(this.isLoon||this.isSurge)return $persistentStore.read(this.name)||{};if(this.isNode){const i=`${this.name}.json`;return this.node.fs.existsSync(i)?JSON.parse(this.node.fs.readFileSync(`${this.name}.json`)):(this.node.fs.writeFileSync(i,JSON.stringify({}),{flag:"wx"},i=>console.log(i)),{})}}persistCache(){const i=this.cache;this.isQX&&$prefs.setValueForKey(i,this.name),this.isSurge&&$persistentStore.write(i,this.name),this.isNode&&this.node.fs.writeFileSync(`${this.name}.json`,JSON.stringify(i),{flag:"w"},i=>console.log(i))}write(i,t){this.log(`SET ${t} = ${i}`),this.cache={...this.cache,[t]:i}}read(i){return this.log(`READ ${i}`),this.cache[i]}delete(i){this.log(`DELETE ${i}`),this.write(void 0,i)}notify(i,t,e,s){const o="string"==typeof s?s:void 0,n=e+(null==o?"":`\n${o}`);this.isQX&&(void 0!==o?$notify(i,t,e,{"open-url":o}):$notify(i,t,e,s)),this.isSurge&&$notification.post(i,t,n),this.isLoon&&$notification.post(i,t,e,o||s["open-url"]),this.isNode&&("undefined"==typeof $jsbox?console.log(`${i}\n${t}\n${n}`):require("push").schedule({title:i,body:t?t+"\n"+e:e}))}log(i){this.debug&&console.log(i)}info(i){console.log(i)}error(i){this.log("ERROR: "+i)}wait(i){return new Promise(t=>setTimeout(t,i))}done(i={}){this.persistCache(),this.isQX&&$done(i),(this.isLoon||this.isSurge)&&$done(i)}}(i,t)}
/*****************************************************************************/
