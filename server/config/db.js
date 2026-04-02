const {Pool} = require("pg");
const config = require('../config.js');

const pool = new Pool(config.TABLE_AUTHORIZATION);

module.exports = pool;