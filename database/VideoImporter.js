const fs = require('fs');
const path = require('path');
const {Pool} = require('pg');



const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "Vids",
    password: "Wedfvb01",
    port: 5432,
});

async function VideoImporter(folderPath){
    const files = fs.readdirSync(folderPath);

    for(const file of files){
        const filePath = path.join(folderPath,file);
        const stat = fs.statSync(filePath);

        if(stat.isFile() && isVideoFile(file)){
            const fileName = path.parse(file).name;
            const sizeMB = (stat.size / (1024 * 1024)).toFixed(2);

            const duration = 0;

            try{
                await pool.query(
                    `INSERT INTO videos (name, url, duration, size_mb, category, thumbnail)
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                     [
                        fileName,
                        `file://${filePath}`,
                        duration,
                        sizeMB,
                        'uncategorize',
                        'default-thumbnail.jpg'
                     ]
                );
                console.log(`Added: ${fileName}`)
            }catch(err){
                console.log(`❌ Error: ${fileName}`, err.message)
            }
        }
    }
}

function isVideoFile(fileName){
    const videoExtensions = ['.mp4', '.avi', '.mov', '.mkv'];
    return videoExtensions.includes(path.extname(fileName).toLocaleLowerCase());
}

const VIDEOS_FOLDER_PATH = '../vids'
VideoImporter(VIDEOS_FOLDER_PATH);