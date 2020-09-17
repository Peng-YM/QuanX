const isLoon = typeof $loon !== "undefined";
const isSurge = typeof $httpClient !== "undefined" && !isLoon;

let NextDNS = $persistentStore.read("NextDNS");
if (!NextDNS) {
  $notification.post(
    "🔰 NextDNS",
    "❌ 无法生成模块",
    "请到BoxJS填写NextDNS配置！"
  );
  $done({
    response: {
      status: 500,
    },
  });
} else {
  NextDNS = JSON.parse(NextDNS);
  const servers = NextDNS.servers.split(",").map((s) => s.trim());
  if (isSurge) {
    $done({
      response: {
        status: 200,
        headers: {
          "Content-Type": "text/plain;charset=UTF-8",
        },
        body: Surge_Producer(servers),
      },
    });
  }
}

function Surge_Producer(servers) {
  return `#!name=NextDNS
#!desc=NextDNS (屏蔽广告，跟踪器和恶意网站) @ Peng-YM

[General]
dns-server = ${servers.join(", ")}
always-real-ip = link-ip.nextdns.io

[Rule]
DOMAIN-KEYWORD,nextdns,DIRECT

[Host]
link-ip.nextdns.io = server:${servers[0]}

[Script]
event network-changed script-path=https://raw.githubusercontent.com/Peng-YM/QuanX/master/Tools/NextDNS/next-dns.js
`;
}
