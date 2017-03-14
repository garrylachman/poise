const Back = require('./back');
const net  = require('net');

module.exports = class Front {

  constructor(options) {
    this.options = options || {};
    this.backs = {};
    this.pool  = [];
    this.allowIPs = this.options.allowIPs || ["127.0.0.1"];
    this.server = net.createServer((socket) => this.handle(socket));
  }

  back(name, options) {
    let back = this.backs[name] = new Back(options);
    this.pool.push(back);
    back.name = name;
    return back;
  }

  listen() {
    this.server.listen.apply(this.server, arguments);
  }

  getIP(str) {
    let regex = /([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)/g;
    while ((m = regex.exec(str)) !== null) {
      // This is necessary to avoid infinite loops with zero-width matches
      if (m.index === regex.lastIndex) {
          regex.lastIndex++;
      }

      if (m.length > 0) {
        return m[1];
      }
    }
    return str;
  }

  handle(socket) {
    let userIP = this.getIP(socket.remoteAddress);
    if (this.allowIPs.indexOf(userIP) == -1)  {
      socket.end();
    } else {
      this.pool[0].handle(socket);
    }
  }
}
