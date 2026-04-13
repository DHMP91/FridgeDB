
import os
import aiohttp
from dotenv import load_dotenv
load_dotenv()


class AppClient:
    def __init__(self):
        self.base_url = os.getenv("SERVER_BASE_URL")
        self.api_key = os.getenv("API_KEY")
        self.session = aiohttp.ClientSession()

    async def post_barcode(self, code: str, force: bool = False) -> str:
        payload = {"code": code, "force": force }
        url = f"{self.base_url}/api/scanner/barcode"
        try:
            async with self.session.post(url, json=payload) as resp:
                msg = await resp.json()['message']
                return msg
        except aiohttp.ClientResponseError as e:
            return f"{e.message} ({e.status})"
