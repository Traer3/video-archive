const pool = require('../config/db.js');

exports.writeFailed = async (data) => {
    const {scriptName,videoUrl,developerMessage, compilerMessage } = data;
    const query =
        `INSERT INTO failed (script_name,video_url, developer_message, compiler_message)
         VALUES ($1, $2, $3, $4) RETURNING *`;
    const values = [scriptName,videoUrl,developerMessage, compilerMessage];
    const result = await pool.query(query,values);
    return result.rows[0];
};

exports.getFailed = async () => {
    const result = await pool.query ("SELECT * FROM failed ORDER BY id DESC");
    return result.rows;
}