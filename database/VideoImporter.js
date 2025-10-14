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


function generateRequirePath(fileName){
   return "http://192.168.0.8:3004/" + encodeURIComponent(fileName);
}

async function VideoImporter(folderPath){
   try {

    if(!fs.existsSync(folderPath)){
        console.log(`Folder dose not exists: ${folderPath}`)
        return;
    }

    const files = fs.readdirSync(folderPath);
    console.log(`Files amount: ${files.length}`);

    const existingVideos = await getExistingVideos();
    console.log(`DB already have this vid : ${existingVideos.length}`);

    let importedCount = 0;
    let skippedCount = 0;

    for(const file of files){
        const filePath = path.join(folderPath, file);

        try{
            const stat = fs.statSync(filePath);

            if(stat.isFile() && isVideoFile(file)){
                const originalName = path.parse(file).name;
                const sizeBM = (stat.size / (1024 * 1024)).toFixed(2);

                const duplicate = findDuplicate(existingVideos, originalName, sizeBM);

                if(duplicate){
                    console.log(`Scip duplicate: ${originalName} (${sizeBM} MB)`);
                    skippedCount++;
                    continue;
                }

                const finalName = await generateUniqueName(existingVideos, originalName);
                const duration = "";

                const requirePath = generateRequirePath(file);

                await pool.query(
                    `INSERT INTO videos (name, url, duration, size_mb, category, thumbnail)
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                     [
                        finalName,
                        requirePath,
                        duration,
                        sizeBM,
                        'YouTube',
                        'default-thumbnail.jpg'
                     ]
                );

                existingVideos.push({name: finalName , size_mb: sizeBM});
                console.log(`✅ Added: ${finalName} (${sizeBM} MB)`);
                importedCount++;
            }
        }catch(err){
            console.error(`ERROR cant reed file ${file}:` , err.message);
        }
    }

    console.log('\n📊 RESULTS:');
    console.log(`Added new files: ${importedCount}`);
    console.log(`Skiped duplicates: ${skippedCount}`);
    console.log('Import end')

   }catch(err){
        console.log(`Error file ${file} :`, err.message)
   } finally {
    await pool.end();
   }
}

async function getExistingVideos() {
    try{
        const result = await pool.query('SELECT name, size_mb FROM videos');
        return result.rows;
    }catch(err){
        console.log('Error no data from server: ', err.message);
        return[];
    }
}



function findDuplicate(existingVideos, name, sizeBM){
    return existingVideos.find(video => 
        video.name === name && video.size_mb === sizeBM
    );
}

async function generateUniqueName(existingVideos, baseName) {
    const sameNameVideos = existingVideos.filter(video =>
        video.name.startsWith(baseName)
    );
    
    if(sameNameVideos.length === 0){
        return baseName;
    }
    
    let maxNumber = 0;
    const pattern = new RegExp(`^${baseName}\\((\\d+)\\)$`);

    sameNameVideos.forEach(video => {
        const match = video.name.match(pattern);
        if(match){
            const num = parseInt(match[1]);
            if(num > maxNumber){
                maxNumber = num;
            }
        }
    });

    const hasOriginal = existingVideos.some(video => video.name === baseName);
    if(hasOriginal && maxNumber === 0){
        maxNumber = 1;
    }
    return maxNumber > 0 ? `${baseName} (${maxNumber + 1})` : baseName;
}





function isVideoFile(fileName){
    const videoExtensions = ['.mp4'];
    return videoExtensions.includes(path.extname(fileName).toLocaleLowerCase());
}

const VIDEOS_FOLDER_PATH = path.join(__dirname, "videos")
VideoImporter(VIDEOS_FOLDER_PATH);
