from __future__ import annotations
import os
import scanner.pic
from PIL import Image,ImageDraw,ImageFont
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from scanner.waveshare_epd import epd7in5_V2

class DisplayBarCode:
    __barcode_label = 'Last Bar Code Scanned:'
    __pic_dir = os.path.dirname(scanner.pic.__file__)
    __font24 = ImageFont.truetype(os.path.join(__pic_dir, 'Font.ttc'), 24)

    def __init__(self, epd: epd7in5_V2.EPD):
        self.epd = epd
        epd.init()
        epd.Clear()
        epd.sleep()

    def barcode_update(self, barcode: str):
        epd = self.epd
        epd.init_part()
        Himage = Image.new('1', (epd.width, epd.height), 255)  # 255: clear the frame
        draw = ImageDraw.Draw(Himage)
        draw.text((10, 0), f'{self.__barcode_label}: {barcode}', font = self.__font24, fill = 0)
        draw.line((20, 50, 70, 100), fill = 0)
        epd.display_Partial(epd.getbuffer(Himage))
        epd.sleep()
