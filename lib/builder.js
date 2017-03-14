const poise = require('./index');

module.exports = class Builder {

	run(config) {
    let ret = {};
    if (config.http) {
      ret.http = this.parseHTTP(config.http);
		}

    /*if (config.tcp) {
      ret.tcp  = this.parseTCP(config.tcp);
		}*/
    return ret;
  }

  parseHTTP(config) {
    let http = poise.http();
    for (let k in config) this.parseHTTPFront(http, k, config[k]);
    return http;
  }

  /*parseTCP(config) {
    let tcp = poise.tcp();
  }*/

}
