import requests

url = "https://youtube138.p.rapidapi.com/video/details/"

querystring = {"q":"despacito","hl":"en","gl":"US"}

headers = {
	"x-rapidapi-key": "2b3144e1b5mshb2d29817954cba9p134811jsnb963da94911e",
	"x-rapidapi-host": "youtube138.p.rapidapi.com"
}

response = requests.get(url, headers=headers, params=querystring)

print(response.json())