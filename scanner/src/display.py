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

    def __init__(self, epd: epd7in5_V2.EPD) -> None:
        self.epd = epd
        epd.init()
        epd.Clear()
        epd.sleep()
        self.__y_axis_barcode_start = 0
        self.__y_axis_barcode_end = 60
        self.__y_axis_inventory_start = 60
        self.__y_axis_inventory_end = self.epd.height - self.__y_axis_barcode_end
        self.__new_line_spacing = 20

    def barcode_update(self, barcode: str) -> None:
        epd = self.epd
        epd.init_part()
        hi_image = Image.new('1', (epd.width, self.__y_axis_barcode_end), 255)  # 255: clear the frame
        draw = ImageDraw.Draw(hi_image)
        draw.text((10, 0), f'Last Bar Code Scanned: {barcode}', font = self.__font24, fill = 0)
        draw.text((10, self.__new_line_spacing), f'{barcode}', font = self.__font24, fill = 0)
        epd.display_Partial(
            epd.getbuffer(hi_image),
            0,
            self.__y_axis_barcode_start,
            epd.width,
            self.__y_axis_barcode_end,
        )
        epd.sleep()

    def display_inventory(self, items) -> None:
        epd = self.epd
        epd.init_part()
        hi_image = Image.new('1', (epd.width, self.__y_axis_inventory_end), 255)  # 255: clear the frame
        draw = ImageDraw.Draw(hi_image)

        # Create Header
        draw.text(
            (epd.width/2 , 0),
            '-----Inventory-----',
            font = self.__font18,
            fill = 0
        )

        # Create Body 3 columns and 20 item each
        start_line = self.__new_line_spacing
        item_per_column = 15
        column_width = int(epd.width/3)
        column = 0
        for i in range(0, 60):
            if len(items) - 1 < i:
                break
            if (i+1 % item_per_column) == 0:
                column += column_width
                start_line = self.__new_line_spacing
            draw.text(
                (10 + column, start_line),
                f'{items[i]["quantity"]}x {items[i]["name"][:column_width - 5]}',
                font = self.__font18,
                fill = 0
            )
            start_line += self.__new_line_spacing

        # Display
        epd.display_Partial(
            epd.getbuffer(hi_image),
            0,
            self.__y_axis_inventory_start,
            epd.width,
            self.__y_axis_inventory_end
        )
        epd.sleep()
