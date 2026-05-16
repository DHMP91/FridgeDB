from __future__ import annotations
import os
from datetime import datetime
from typing import TYPE_CHECKING
from PIL import Image, ImageDraw, ImageFont
import pic

if TYPE_CHECKING:
    from src.waveshare_epd import epd7in5_V2

class Display:
    __pic_dir = os.path.dirname(pic.__file__)
    __font20 = ImageFont.truetype(os.path.join(__pic_dir, 'Font.ttc'), 20)
    __font18 = ImageFont.truetype(os.path.join(__pic_dir, 'Font.ttc'), 18)

    def __init__(self, epd: epd7in5_V2.EPD) -> None:
        self.epd = epd
        epd.init()
        epd.Clear()
        epd.sleep()
        barcode_height = 40
        self.__y_axis_barcode_start = self.epd.height - barcode_height
        self.__y_axis_barcode_end = self.epd.height
        self.__y_axis_inventory_start = 0
        self.__y_axis_inventory_end = self.epd.height - barcode_height
        self.__new_line_spacing = 20

    def barcode_update(self, code: str, message: str) -> None:
        epd = self.epd
        epd.init_part()
        with Image.new('1', (epd.width, epd.height), 255) as hi_image:# 255: clear the frame
            draw = ImageDraw.Draw(hi_image)
            draw.text(
                (0, 0),
                f'Last Barcode Scanned [ {code} ] [ {message} ]',
                font = self.__font18, fill = 0
            )
            # draw.text(
            #   (0, self.__new_line_spacing*2),
            #   f'{message}',
            #   font = self.__font20, fill = 0
            # )
            epd.display_Partial(
                epd.getbuffer(hi_image),
                0,
                self.__y_axis_barcode_start,
                epd.width,
                self.__y_axis_barcode_end,
            )

    def display_inventory(self, items) -> None:
        epd = self.epd
        with Image.new('1', (epd.width, epd.height), 255)  as hi_image:# 255: clear the frame
            draw = ImageDraw.Draw(hi_image)

            # Top Border
            now = datetime.now()
            formatted_time = now.strftime("%Y-%m-%d %H:%M:%S")
            draw.text(
                (0, 0),
                'Inventory [ Last updated ' + formatted_time  + ' ]',
                font = self.__font20,
                fill = 0
            )
            draw.text(
                (0, self.__new_line_spacing),
                "-" * 138,
                font = self.__font20,
                fill = 0
            )

            # Create Table Body
            starting = self.__new_line_spacing * 2
            start_line = starting
            item_per_column = 18
            columns = 4
            column_count = 0
            column_width = int(epd.width/columns)
            column = 0
            for i in range(0, item_per_column*columns):
                if len(items) - 1 < i:
                    cell_content = "|"
                else:
                    quantity_str = str(items[i]["quantity"]).zfill(2)
                    short_name = items[i]["name"][:14]
                    cell_content = f'| {quantity_str} | {short_name}'

                draw.text(
                    (column, start_line),
                    cell_content,
                    font = self.__font18,
                    fill = 0
                )
                start_line += self.__new_line_spacing
                if ((i+1) % item_per_column) == 0:
                    column += column_width
                    column_count += 1
                    start_line = starting

            # Right border
            start_line = starting
            for i in range(0, item_per_column*columns):
                draw.text(
                    (epd.width - 5, start_line),
                    "|",
                    font = self.__font18,
                    fill = 0
                )
                start_line += self.__new_line_spacing

            # Bottom border
            second_last_row = ((item_per_column + 1) * self.__new_line_spacing) + starting
            draw.text(
                (0, second_last_row),
                "-" * 138,
                font = self.__font18,
                fill = 0
            )

            # Display
            epd.display_Partial(
                epd.getbuffer(hi_image),
                0,
                self.__y_axis_inventory_start,
                epd.width,
                self.__y_axis_inventory_end
            )
