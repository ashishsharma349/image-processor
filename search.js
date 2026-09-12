const https = require('https');
const options = {
  hostname: 'api.stackexchange.com',
  path: '/2.3/search?order=desc&sort=relevance&intitle=Client network socket disconnected before secure TLS connection was established&site=stackoverflow',
  headers: { 'Accept-Encoding': 'identity' }
};
https.get(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log(JSON.parse(data).items.map(i => i.title + ' ' + i.link)));
});
