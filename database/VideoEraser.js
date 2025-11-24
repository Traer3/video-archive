
const [,, command, videos] = process.argv;



























if(require.main === module){
    (async ()=>{
        if(!videos){
            console.error('❌ No video provided for deletion');
            process.exit(1);
        }
        if(command === 'fullErasing'){
            //await fullErasing(videos);
        }else if(command === 'thumbnailDeletion'){
            //await thumbnailDeletion(videos);
        }
    })
}