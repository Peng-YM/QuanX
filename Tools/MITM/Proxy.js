// Load configurations
const fs = require("fs");
const config = loadConfig("config.json");
generateRewrites(config);

const { NodeVM } = require("vm2"); // virtual env for executing scripts with context
const vmconfigs = {
  console: "inherit",
  require: {
    builtin: ["fs"],
    mock: {
      fs: {
        readFileSync(path) {
          console.log(`READING FILE: ${config.general.workspace}/${path}`);
          return fs.readFileSync(`${config.general.workspace}/${path}`);
        },
        writeFileSync(path, data) {
          console.log(`WRITING DATA: ${data}`);
        },
        existsSync(path){
          return fs.existsSync(`${config.general.workspace}/${path}`);
        }
      },
    },
  },
};

// Start MITM proxy
const hoxy = require("hoxy");

try {
  const { port, key, cert } = config.proxy;
  const proxy = hoxy.createServer({
    certAuthority: {
      key: fs.readFileSync(key),
      cert: fs.readFileSync(cert),
    },
  });

  addRules(proxy, config);

  proxy.listen(port, function () {
    console.log(`MITM proxy listenning on ${port}...`);
  });
} catch (err) {
  console.error(err);
}

function loadConfig(path) {
  const config = JSON.parse(fs.readFileSync(path));
  console.log(`Configuration loaded: \n${JSON.stringify(config)}`);
  return config;
}

// Generate rewrite rules for QX, Loon and Surge
function generateRewrites(config) {
  let rewrites = `hostname=${config.mitm.join(",")}\n\n`;
  const reducers = [
    {
      name: "Quantumult X",
      func: (prev, script) =>
        prev +
        `${script.pattern} url script-${script.type}-${
          script.require_body ? "body" : "header"
        } ${config.general.remote + script.path}\n`,
    },
    {
      name: "Loon",
      func: (prev, script) =>
        prev +
        `http-${script.type} ${script.pattern} script-path=${
          config.general.remote + script.path
        }, require-body=${script.require_body}, tag=${script.name}\n`,
    },
    {
      name: "Surge",
      func: (prev, script) =>
        prev +
        `type=http-${script.type}, pattern=${script.pattern}, script-path=${
          config.general.remote + "/" + script.path
        }, require-body=${script.require_body}, tag=${script.name}\n`,
    },
  ];

  reducers.forEach((item) => {
    console.log(`Processing rewrites for ${item.name}...`);
    rewrites += config.scripts.reduce(
      item.func,
      `================ ${item.name} ================\n`
    );
    rewrites += "\n";
  });

  fs.writeFileSync("rewrites.txt", rewrites);
}

function addRules(proxy, config) {
  config.scripts.forEach((script) => {
    proxy.intercept(
      {
        phase: script.type,
        as: "string",
      },
      (req, resp) => {
        const url = req.fullUrl();
        if (new RegExp(script.pattern).test(url)) {
          console.log(`Script ${script.name} triggered by ${url}`);
          // load the script
          const code = fs.readFileSync(
            `${config.general.workspace}/${script.path}`
          );
          // request
          const $request = {
            url,
            method: req.method,
            headers: req.headers,
            path: req.url,
            body: script.require_body ? req.string : undefined,
          };
          // response
          const $response = {
            statusCode: resp.statusCode,
            headers: resp.headers,
            body: resp.buffer,
          };

          if (script.type === "request") {
            const $context = {};
            const vm = new NodeVM({...vmconfigs, sandbox: {$context, $request}});
            vm.run(code);
            // modify the request
            req.headers = $context.headers;
            req.string = $context.body;
          } else {
            // response
            const context = {
              $request,
              $response,
              $context: {},
            };
            vm.runInContext(code, context);
            // modify the response
            const $context = {};
            const vm = new NodeVM({
              console: "inherit",
              require: {
                external: true,
              },
              sandbox: { $context, $request, $response },
            });
            vm.run(code);
            resp.headers = $context.headers;
            resp.string = $context.body;
            resp.statusCode = $context.statusCode;
          }
        }
      }
    );
  });
}
