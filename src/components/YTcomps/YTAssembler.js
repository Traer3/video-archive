import { useEffect, useState } from "react";
import * as FileSystem from "expo-file-system"
import * as MediaLibrary from "expo-media-library"
import { View, Text , Image } from "react-native";
import Video from "react-native-video";


export default function YTAssembler () {
    const [videos, setVideos] = useState([]);


    useEffect(()=>{
        
        const loadVideos = async ()=> {
            try{
                const videosDir = `${FileSystem.bundleDirectory}videos/`;
                console.log("Путь к папке ", videosDir)
                const dirInfo = await FileSystem.getInfoAsync(videosDir);
                if(!dirInfo.exists){
                    console.log("Papki nety )");
                    return;
                }

                const files = await FileSystem.readDirectoryAsync(videosDir);
                const videoData = await Promise.all(
                    files
                        .filter(file => file.endsWith('.mp4'))
                        .map(async(file)=>{
                            const fileInfo = await FileSystem.getInfoAsync(`${videosDir}${file}`);
                            return {
                                name: file,
                                date: new Date(fileInfo.modificationTime).toLocaleDateString(),
                                size: fileInfo.size,
                                uri:`${videosDir}${file}`,
                            };
                        })
                );
                setVideos(videoData);
            }catch(error){
                console.error("Ощибка при загрузке видео: ", error);
            }
        };

        loadVideos();

    },[]);

    return(
        <View>
            {videos.length === 0 ? (
                <Text style={{padding:20}}>видео не найдены</Text>
            ) : (
                videos.map((video, index)=>(
                    <View key={index} style={{margin:10}}>
                        <Text>Название {video.name}</Text>
                        <Text>Дата {video.date}</Text>
                        <Text>Размер: {(video.size / (1024 * 1024)).toFixed(2)} MB</Text>

                    

                        <Video
                            source={{uri: video.uri}}
                            style={{width:300, height:200}}
                            paused={true}
                            resizeMode="contain"
                        />
                    </View>   
                ))
            )}
        </View>
    )
}