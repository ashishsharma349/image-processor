import urllib.request, re
url = 'https://lite.duckduckgo.com/lite/'
data = urllib.parse.urlencode({'q': 'node-fetch Hugging Face Spaces proxy TLS error'}).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={'User-Agent': 'Mozilla/5.0'})
try:
    html = urllib.request.urlopen(req).read().decode('utf-8')
    snippets = re.findall(r"<td class='result-snippet'[^>]*>(.*?)</td>", html, re.IGNORECASE | re.DOTALL)
    for s in snippets[:3]:
        print(re.sub(r'<[^>]+>', '', s).strip())
except Exception as e:
    print(e)
