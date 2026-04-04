const pool = require('../config/db.js');

exports.filterVideo = async(data) => {
    const {id, state} = data;
    const query =
    'UPDATE videos SET filtered = $1 WHERE id = $2 RETURNING *'
    const values = [state, id];
    const result = await pool.query(query,values);
    return result.rows[0];
}