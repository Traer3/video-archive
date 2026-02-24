const fs = require('fs');
const fsPromises = require("fs").promises
const path = require('path');

const VIDEOS_DIR = path.join(__dirname, "videos")

function generateRequirePath(fileName){
   return "http://192.168.0.8:3004/" + encodeURIComponent(fileName);
}
const exists = async (path) =>{
    try{
        await fsPromises.access(path);
        return true;
    }catch{
        return false;
    }
};



async function logWriter (type, message) {

    const res = await fetch('http://192.168.0.8:3001/addLog',{
     method: "POST",
     headers:{"Content-Type":"application/json"},
     body: JSON.stringify({type, message})
    });

    if(!res.ok){
     const errorData = await res.text();
     console.error(`❌ Failed writing log: ${errorData}`);
     return;
    }

    const data = await res.json();
    console.log(data);
 };

async function FolderReader() {
    const videos = [];
    try{
        const subFolders = await fsPromises.readdir(VIDEOS_DIR);
        for(const folderName of subFolders){
            const fullPath = path.join(VIDEOS_DIR,folderName);
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
}

async function VideoImporter(folderPath){
   try {

    if(!(await exists(folderPath))){
        console.log(`Folder dose not exists: ${folderPath}`)
        return;
    }

    const files = await FolderReader();
    console.log(`Files amount: ${files.length}`);

    const existingVideos = await getExistingVideos();
    console.log(`DB already have ${existingVideos.length} vids`);

    let importedCount = 0;
    let skippedCount = 0;

    for(const file of files){
        const filePath = file.fullPath
        try{
            const stat = await fsPromises.stat(filePath);

            if(stat.isFile() && isVideoFile(file.name)){
                const originalName = path.parse(file.name).name;
                const sizeMB = (stat.size / (1024 * 1024)).toFixed(2);
                const duplicate = findDuplicate(existingVideos, originalName, sizeMB);

                if(duplicate){
                    console.log(`Scip duplicate: ${originalName} (${sizeMB} MB)`);
                    skippedCount++;
                    continue;
                }

                const finalName = await generateUniqueName(existingVideos, originalName);
                const duration = "";
                const requirePath = generateRequirePath(file.name);

                // не забудь включить 
                //importVideos({name: finalName,duration: duration,sizeMB: sizeMB,category: 'YouTube',});
                //await logWriter("ImporterLogs",`✅ Successfully imported: ${finalName}`)

                existingVideos.push({name: finalName , size_mb: sizeMB});
                console.log(`✅ Added: ${finalName} (${sizeMB} MB)`);
                importedCount++;
            }
        }catch(err){
            console.error(`ERROR cant reed file ${file.name}:` , err.message);
        }
    }

    console.log('\n📊 RESULTS:');
    console.log(`Added new files: ${importedCount}`);
    console.log(`Skiped duplicates: ${skippedCount}`);
    console.log('Import end')

   }catch(err){
        console.log(`Error :`, err.message)
   }
}

const importVideos = async (videoData) => {
    //console.log(videoData)

    const res =  await fetch("http://192.168.0.8:3001/importVideo",{
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(videoData)
    });
    if(!res.ok){
        const errorData = await res.json();
        console.error(`❌ Imoirt failed: ${errorData.message}`);
        await logWriter("ImporterLogs",`❌Imoirt failed: ${errorData.message}`)
        return;
    }

    const data = await res.json();
    console.log(data);
};


async function getExistingVideos() {
    try{
        const responce = await fetch("http://192.168.0.8:3001/videos");
        if(!responce.ok){
            throw new Error(`Cant get vids from server status: ${responce.status}`);
        }
        const data = await responce.json();
        return data;
    }catch(err){
        console.log('Error! Cant get videos from Server 3001: ', err.message);
        return[];
    }
}

function findDuplicate(existingVideos, name, sizeMB){
    return existingVideos.find(video => 
        video.name === name && video.size_mb === sizeMB
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

VideoImporter(VIDEOS_DIR);

/*
//OLD
async function VideoImporter(folderPath){
   try {

    if(!fs.existsSync(folderPath)){
        console.log(`Folder dose not exists: ${folderPath}`)
        return;
    }

    const files = fs.readdirSync(folderPath);
    console.log(`Files amount: ${files.length}`);

    const existingVideos = await getExistingVideos();
    //console.log(existingVideos)
    console.log(`DB already have ${existingVideos.length} vids`);

    let importedCount = 0;
    let skippedCount = 0;

    for(const file of files){
        const filePath = path.join(folderPath, file);

        try{
            const stat = fs.statSync(filePath);

            if(stat.isFile() && isVideoFile(file)){
                const originalName = path.parse(file).name;
                const sizeMB = (stat.size / (1024 * 1024)).toFixed(2);

                const duplicate = findDuplicate(existingVideos, originalName, sizeMB);

                if(duplicate){
                    console.log(`Scip duplicate: ${originalName} (${sizeMB} MB)`);
                    skippedCount++;
                    continue;
                }

                const finalName = await generateUniqueName(existingVideos, originalName);
                const duration = "";

                const requirePath = generateRequirePath(file);

                // не забудь включить 
                //importVideos({name: finalName,url: requirePath,duration: duration,sizeMB: sizeMB,category: 'YouTube',});
                await logWriter("ImporterLogs",`✅ Successfully imported: ${finalName}`)

                existingVideos.push({name: finalName , size_mb: sizeMB});
                console.log(`✅ Added: ${finalName} (${sizeMB} MB)`);
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
   }
}
*/