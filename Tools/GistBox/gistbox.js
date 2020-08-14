(async () => {
  const $gist = GistBox("GITHUB TOKEN");
  let id = await $gist.findDatabase();
  if (id === -1) {
    console.log("Gist not found, creating one...");
    // create a database
    const backups = [
      {
        time: new Date().getTime(),
        content: "TEST",
      },
    ];
    id = await $gist.createDatabase(backups);
    console.log("DB created: " + id);
  } else {
    // get existing backups
    console.log("Database found: id = " + id);
    console.log("Existing backups: \n");
    const backups = await $gist.getBackups(id);
    backups.forEach((b) => console.log(`Time: ${b.time}, URL: ${b.url}`));
    // add a new backup
    await $gist.addBackups(id, {
      time: new Date().getTime(),
      content: "NEW BACKUP",
    });
    console.log("New backup added!");
    // delete an existing backup by timestamp
    await $gist.deleteBackups(id, backups[0].time);
    console.log(`Old backup ${backups[0].time} is deleted!`);
  }
})();

function GistBox(token) {
  const BOX_BACKUP_KEY = "BoxJs Gist";
  const $http = HTTP("https://api.github.com", {
    headers: {
      Authorization: `token ${token}`,
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.141 Safari/537.36",
    },
    events: {
      onResponse: (resp) => {
        if (String(resp.statusCode).startsWith("4")) {
          return Promise.reject(`ERROR: ${JSON.parse(resp.body).message}`);
        } else {
          return resp;
        }
      },
    },
  });
  const genFileName = (timestamp) => `boxjs.bak.${timestamp}.json`;
  const genTimestamp = (fname) => fname.match(/boxjs\.bak\.(\d+)\.json/)[1];

  return new (class {
    async findDatabase() {
      return $http.get("/gists").then((response) => {
        const gists = JSON.parse(response.body);
        for (let g of gists) {
          if (g.description === BOX_BACKUP_KEY) {
            return g.id;
          }
        }
        return -1;
      });
    }

    async createDatabase(backups) {
      if (!(backups instanceof Array)) backups = [backups];
      const files = {};
      backups.forEach((b) => {
        files[genFileName(b.time)] = {
          content: b.content,
        };
      });
      return $http
        .post({
          url: "/gists",
          body: JSON.stringify({
            description: BOX_BACKUP_KEY,
            public: false,
            files,
          }),
        })
        .then((resp) => {
          return JSON.parse(resp.body).id;
        });
    }

    async deleteDatabase(id) {
      return $http.delete(`/gists/${id}`);
    }

    async getBackups(id) {
      const gist = await $http
        .get(`/gists/${id}`)
        .then((resp) => JSON.parse(resp.body));
      const { files } = gist;
      const backups = [];
      for (let name of Object.keys(files)) {
        backups.push({
          time: genTimestamp(name),
          url: files[name].raw_url,
        });
      }
      return backups;
    }

    async addBackups(id, backups) {
      if (!(backups instanceof Array)) backups = [backups];
      const files = {};
      backups.forEach((b) => (files[genFileName(b.time)] = {content: b.content}));
      return this.updateBackups(id, files);
    }

    async deleteBackups(id, timestamps) {
      if (!(timestamps instanceof Array)) timestamps = [timestamps];
      const files = {};
      timestamps.forEach((t) => (files[genFileName(t)] = {}));
      return this.updateBackups(id, files);
    }

    async updateBackups(id, files) {
      return $http.patch({
        url: `/gists/${id}`,
        body: JSON.stringify({ files }),
      });
    }
  })();
}

// prettier-ignore
function ENV(){const e="undefined"!=typeof $task,n="undefined"!=typeof $loon,o="undefined"!=typeof $httpClient&&!this.isLoon,i="function"==typeof require&&"undefined"!=typeof $jsbox;return{isQX:e,isLoon:n,isSurge:o,isNode:"function"==typeof require&&!i,isJSBox:i}}
function HTTP(e,t={}){const{isQX:o,isLoon:s,isSurge:n}=ENV();const r={};return["GET","POST","PUT","DELETE","HEAD","OPTIONS","PATCH"].forEach(u=>r[u.toLowerCase()]=(r=>(function(r,u){(u="string"==typeof u?{url:u}:u).url=e?e+u.url:u.url;const i=(u={...t,...u}).timeout,T={onRequest:()=>{},onResponse:e=>e,onTimeout:()=>{},...u.events};let a,c;T.onRequest(r,u),a=o?$task.fetch({method:r,...u}):new Promise((e,t)=>{(n||s?$httpClient:require("request"))[r.toLowerCase()](u,(o,s,n)=>{o?t(o):e({statusCode:s.status||s.statusCode,headers:s.headers,body:n})})});const m=i?new Promise((e,t)=>{c=setTimeout(()=>(T.onTimeout(),t(`${r} URL: ${u.url} exceeds the timeout ${i} ms`)),i)}):null;return(m?Promise.race([m,a]).then(e=>(clearTimeout(c),e)):a).then(e=>T.onResponse(e))})(u,r))),r}
