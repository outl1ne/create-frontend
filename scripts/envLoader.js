const dotenv = require('dotenv');

module.exports = {
  config() {
    dotenv.config({ debug: false });
  },
};
