const net = require('net');

module.exports = class Server {
  constructor(options) {
    this.options = this.parseOptions(options);
    this.conOpts = { host: this.options.host, port: this.options.port };
    this.connections = 0;
  }

  parseOptions(options) {
    if (typeof options == 'string') {
      let splitted = options.split(':');
      return { host: splitted[0], port: parseInt(splitted[1]) };
    }
    return options;
  }

  handle(socket) {
    this.connections++;
    let conn = net.connect(this.conOpts, () => {
      conn.pipe(socket);
      socket.pipe(conn);
    });

    conn.on('end', () => { this.connections--; });
		socket.on('error', () => {
			socket.destroy();
		});
  }

  isHealthy() {
    let _this = this;
    return new Promise( function(resolve, reject) {
      var client = new net.Socket();
      client.once('connect', function() {
          client.end();
          client.destroy();
          resolve(_this);
      });
      client.once('error', function(err) {
          client.end();
          client.destroy();
          reject();
      });
      client.setTimeout(5*1000, function() {
          client.end();
          client.destroy();
          reject();
      });
      client.connect({port: _this.conOpts.port, host: _this.conOpts.host});
    });
  }
}
