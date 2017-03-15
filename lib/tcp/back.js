const Server = require('./server');

module.exports = class Back {
  constructor(options) {
    this.options = options;
    this.servers = {};
    this.pool    = [];
    this.count   = 0;
  }

  handle(socket) {
    let server = this.resolve();
		if (server) {
    	server.handle(socket);
		}
  }

  resolve() {
    this.count++;
    let idx = this.count % this.pool.length;
    return this.pool[idx];
  }

  server(name, options) {
    let server = this.servers[name] = new Server(options);
    server.name = name;
    this.rebalance();
    return server;
  }

  rebalance() {
    let _this = this;
    this.pool.length = 0;
    for (let name in this.servers) {
      let server = this.servers[name];
      server.isHealthy()
        .then( function(srv) {
          _this.pool.push(srv);
        })
        .catch( function(err) { });
    }
  }


}
