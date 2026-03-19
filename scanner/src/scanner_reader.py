import evdev
from evdev import InputDevice, list_devices

class ScannerReader:
    scancodes = {
        2:'1', 3:'2', 4:'3', 5:'4', 6:'5', 7:'6', 8:'7', 9:'8', 10:'9', 11:'0',
        30:'a', 31:'s', 32:'d', 33:'f', 34:'g', 35:'h', 36:'j', 37:'k', 38:'l',
        44:'z', 45:'x', 46:'c', 47:'v', 48:'b', 49:'n', 50:'m',
        28:'ENTER'
    }

    def find_scanner(self, scanner_name):
        devices = [InputDevice(path) for path in list_devices()]
        for device in devices:
            if device.name == scanner_name:
                return device

    def read_scanner(self, device):
        barcode = ""
        for event in device.read_loop():
            if event.type == evdev.ecodes.EV_KEY:
                data = evdev.categorize(event)
                if data.keystate == 0: # Key Up
                    if data.scancode == 28: # Enter key
                        return barcode
                    elif data.scancode in self.scancodes:
                        barcode += self.scancodes[data.scancode]