import sys
from typing import Union
if sys.platform.startswith('linux'):
    import evdev # pyright: ignore[reportMissingImports] # pylint: disable=import-error
    from evdev import InputDevice, list_devices, ecodes # pyright: ignore[reportMissingImports] # pylint: disable=import-error
else:
    raise OSError("This script is Linux-only")

class ScannerReader:
    scancodes_to_char = {
        # Letters (lowercase for simplicity)
        ecodes.KEY_A: 'a', ecodes.KEY_B: 'b', ecodes.KEY_C: 'c',
        ecodes.KEY_D: 'd', ecodes.KEY_E: 'e', ecodes.KEY_F: 'f',
        ecodes.KEY_G: 'g', ecodes.KEY_H: 'h', ecodes.KEY_I: 'i',
        ecodes.KEY_J: 'j', ecodes.KEY_K: 'k', ecodes.KEY_L: 'l',
        ecodes.KEY_M: 'm', ecodes.KEY_N: 'n', ecodes.KEY_O: 'o',
        ecodes.KEY_P: 'p', ecodes.KEY_Q: 'q', ecodes.KEY_R: 'r',
        ecodes.KEY_S: 's', ecodes.KEY_T: 't', ecodes.KEY_U: 'u',
        ecodes.KEY_V: 'v', ecodes.KEY_W: 'w', ecodes.KEY_X: 'x',
        ecodes.KEY_Y: 'y', ecodes.KEY_Z: 'z',
        # Numbers
        ecodes.KEY_0: '0', ecodes.KEY_1: '1', ecodes.KEY_2: '2',
        ecodes.KEY_3: '3', ecodes.KEY_4: '4', ecodes.KEY_5: '5',
        ecodes.KEY_6: '6', ecodes.KEY_7: '7', ecodes.KEY_8: '8',
        ecodes.KEY_9: '9',
        # Other keys (add more as needed)
        ecodes.KEY_SPACE: ' ',
        ecodes.KEY_MINUS: '-',
        # ecodes.KEY_ENTER: '\n',
        ecodes.KEY_BACKSPACE: '<BS>', # Special representation
        ecodes.KEY_TAB: '\t',
        ecodes.KEY_DOT: '.',
        ecodes.KEY_COMMA: ',',
        ecodes.KEY_SLASH: '/',
    }

    def find_scanner(self, scanner_name: str) -> InputDevice:
        devices = [InputDevice(path) for path in list_devices()]
        for device in devices:
            if device.name == scanner_name:
                return device
        return None

    def read_scanner(self, device: InputDevice) -> Union[None, str]:
        barcode = ""
        for event in device.read_loop():
            if event.type == evdev.ecodes.EV_KEY:
                data = evdev.categorize(event)
                if data.keystate == 0: # Key Up
                    if data.scancode == 28: # Enter key
                        return barcode
                    elif data.scancode in self.scancodes_to_char:
                        barcode += self.scancodes_to_char[data.scancode]
        return None

class ScannerNotFoundException(Exception):
    """ Raise when scanner could not be found"""
