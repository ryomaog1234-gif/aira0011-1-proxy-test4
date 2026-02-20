const http = require('http');
const httpProxy = require('http-proxy');

const proxy = httpProxy.createProxyServer({
  target: 'https://hitomi.la', // ログインしたいサイトのURL
  changeOrigin: true,            // ホストヘッダーをターゲットに合わせる
  autoRewrite: true,             // リダイレクト先をプロキシURLに書き換える
  xfwd: true,                    // X-Forwarded-For ヘッダーを追加
  cookieDomainRewrite: "",       // 重要：Cookieの送信先ドメインをプロキシに変更
  preserveHeaderKeyCase: true    // ヘッダーの大文字小文字を維持
});

const server = http.createServer((req, res) => {
  // エラーハンドリング
  proxy.web(req, res, {}, (err) => {
    console.error('Proxy Error:', err);
    res.writeHead(502);
    res.end('Proxy Error');
  });
});

// セッション維持のためにCookieヘッダーを調整する設定
proxy.on('proxyRes', function (proxyRes, req, res) {
  // ブラウザからのCookieを受け入れ可能にする処理
  if (proxyRes.headers['set-cookie']) {
    proxyRes.headers['set-cookie'] = proxyRes.headers['set-cookie'].map(cookie => 
      cookie.replace(/Domain=[^;]+;?/, '') // ターゲットドメインの制限を解除
    );
  }
});

server.listen(3000, () => {
  console.log('Login-ready proxy running on http://localhost:3000');
});
