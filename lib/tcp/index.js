const Front = require('./front');

module.exports = class TCP {
  constructor() {
    this.fronts = {};
  }

  front(name, options) {
    return this.fronts[name] = new Front(options);
  }
};
