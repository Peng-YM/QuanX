/**
彩云天气 for Scriptable
@author: Peng-YM
*/

/********************** SCRIPT START *********************************/
const $http = HTTP();

// 配置
const token = {
  caiyun: "2zHu=DbPVTvusLnq",
  tencent: "AHEBZ-ASTWX-CIW4P-7TV7T-AWKLS-7CFWP",
};

const location = {
  latitude: 23.61,
  longitude: 113.69,
};

await query();
const widget = createWidget();
Script.setWidget(widget);
Script.complete();

async function query() {
  const isNumeric = (input) => input && !isNaN(input);
  if (!isNumeric(location.latitude) || !isNumeric(location.longitude)) {
    throw new Error("❌ 经纬度设置错误！");
  }

  if (Number(location.latitude) > 90 || Number(location.longitude) > 180) {
    throw new Error(
      "🤖 地理小课堂：经度的范围是0~180，纬度是0~90哦。请仔细检查经纬度是否设置正确。"
    );
  }
  // query API
  const url = `https://api.caiyunapp.com/v2.5/${token.caiyun}/${location.longitude},${location.latitude}/weather?lang=zh_CN&dailystart=0&hourlysteps=384&dailysteps=16&alert=true`;

  const weather = await $http.get({
    url,
    headers: {
      "User-Agent": "ColorfulCloudsPro/5.0.10 (iPhone; iOS 14.0; Scale/3.00)",
    },
  })
    .then((resp) => {
      const body = JSON.parse(resp.body);
      if (body.status === "failed") {
        throw new Error(body.error);
      }
      return body;
    })
    .catch((err) => {
      throw err;
    });
  $weather = weather;

  address = await $http.get(
    `https://apis.map.qq.com/ws/geocoder/v1/?key=${token.tencent}&location=${location.latitude},${location.longitude}`
  )
    .then((resp) => {
      const body = JSON.parse(resp.body);
      if (body.status !== 0) {
        throw new Error("❌ 腾讯地图Token错误");
      }
      return body.result.address_component;
    })
    .catch((err) => {
      throw err;
    });

  $address = address;
}

function createWidget() {
  const data = $weather.result;
  const address = $address;

  const realtime = data.realtime;
  const keypoint = data.forecast_keypoint;

    const weatherInfo = 
`[彩云天气] ${address.city} ${address.district} ${address.street}
${mapSkycon(realtime.skycon)[0]} ${realtime.temperature} ℃  🌤 空气质量 ${realtime.air_quality.description.chn}
🔱 ${keypoint}
🌡 体感${realtime.life_index.comfort.desc} ${realtime.apparent_temperature} ℃  💧 湿度 ${(realtime.humidity * 100).toFixed(0)}%
🌞 紫外线 ${realtime.life_index.ultraviolet.desc} 💨 ${mapWind(realtime.wind.speed,realtime.wind.direction)}
`;
  console.log(weatherInfo);
  const widget = new ListWidget();
  for (const line of weatherInfo.split("\n")) {
    const h = widget.addText(line);
    h.fontSize = 17;
    h.color = Color.black();
  }
  return widget;
}

/************************** 天气对照表 *********************************/

function mapWind(speed, direction) {
  let description = "";
  let d_description = "";

  if (speed < 1) {
    description = "无风";
    return description;
  } else if (speed <= 5) {
    description = "1级 微风徐徐";
  } else if (speed <= 11) {
    description = "2级 清风";
  } else if (speed <= 19) {
    description = "3级 树叶摇摆";
  } else if (speed <= 28) {
    description = "4级 树枝摇动";
  } else if (speed <= 38) {
    description = "5级 风力强劲";
  } else if (speed <= 49) {
    description = "6级 风力强劲";
  } else if (speed <= 61) {
    description = "7级 风力超强";
  } else if (speed <= 74) {
    description = "8级 狂风大作";
  } else if (speed <= 88) {
    description = "9级 狂风呼啸";
  } else if (speed <= 102) {
    description = "10级 暴风毁树";
  } else if (speed <= 117) {
    description = "11级 暴风毁树";
  } else if (speed <= 133) {
    description = "12级 飓风";
  } else if (speed <= 149) {
    description = "13级 台风";
  } else if (speed <= 166) {
    description = "14级 强台风";
  } else if (speed <= 183) {
    description = "15级 强台风";
  } else if (speed <= 201) {
    description = "16级 超强台风";
  } else if (speed <= 220) {
    description = "17级 超强台风";
  }

  if (direction >= 348.76 || direction <= 11.25) {
    d_description = "北";
  } else if (direction >= 11.26 && direction <= 33.75) {
    d_description = "北东北";
  } else if (direction >= 33.76 && direction <= 56.25) {
    d_description = "东北";
  } else if (direction >= 56.26 && direction <= 78.75) {
    d_description = "东东北";
  } else if (direction >= 78.76 && direction <= 101.25) {
    d_description = "东";
  } else if (direction >= 101.26 && direction <= 123.75) {
    d_description = "东东南";
  } else if (direction >= 123.76 && direction <= 146.25) {
    d_description = "东南";
  } else if (direction >= 146.26 && direction <= 168.75) {
    d_description = "南东南";
  } else if (direction >= 168.76 && direction <= 191.25) {
    d_description = "南";
  } else if (direction >= 191.26 && direction <= 213.75) {
    d_description = "南西南";
  } else if (direction >= 213.76 && direction <= 236.25) {
    d_description = "西南";
  } else if (direction >= 236.26 && direction <= 258.75) {
    d_description = "西西南";
  } else if (direction >= 258.76 && direction <= 281.25) {
    d_description = "西";
  } else if (direction >= 281.26 && direction <= 303.75) {
    d_description = "西西北";
  } else if (direction >= 303.76 && direction <= 326.25) {
    d_description = "西北";
  } else if (direction >= 326.26 && direction <= 348.75) {
    d_description = "北西北";
  }

  return `${d_description}风 ${description}`;
}

// 天气状况 --> 自然语言描述
// icon来源：github@58xinian
function mapSkycon(skycon) {
  const map = {
    CLEAR_DAY: [
      "☀️ 日间晴朗",
      "https://raw.githubusercontent.com/58xinian/icon/master/Weather/CLEAR_DAY.gif",
    ],
    CLEAR_NIGHT: [
      "✨ 夜间晴朗",
      "https://raw.githubusercontent.com/58xinian/icon/master/Weather/CLEAR_NIGHT.gif",
    ],
    PARTLY_CLOUDY_DAY: [
      "⛅️ 日间多云",
      "https://raw.githubusercontent.com/58xinian/icon/master/Weather/PARTLY_CLOUDY_DAY.gif",
    ],
    PARTLY_CLOUDY_NIGHT: [
      "☁️ 夜间多云",
      "https://raw.githubusercontent.com/58xinian/icon/master/Weather/PARTLY_CLOUDY_NIGHT.gif",
    ],
    CLOUDY: [
      "☁️ 阴",
      "https://raw.githubusercontent.com/58xinian/icon/master/Weather/CLOUDY.gif",
    ],
    LIGHT_HAZE: [
      "😤 轻度雾霾",
      "https://raw.githubusercontent.com/58xinian/icon/master/Weather/HAZE.gif",
    ],
    MODERATE_HAZE: [
      "😤 中度雾霾",
      "https://raw.githubusercontent.com/58xinian/icon/master/Weather/HAZE.gif",
    ],
    HEAVY_HAZE: [
      "😤 重度雾霾",
      "https://raw.githubusercontent.com/58xinian/icon/master/Weather/HAZE.gif",
    ],
    LIGHT_RAIN: [
      "💧 小雨",
      "https://raw.githubusercontent.com/58xinian/icon/master/Weather/LIGHT.gif",
    ],
    MODERATE_RAIN: [
      "💦 中雨",
      "https://raw.githubusercontent.com/58xinian/icon/master/Weather/MODERATE_RAIN.gif",
    ],
    HEAVY_RAIN: [
      "🌧 大雨",
      "https://raw.githubusercontent.com/58xinian/icon/master/Weather/STORM_RAIN.gif",
    ],
    STORM_RAIN: [
      "⛈ 暴雨",
      "https://raw.githubusercontent.com/58xinian/icon/master/Weather/STORM_RAIN.gif",
    ],
    LIGHT_SNOW: [
      "🌨 小雪",
      "https://raw.githubusercontent.com/58xinian/icon/master/Weather/LIGHT_SNOW.gif",
    ],
    MODERATE_SNOW: [
      "❄️ 中雪",
      "https://raw.githubusercontent.com/58xinian/icon/master/Weather/MODERATE_SNOW.gif",
    ],
    HEAVY_SNOW: [
      "☃️ 大雪",
      "https://raw.githubusercontent.com/58xinian/icon/master/Weather/HEAVY_SNOW.gif",
    ],
    STORM_SNOW: [
      "⛄️暴雪",
      "https://raw.githubusercontent.com/58xinian/icon/master/Weather/HEAVY_SNOW",
    ],
    DUST: ["💨 浮尘"],
    SAND: ["💨 沙尘"],
    WIND: ["🌪 大风"],
  };
  return map[skycon];
}

// 雷达降 水/雪 强度 --> skycon
function mapPrecipitation(intensity) {
  if (0.031 < intensity && intensity < 0.25) {
    return "LIGHT";
  } else if (intensity < 0.35) {
    return "MODERATE";
  } else if (intensity < 0.48) {
    return "HEADY";
  } else if (intensity >= 0.48) {
    return "STORM";
  }
}

// prettier-ignore
/*********************************** API *************************************/
function ENV(){const e="undefined"!=typeof $task,t="undefined"!=typeof $loon,s="undefined"!=typeof $httpClient&&!this.isLoon,o="function"==typeof require&&"undefined"!=typeof $jsbox;return{isQX:e,isLoon:t,isSurge:s,isNode:"function"==typeof require&&!o,isJSBox:o,isRequest:"undefined"!=typeof $request,isScriptable:"undefined"!=typeof importModule}}function HTTP(e,t={}){const{isQX:s,isLoon:o,isSurge:i,isScriptable:n,isNode:r}=ENV();const u={};return["GET","POST","PUT","DELETE","HEAD","OPTIONS","PATCH"].forEach(h=>u[h.toLowerCase()]=(u=>(function(u,h){(h="string"==typeof h?{url:h}:h).url=e?e+h.url:h.url;const c=(h={...t,...h}).timeout,l={onRequest:()=>{},onResponse:e=>e,onTimeout:()=>{},...h.events};let d,a;if(l.onRequest(u,h),s)d=$task.fetch({method:u,...h});else if(o||i||r)d=new Promise((e,t)=>{(r?require("request"):$httpClient)[u.toLowerCase()](h,(s,o,i)=>{s?t(s):e({statusCode:o.status||o.statusCode,headers:o.headers,body:i})})});else if(n){const e=new Request(h.url);e.method=u,e.headers=h.headers,e.body=h.body,d=new Promise((t,s)=>{e.loadString().then(s=>{t({statusCode:e.response.statusCode,headers:e.response.headers,body:s})}).catch(e=>s(e))})}const f=c?new Promise((e,t)=>{a=setTimeout(()=>(l.onTimeout(),t(`${u} URL: ${h.url} exceeds the timeout ${c} ms`)),c)}):null;return(f?Promise.race([f,d]).then(e=>(clearTimeout(a),e)):d).then(e=>l.onResponse(e))})(h,u))),u};
/*****************************************************************************/
