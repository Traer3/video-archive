const pool = require('../config/db.js');

exports.writeLinks = async(data) => {
    const { name, category,  locked, isitunique } = data;
    const query = 
        `INSERT INTO links (name, category, locked, isitunique)
        VALUES ($1, $2, $3, $4) RETURNING *`;
    const values = [name, category, locked, isitunique];
    const result = await pool.query(query,values);
    return result.rows[0];
};

exports.getLinks = async () =>{
    const result = await pool.query("SELECT * FROM links");
    return result.rows;
};


exports.lockedVideo = async(data) => {
    const {id, locked} = data;
    const query =
    'UPDATE links SET locked = $1 WHERE id = $2 RETURNING *'
    const values = [locked, id];
    const result = await pool.query(query,values);
    return result.rows[0];
};