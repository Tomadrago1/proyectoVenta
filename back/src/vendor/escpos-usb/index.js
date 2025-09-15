'use strict';
const os = require('os');
const util = require('util');
const EventEmitter = require('events');
let usb = null;

const IFACE_CLASS = {
  AUDIO: 0x01,
  HID: 0x03,
  PRINTER: 0x07,
  HUB: 0x09
};

function USB(vid, pid) {
  if (!usb) {
    usb = require('usb');
  }

  EventEmitter.call(this);
  this.device = null;

  if (vid && pid) {
    this.device = usb.findByIds(vid, pid);
  } else if (vid) {
    this.device = vid;
  } else {
    const devices = USB.findPrinter();
    if (devices && devices.length) this.device = devices[0];
  }

  if (!this.device) throw new Error('Can not find printer');

  return this;
}

USB.findPrinter = function () {
  if (!usb) {
    usb = require('usb');
  }
  return usb.getDeviceList().filter(function (device) {
    try {
      return device.configDescriptor.interfaces.filter(function (iface) {
        return iface.filter(function (conf) {
          return conf.bInterfaceClass === IFACE_CLASS.PRINTER;
        }).length;
      }).length;
    } catch (e) {
      return false;
    }
  });
};

USB.getDevice = function (vid, pid) {
  return new Promise((resolve, reject) => {
    const device = new USB(vid, pid);
    device.open(err => {
      if (err) return reject(err);
      resolve(device);
    });
  });
};

util.inherits(USB, EventEmitter);

USB.prototype.open = function (callback) {
  const self = this;
  let counter = 0;
  this.device.open();
  this.device.interfaces.forEach(function (iface) {
    (function (iface) {
      iface.setAltSetting(iface.altSetting, function () {
        try {
          if (os.platform() !== 'win32') {
            if (iface.isKernelDriverActive()) {
              try {
                iface.detachKernelDriver();
              } catch (e) {
                console.error('[ERROR] Could not detatch kernel driver: %s', e);
              }
            }
          }
          iface.claim();
          iface.endpoints.filter(function (endpoint) {
            if (endpoint.direction == 'out' && !self.endpoint) {
              self.endpoint = endpoint;
            }
          });
          if (self.endpoint) {
            self.emit('connect', self.device);
            callback && callback(null, self);
          } else if (++counter === this.device.interfaces.length && !self.endpoint) {
            callback && callback(new Error('Can not find endpoint from printer'));
          }
        } catch (e) {
          callback && callback(e);
        }
      });
    })(iface);
  });
  return this;
};

USB.prototype.write = function (data, callback) {
  this.emit('data', data);
  this.endpoint.transfer(data, callback);
  return this;
};

USB.prototype.close = function (callback) {
  if (this.device) {
    try {
      this.device.close();
      callback && callback(null);
      this.emit('close', this.device);
    } catch (e) {
      callback && callback(e);
    }
  } else {
    callback && callback(null);
  }
  return this;
};

module.exports = USB;
