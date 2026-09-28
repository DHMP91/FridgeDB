
import os
import logging
import asyncio
import aiohttp
from dotenv import load_dotenv
load_dotenv()
logging.basicConfig(level=logging.ERROR)


class AppClient:
    def __init__(self):
        self.base_url = os.getenv("SERVER_BASE_URL")
        self.api_key = os.getenv("API_KEY")

    async def running(self) -> bool:
        url = f"{self.base_url}"
        try:
            timeout = aiohttp.ClientTimeout(total=5)
            async with aiohttp.ClientSession(timeout=timeout) as session:
                async with session.get(url) as resp:
                    return resp.status < 500
        except (aiohttp.ClientError, asyncio.TimeoutError):
            return False

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
        except aiohttp.ClientError as e:
            logging.exception("Issue posting barcode to server")
            return str(e)


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
        except aiohttp.ClientError:
            logging.exception("Issue getting inventory list from server")
            return []
