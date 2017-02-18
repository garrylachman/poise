var Back = require('./back');
var net  = require('net');

export class Front {
  function initialize(options) {
    this.options = options || {};
    this.backs = {};
    this.pool  = [];
    this.allowIPs = this.options.allowIPs || ["127.0.0.1"];
    this.server = net.createServer(#{ self.handle($1) });
  }

  function back(name, options) {
    var back = this.backs[name] = new Back(options);
    this.pool.push(back);
    back.name = name;
    return back;
  }

  function listen() {
    this.server.listen.apply(this.server, arguments);
  }

  function getIP(str) {
    var regex = /([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)/g;
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

  function handle(socket) {
    var userIP = this.getIP(socket.remoteAddress);
    if (this.allowIPs.indexOf(userIP) == -1)  {
      socket.end();
    } else {
      this.pool[0].handle(socket);
    }
  }
}
