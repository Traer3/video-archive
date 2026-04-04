const pool = require('../config/db.js');

exports.addLog = async(data) => {
    const {type, message} = data;
    const query =  
    `INSERT INTO logs (log_type, log) VALUES ($1, $2)`;
    const values = [type, message];
    const result = await pool.query(query,values);
    return result.rows[0];
};

exports.getLogs = async () =>{
    const result = await pool.query("SELECT * FROM logs ORDER BY id DESC");
    return result.rows;
};