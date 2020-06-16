/**
 * 2020年06月13日
 * 1、监控github仓库的commits和release。
 * 2、监控具体的文件或目录是否有更新。
 * @author: Peng-YM， toulanboy
 * 更新地址：https://raw.githubusercontent.com/Peng-YM/QuanX/master/Tasks/github.js
 * 配置方法：
 * 1. 填写github token, 在github > settings > developer settings > personal access token 里面生成一个新token。
 * 默认TOKEN用的是我自己的，请不要请求过于频繁，每天一两次即可。例如：cron "0 9 * * *"* 2. 配置仓库地址，格式如下：
 * {
 *  name: "",//填写仓库名称，可自定义
 *  file_names:[],//可选参数。若需要监控具体文件或目录。请填写对应的【一级目录】。
 *  url: "" //仓库的url
 * }
 * 📌 如果希望监控某个分支的Commit，请切换到该分支，直接复制URL填入；
 * 📌 如果希望监控Release，请切换至Release界面，直接复制URL填入；
 * 📌 若文件存在某个目录里面，请填写【一级目录】。如 JD-DailyBonus/JD-DailyBonus.js， 那么填写前面的JD-DailyBonus。
 */

const token = "784a03feb07989d3339dfa41c7eb41777436cbfa";

const repositories = [
  {
    name: "NZW9314 脚本",
    url: "https://github.com/nzw9314/QuantumultX/tree/master",
  },
  {
    name: "ClashX",
    url: "https://github.com/yichengchen/clashX/releases",
  },
  {
    name: "Chavy 脚本",
    url: "https://github.com/chavyleung/scripts",
  },
  {
    name: "Qure 图标",
    url: "https://github.com/Koolson/Qure",
  },
  {
    name: "Orz-mini 图标",
    url: "https://github.com/Orz-3/mini",
  },
  {
    name: "yichahucha -- 微博广告",
    file_names: ["wb_ad.js", "wb_launch.js"],
    url: "https://github.com/yichahucha/surge/tree/master",
  },
  {
    name: "NobyDa -- 京豆签到",
    file_names: ["JD-DailyBonus"],
    url: "https://github.com/NobyDa/Script/tree/master",
  },
];

const $ = API("github");

const parser = {
  commits: new RegExp(
    /^https:\/\/github.com\/([\w|-]+)\/([\w|-]+)(\/tree\/([\w|-]+))?$/
  ),
  releases: new RegExp(/^https:\/\/github.com\/([\w|-]+)\/([\w|-]+)\/releases/),
};

function hash(str) {
  let h = 0,
      i,
      chr;
    for (i = 0; i < str.length; i++) {
      chr = str.charCodeAt(i);
      h = (h << 5) - h + chr;
      h |= 0; // Convert to 32bit integer
    }
    return String(h);
}

function parseURL(url) {
  try {
    let repo = undefined;
    if (url.indexOf("releases") !== -1) {
      const results = url.match(parser.releases);
      repo = {
        type: "releases",
        owner: results[1],
        repo: results[2],
      };
    } else {
      const results = url.match(parser.commits);
      repo = {
        type: "commits",
        owner: results[1],
        repo: results[2],
        branch: results[3] === undefined ? "HEAD" : results[4],
      };
    }
    $.log(repo);
    return repo;
  } catch (error) {
    $.notify("Github 监控", "", `❌ URL ${url} 解析错误！`);
    throw error;
  }
}

function needUpdate(url, timestamp) {
  const storedTimestamp = $.read(hash(url));
  $.log(`Stored Timestamp for ${hash(url)}: ` + storedTimestamp);
  return storedTimestamp === undefined || storedTimestamp !== timestamp
    ? true
    : false;
}

async function checkUpdate(item) {
  const baseURL = "https://api.github.com";
  const { name, url } = item;
  const headers = {
    Authorization: `token ${token}`,
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.141 Safari/537.36",
  };
  try {
    const repository = parseURL(url);
    if (repository.type === "releases") {
      await $.get({
        url: `${baseURL}/repos/${repository.owner}/${repository.repo}/releases`,
        headers,
      })
        .then((response) => {
          const releases = JSON.parse(response.body);
          if (releases.length > 0) {
            // the first one is the latest release
            const release_name = releases[0].name;
            const author = releases[0].author.login;
            const { published_at, body } = releases[0];
            const notificationURL = {
              "open-url": `https://github.com/${repository.owner}/${repository.repo}/releases`,
              "media-url": `https://raw.githubusercontent.com/Orz-3/task/master/github.png`
            }
            if (needUpdate(url, published_at)) {
              $.notify(
                `🎉🎉🎉 [${name}] 新版本发布`,
                `📦 版本: ${release_name}`,
                `⏰ 发布于: ${formatTime(
                  published_at
                )}\n👨🏻‍💻 发布者: ${author}\n📌 更新说明: \n${body}`,
                notificationURL
              );
              $.write(published_at, hash(url));
            }
          }
        })
        .catch((e) => {
          $.error(e);
        });
    } else {
      const { author, body, published_at, file_url } = await $.get({
        url: `${baseURL}/repos/${repository.owner}/${repository.repo}/commits/${repository.branch}`,
        headers,
      })
        .then((response) => {
          const { commit } = JSON.parse(response.body);
          const author = commit.committer.name;
          const body = commit.message;
          const published_at = commit.committer.date;
          const file_url = commit.tree.url;
          return { author, body, published_at, file_url };
        })
        .catch((e) => {
          $.error(e);
        });
      $.log({ author, body, published_at, file_url });
      const notificationURL = {
        "open-url": `https://github.com/${repository.owner}/${repository.repo}/commits/${repository.branch}`,
        "media-url": `https://raw.githubusercontent.com/Orz-3/task/master/github.png`
      }
      //监控仓库是否有更新
      if (!item.hasOwnProperty("file_names")) {
        if (needUpdate(url, published_at)) {
          $.notify(
            `🎈🎈🎈 [${name}] 新提交`,
            "",
            `⏰ 提交于: ${formatTime(
              published_at
            )}\n👨🏻‍💻 发布者: ${author}\n📌 更新说明: \n${body}`,
            notificationURL
          );
          // update stored timestamp
          $.write(published_at, hash(url));
        }
      }
      //找出具体的文件是否有更新
      else {
        const file_names = item.file_names;
        await $.get({
          url: file_url,
          headers,
        })
          .then((response) => {
            const file_detail = JSON.parse(response.body);
            const file_list = file_detail.tree;
            for (let i in file_list) {
              for (let j in file_names) {
                if (file_list[i].path == file_names[j]) {
                  let file_hash = file_list[i].sha;
                  let last_sha = $.read(
                    hash(item.name + file_names[j])
                  );
                  if (file_hash != last_sha) {
                    $.notify(`🐬 [${name}]`, "", `📌 ${file_names[j]}有更新`, notificationURL);
                    $.write(file_hash, hash(item.name + file_names[j]));
                  }

                  $.log(
                    `🐬 ${
                      file_names[j]
                    }：\n\tlast sha: ${last_sha}\n\tlatest sha: ${file_hash}\n\t${
                      file_hash == last_sha ? "✅当前已是最新" : "🔅需要更新"
                    }`
                  );
                }
              }
            }
          })
          .catch((e) => {
            $.error(e);
          });
      }
    }
  } catch (e) {
    $.error(`❌ 请求错误: ${e}`);
    return;
  }
  return;
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  return `${date.getFullYear()}年${
    date.getMonth() + 1
  }月${date.getDate()}日${date.getHours()}时`;
}

Promise.all(
  repositories.map(async (item) => await checkUpdate(item))
).finally(() => $.done());

// prettier-ignore
/*********************************** API *************************************/
function API(i="untitled",t=!1){return new class{constructor(i,t){this.name=i,this.debug=t,this.isQX="undefined"!=typeof $task,this.isLoon="undefined"!=typeof $loon,this.isSurge="undefined"!=typeof $httpClient&&!this.isLoon,this.isNode="function"==typeof require,this.node=(()=>this.isNode?{request:require("request"),fs:require("fs")}:null)(),this.cache=this.initCache(),this.log(`INITIAL CACHE:\n${JSON.stringify(this.cache)}`),Promise.prototype.delay=function(i){return this.then(function(t){return((i,t)=>new Promise(function(e){setTimeout(e.bind(null,t),i)}))(i,t)})}}get(i){return this.isQX?("string"==typeof i&&(i={url:i,method:"GET"}),$task.fetch(i)):this.isLoon||this.isSurge?$httpClient.get(i):this.isNode?new Promise((t,e)=>{this.node.request(i,(i,s)=>{i?e(i):t(s)})}):void 0}post(i){return this.isQX?$task.fetch(i):this.isLoon||this.isSurge?$httpClient.post(i):this.isNode?new Promise((t,e)=>{this.node.request.post(i,(i,s)=>{i?e(i):t(s)})}):void 0}initCache(){if(this.isQX)return $prefs.valueForKey(this.name)||{};if(this.isLoon||this.isSurge)return $persistentStore.read(this.name)||{};if(this.isNode){const i=`${this.name}.json`;return this.node.fs.existsSync(i)?JSON.parse(this.node.fs.readFileSync(`${this.name}.json`)):(this.node.fs.writeFileSync(i,JSON.stringify({}),{flag:"wx"},i=>console.log(i)),{})}}persistCache(){const i=this.cache;this.isQX&&$prefs.setValueForKey(i,this.name),this.isSurge&&$persistentStore.write(i,this.name),this.isNode&&this.node.fs.writeFileSync(`${this.name}.json`,JSON.stringify(i),{flag:"w"},i=>console.log(i))}write(i,t){this.log(`SET ${t} = ${i}`),this.cache={...this.cache,[t]:i}}read(i){return this.log(`READ ${i}`),this.cache[i]}delete(i){this.log(`DELETE ${i}`),this.write(void 0,i)}notify(i,t,e,s){const o="string"==typeof s?s:void 0,n=e+(null==o?"":`\n${o}`);this.isQX&&(void 0!==o?$notify(i,t,e,{"open-url":o}):$notify(i,t,e,s)),this.isSurge&&$notification.post(i,t,n),this.isLoon&&$notification.post(i,t,e,o||s["open-url"]),this.isNode&&("undefined"==typeof $app?console.log(`${i}\n${t}\n${n}`):require("push").schedule({title:i,body:t?t+"\n"+e:e}))}log(i){this.debug&&console.log(i)}info(i){console.log(i)}error(i){this.log("ERROR: "+i)}wait(i){return new Promise(t=>setTimeout(t,i))}done(i={}){this.persistCache(),this.isQX&&$done(i),(this.isLoon||this.isSurge)&&$done(i)}}(i,t)}
/*****************************************************************************/
