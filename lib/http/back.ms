var Server = require('./server');
var lb     = require('./lb');

export class Back {
  private {
    var LB_LOOKUP = {
      resource:   lb.Resource,
      roundrobin: lb.RoundRobin,
      weighted:   lb.Weighted
    };
  }

  function initialize(filter) {
    this.servers = {};
    this.count   = 0;
    this.useFilter(filter);

    this.lb = new lb.RoundRobin(this);
  }

  function balance(options) {
    if (this.lb) this.lb.clear();

    var algo = options.algorithm;

    if (algo in LB_LOOKUP) {
      this.lb = new LB_LOOKUP[algo](this, options);
      this.lb.rebalance(this);
      return this.lb;
    }
    
    else {
      throw "Invalid load balancer type";
    }
  }

  function match(req) {
    return this.filter ? this.filter(req) : true;
  }

  function useFilter(filter) {
    if (!filter) return;

    if (typeof filter == 'function') {
      this.filter = filter;
    } else {
      this.filter = #(req) {
        var headers = req.headers;
        for (var k in filter) {
          var val = headers[k];
          if (val && val.match(filter[k])) return true;
        }
        return false;
      };
    }
  }

  function server(name, reqOptions, options) {
    var server = new Server(reqOptions, options); 
    server.name = name;
    this.servers[name] = server;
    this.lb.rebalance(this);

    server.on('unhealthy', #{ self.lb.rebalance(); });
    server.on('healthy', #{ self.lb.rebalance(); });

    return server;
  }

  function evict(name) {
    var server = this.servers[name];
    if (!server) return;

    delete this.servers[name];
    server.removeAllListeners('unhealthy');
    server.removeAllListeners('healthy');

    this.lb.rebalance(this);
  }

  function resolve(req, inc) {
    return this.lb.resolve(req, inc);
  }

  function handle(req, res) {
    var server = this.resolve(req, true);
    return server ? server.handle(req, res) : false;
  }

  function toString(indent) {
    indent = indent || "";
    var ret = indent + "BACK: " + this.name + "\n";
    ret += this.lb.toString(indent + "  ");

    for (var name in this.servers) 
      ret += this.servers[name].toString(indent + "  ");
    return ret;
  }

}