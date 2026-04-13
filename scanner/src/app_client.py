
import os
import aiohttp
from dotenv import load_dotenv
load_dotenv()


class AppClient:
    def __init__(self):
        self.base_url = os.getenv("SERVER_BASE_URL")
        self.api_key = os.getenv("API_KEY")

    async def post_barcode(self, code: str, force: bool = False) -> str:
        payload = {"code": code, "force": force }
        url = f"{self.base_url}/api/scanner/barcode"
        headers = {
            "Accept": "application/json",
            "x-api-key": self.api_key
        }
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(url, headers=headers, json=payload) as resp:
                    json = await resp.json()
                    return json['message']
        except aiohttp.ClientResponseError as e:
            return f"{e.message} ({e.status})"


    async def get_inventory_list(self):
        url = f"{self.base_url}/api/items"
        headers = {
            "Accept": "application/json",
            "x-api-key": self.api_key
        }
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers=headers) as resp:
                    return await resp.json()
        except aiohttp.ClientResponseError:
            return []
