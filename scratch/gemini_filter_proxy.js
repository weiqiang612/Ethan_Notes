const http = require('http');

const TARGET_PORT = 8046; // 转发给：CCSwitch 的实际监听端口
const PROXY_PORT = 8047;  // 监听在：8047 端口（在此作为中间人拦截网关流量）

// 递归深度擦除对象中的 cache_control 键，解决 Gemini 的 400 报错
function stripCacheControl(obj, count = { val: 0 }) {
  if (Array.isArray(obj)) {
    obj.forEach(item => stripCacheControl(item, count));
  } else if (obj !== null && typeof obj === 'object') {
    if ('cache_control' in obj) {
      delete obj.cache_control;
      count.val++;
    }
    for (const key in obj) {
      stripCacheControl(obj[key], count);
    }
  }
  return count.val;
}

const server = http.createServer((req, res) => {
  let body = [];
  req.on('data', chunk => {
    body.push(chunk);
  });
  req.on('end', () => {
    body = Buffer.concat(body);

    let modifiedBody = body;
    let cleanedCount = 0;
    
    // 如果是 POST 请求且是 JSON 格式，解析并清洗数据
    if (req.method === 'POST' && req.headers['content-type']?.includes('application/json')) {
      try {
        const json = JSON.parse(body.toString());
        const countObj = { val: 0 };
        stripCacheControl(json, countObj);
        cleanedCount = countObj.val;
        modifiedBody = Buffer.from(JSON.stringify(json));
      } catch (e) {
        // 解析失败则保留原样
      }
    }

    if (cleanedCount > 0) {
      console.log(`[🔄 拦截清洗] ${req.method} ${req.url} - 成功擦除 ${cleanedCount} 处 cache_control 缓存标记`);
    } else {
      console.log(`[🟢 正常转发] ${req.method} ${req.url}`);
    }

    // 构造转发给 Antigravity Tools 的请求参数
    const options = {
      hostname: '127.0.0.1',
      port: TARGET_PORT,
      path: req.url,
      method: req.method,
      headers: {
        ...req.headers,
        host: `127.0.0.1:${TARGET_PORT}`,
        'content-length': Buffer.byteLength(modifiedBody)
      }
    };

    const proxyReq = http.request(options, proxyRes => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });

    proxyReq.on('error', err => {
      res.writeHead(500);
      res.end('Proxy Error: ' + err.message);
    });

    proxyReq.write(modifiedBody);
    proxyReq.end();
  });
});

server.listen(PROXY_PORT, '127.0.0.1', () => {
  console.log(`=======================================================`);
  console.log(`[Cache-Control Filter Proxy] 本地中转过滤器已启动！`);
  console.log(`👉 请将您的 Claude Code 环境变量配置为: http://127.0.0.1:${PROXY_PORT}/v1`);
  console.log(`👉 流量将自动清洗并转发给 Antigravity Tools: http://127.0.0.1:${TARGET_PORT}`);
  console.log(`=======================================================`);
});
