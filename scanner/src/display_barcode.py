from __future__ import annotations
import os
from typing import TYPE_CHECKING
from PIL import Image, ImageDraw, ImageFont
import pic

if TYPE_CHECKING:
    from scanner.waveshare_epd import epd7in5_V2

class DisplayBarCode:
    __barcode_label = 'Last Bar Code Scanned:'
    __pic_dir = os.path.dirname(pic.__file__)
    __font24 = ImageFont.truetype(os.path.join(__pic_dir, 'Font.ttc'), 24)

    def __init__(self, epd: epd7in5_V2.EPD) -> None:
        self.epd = epd
        epd.init()
        epd.Clear()
        epd.sleep()

    def barcode_update(self, barcode: str) -> None:
        epd = self.epd
        epd.init_part()
        hi_image = Image.new('1', (epd.width, epd.height), 255)  # 255: clear the frame
        draw = ImageDraw.Draw(hi_image)
        draw.text((10, 0), f'{self.__barcode_label}:', font = self.__font24, fill = 0)
        draw.text((10, 20), f'{barcode}', font = self.__font24, fill = 0)
        draw.line((20, 50, 70, 100), fill = 0)
        epd.display_Partial(epd.getbuffer(hi_image), 0, 0, epd.width, epd.height)
        epd.sleep()
