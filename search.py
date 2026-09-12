import urllib.request, json, urllib.parse, gzip, io
query = urllib.parse.quote('Hugging face HTTP_PROXY node-fetch')
url = f'https://api.stackexchange.com/2.3/search?order=desc&sort=relevance&q={query}&site=stackoverflow'
try:
    req = urllib.request.Request(url, headers={'Accept-Encoding': 'gzip'})
    with urllib.request.urlopen(req) as response:
        if response.info().get('Content-Encoding') == 'gzip':
            f = gzip.GzipFile(fileobj=io.BytesIO(response.read()))
            data = json.loads(f.read().decode())
        else:
            data = json.loads(response.read().decode())
        for item in data.get('items', [])[:5]:
            print(f"- {item['title']} ({item['link']})")
except Exception as e:
    print(e)
