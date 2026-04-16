const fsPromises = require("fs").promises
const path = require("path");
const pool = require('../config/db.js');

exports.readFolders = async (videosDir) => {
    const videos = [];
        try{
            const subFolders = await fsPromises.readdir(videosDir);
            for(const folderName of subFolders){
                const fullPath = path.join(videosDir,folderName);
                const stats = await fsPromises.stat(fullPath);
    
                if(stats.isDirectory()){
                    console.log(`--- Reading folder: ${folderName} ---`);
                    const videoFiles = await fsPromises.readdir(fullPath);
                    videoFiles.map(file => {
                        videos.push({
                            name: file,
                            fullPath:path.join(fullPath, file)
                        });
                    });
                }
            }
            return videos;
        }catch(err){
            console.error("Error reading directories: ",err.message);
            return [];
        }; 
};

exports.getVideoList = async() => {
    const result = await pool.query("SELECT * FROM videos");
    return result.rows
}

exports.filterVideo = async(data) => {
    const {id, state} = data;
    const query =
    'UPDATE videos SET filtered = $1 WHERE id = $2 RETURNING *'
    const values = [state, id];
    const result = await pool.query(query,values);
    return result.rows[0];
};

exports.deleteID = async(data) => {
    const {videoId} = data;
    const query =
    `DELETE FROM videos WHERE id = $1 RETURNING *`;
    const values = [videoId];
    const result = await pool.query(query,values);
    if(!result.rows[0]) console.log(`Video with id ${videoId} not found`);
    return result.rows[0] || null;
};

exports.importVideo = async(data)=> {
    const {name, duration, sizeMB,category} = data;
    const query = 
    `INSERT INTO videos (name, duration, size_mb, category)
    VALUES ($1, $2, $3, $4) RETURNING *`;
    const values = [name, duration, sizeMB,category];
    const result = await pool.query(query,values);
    return result.rows[0];
};

exports.saveVidDuration = async(data) => {
    const {vidId, vidDurationData} = data;
    const query = 
    'UPDATE videos SET duration = $1 WHERE id = $2 RETURNING *'
    const values = [vidDurationData, vidId]
    const result = await pool.query(query,values);
    if(!result.rows[0]){
        return result.status(404).json({message: "Video not found"})
    }else{
        return result.rows[0];
    }
};

exports.saveUniqueData = async(data) => {
    const {vidId, isitunique} = data;
    const query =
    'UPDATE videos SET isitunique = $1 WHERE id = $2 RETURNING *'
    const values =  [isitunique, vidId];
    const result = await pool.query(query,values);
    if(!result.rows[0]){
        return  result.status(404).json({message: "Video not found"})
    }else{
        return result.rows[0];
    };
};

exports.databaseOverwrite = async () => {
    const query = 'TRUNCATE TABLE videos RESTART IDENTITY';
    try{
        await pool.query(query);
        return {success: true, message: "Table videos RESTARTED "}
    }catch(err){
        console.error("SQL Error during truncate: ",err.message)
    }
};