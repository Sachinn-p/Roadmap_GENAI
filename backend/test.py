import requests
import os
from dotenv import load_dotenv

load_dotenv()

url = "https://youtube138.p.rapidapi.com/video/details/"

querystring = {"q":"despacito","hl":"en","gl":"US"}

headers = {
	"x-rapidapi-key": os.getenv('RAPIDAPI_KEY', ''),
	"x-rapidapi-host": "youtube138.p.rapidapi.com"
}

response = requests.get(url, headers=headers, params=querystring)

print(response.json())