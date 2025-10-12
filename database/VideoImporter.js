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
    return "http://192.168.0.8:3004/" + encodeURIComponent(fileName); //vm ip
}

async function VideoImporter(listPath){
   try {

    if(!fs.existsSync(listPath)){
        console.log(`List dose not exists: ${listPath}`)
        return;
    }

    const lines = fs.readFileSync(listPath, 'utf-8')
        .split("\n")
        .map(line => line.trim())
        .filter(Boolean)
        .reverse();

    console.log(`Video in list: ${lines.length}`);


    const existingVideos = await getExistingVideos();
    console.log(`DB already have this vid : ${existingVideos.length}`);

    let importedCount = 0;
    let skippedCount = 0;

    for(const name of lines){
        try{
            const fileName = path.basename(name);
            const originalName = path.parse(fileName).name
            const sizeMB = 0;
            const duration =  0;

            const duplicate = existingVideos.find(v => v.name === originalName);
            if(duplicate){
                console.log(`⏭️ Scip duplicate: ${originalName}`);
                skippedCount++;
                continue;
            }

            const finalName =await generateUniqueName(existingVideos, originalName);
            const requirePath = generateRequirePath(fileName);

            await pool.query(
                `INSERT INTO videos (name, url, duration, size_mb, category, thumbnail)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                 [
                    finalName,
                    requirePath,
                    duration,
                    sizeMB,
                    'YouTube',
                    'default-thumbnail.jpg'
                 ]
            );

            existingVideos.push({name: finalName});
            console.log(`✅ Added: ${finalName}`)
            importedCount++

        }catch(err){
            console.error(`ERROR adding video : ` , err.message);
        }
    }

    console.log('\n📊 RESULTS:');
    console.log(`Added new list: ${importedCount}`);
    console.log(`Skiped duplicates: ${skippedCount}`);
    console.log('Import end')

   }catch(err){
        console.log(`Error file file :`, err.message)
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

const VIDEOS_LIST_PATH = path.join(__dirname, "likes.txt") 
VideoImporter(VIDEOS_LIST_PATH);