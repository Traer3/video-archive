const pool = require('../config/db.js');

exports.writeLikes = async(data) =>{
    const {videoName,videoUrl} = data;
    const query = 
        `INSERT INTO likes (video_name,video_url)
        VALUES ($1, $2) RETURNING *`;
    const values = [videoName,videoUrl]
    const result = await pool.query(query,values);
    return result.rows[0];
};

exports.deleteLikes = async () => {
    const query = "TRUNCATE TABLE likes RESTART IDENTITY";
    await pool.query(query);
}

exports.getLikes = async () => {
    const result = await pool.query("SELECT * FROM likes");
    return  result.rows;
}