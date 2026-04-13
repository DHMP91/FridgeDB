from __future__ import annotations
import os
from typing import TYPE_CHECKING
from PIL import Image, ImageDraw, ImageFont
import pic

if TYPE_CHECKING:
    from scanner.waveshare_epd import epd7in5_V2

class Display:
    __pic_dir = os.path.dirname(pic.__file__)
    __font24 = ImageFont.truetype(os.path.join(__pic_dir, 'Font.ttc'), 24)
    __font18 = ImageFont.truetype(os.path.join(__pic_dir, 'Font.ttc'), 18)
    __y_axis_barcode = 0
    __y_axis_inventory = 40
    __new_line_spacing = 20

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
        draw.text((10, 0), f'Last Bar Code Scanned: {barcode}', font = self.__font24, fill = 0)
        draw.text((10, self.__new_line_spacing), f'{barcode}', font = self.__font24, fill = 0)
        epd.display_Partial(
            epd.getbuffer(hi_image),
            0,
            self.__y_axis_barcode,
            epd.width,
            epd.height
        )
        epd.sleep()

    def display_inventory(self, items) -> None:
        epd = self.epd
        epd.init_part()
        hi_image = Image.new('1', (epd.width, epd.height), 255)  # 255: clear the frame
        draw = ImageDraw.Draw(hi_image)
        start_line = 0
        for i in range(0, 20):
            if len(items) > i:
                draw.text(
                    (10, start_line),
                    f'{items[i]["name"]}',
                    font = self.__font18,
                    fill = 0
                )
                start_line += self.__new_line_spacing
        epd.display_Partial(
            epd.getbuffer(hi_image),
            0,
            self.__y_axis_inventory,
            epd.width,
            epd.height
        )
        epd.sleep()
