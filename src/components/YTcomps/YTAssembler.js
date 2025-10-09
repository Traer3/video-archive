import { useEffect, useState } from "react";
import { TouchableOpacity, View, StyleSheet, FlatList, Text, Modal, Image} from "react-native";
import * as VideoThumbnails from 'expo-video-thumbnails';

import { VideoPlayer, VideoView, useVideoPlayer, } from "expo-video";
import YTVidForm from "./YTVidForm";

//import placeholder from "../../../assets/AronaServer.jpg"
import betterPlaceholder from "../../meme/arona.gif"
import { DurationFetcher } from "./DurationFetcher";


export default function YTAssembler () {

    const BASE_URL = 'http://192.168.0.8:3001'

    useEffect(()=>{
        const getVids = async () => {
            try{
                const responce = await fetch(`${BASE_URL}/videos`);
                const data = await responce.json();
                vidReader(data)
            }catch(err){
                console.log("DB error: ", err)
            }
        }
        getVids();

    },[])

    const [videos, setVideos] = useState([])

    const vidReader = (DBvideos) => {
       const parsedVideos = DBvideos.map((vid)=>({
        ...vid,
        url: vid.url,
        duration: vid.duration
       }))
        setVideos(parsedVideos)
        
    }

    const [videoData, setVideoData] = useState([]);

   const savedIds = new Set();
   const saveVideoData = async (vidId,vidDuration) =>{
        try{

            if(!vidDuration){
                console.log("⚠️ Video duration is null or undefined")
                return;
            }

            if(savedIds.has(vidId)){
                console.log(`⏭ Video ${vidId} already saved, skipping...`);
                return;
            }

            const res = await fetch(`${BASE_URL}/saveVidDuration`,{
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    vidId: vidId,
                    vidDurationData: vidDuration,
                }),
            });

            if(!res.ok){
                throw new Error(`Server error:  ${res.status}`);
            }
           
            const data = await res.json();
            savedIds.add(vidId);
            console.log(`✅ Duration saved for video ${vidId} : ${vidDuration}`)
            console.log("Updated video: ", data.updatedVideo);
                       
        }catch(err){
            console.error('❌ Error saving video: ', err);
        }
        
   }
    


    useEffect(()=>{
        const loadData = async () => {
            const enriched = [];

            for(let vid of videos){
                try{
                    
                    let VideoUrl = String(vid.url)

                    const {uri} = await VideoThumbnails.getThumbnailAsync(VideoUrl, {time:100});

                    
                    
                    enriched.push({
                        ...vid,
                        thumbnail: uri,
                    });

                    
                } catch (e){
                    //console.warn("Thumbnail error",vid.id);
                    enriched.push({
                        ...vid,
                        thumbnail: Image.resolveAssetSource(betterPlaceholder).uri,
                    })
                    continue;
                }
            }
            setVideoData(enriched);
            
        };
        loadData();
        
    },[videos])

    


    const renderItem = ({item}) => (
            <TouchableOpacity onPress={()=> setSelectedVideo(item.url)}>
                <YTVidForm thumbnail={{uri: item.thumbnail}} name={item.name} date={item.date} duration={item.duration}/>
            </TouchableOpacity>
        )



    const [selectedVideo, setSelectedVideo] = useState(null);
    const player = useVideoPlayer(
        selectedVideo,
        (player) => {
            player.loop = false
            player.play();
        }
    );


    return(
        <View style={{flex:1, }}>
            {videoData.map((vid)=>
                !vid.duration ? (
                    <DurationFetcher
                        key={vid.id}
                        url={vid.url}
                        onDurationReady={(dur)=>{     
                            saveVideoData(vid.id, dur)
                            setVideoData((prev)=> 
                                prev.map((video)=> 
                                video.id === vid.id ? {...video, duration: dur}: video
                                )
                            );
                            //console.log(`Video ${vid.id} duration: ${dur}`);
                        }}
                    />
                ): null
            )}


            <FlatList
                data={videoData}
                keyExtractor={(item)=>item.id.toString()}
                renderItem={renderItem}
            />
            <Modal visible={!!selectedVideo} transparent={true} animationType="slide" onRequestClose={()=> setSelectedVideo(null)}>
                <View style={styles.modalBackground}>
                    
                    <TouchableOpacity
                        style={styles.closeArea}
                        onPress={()=> setSelectedVideo(null)}
                    />
                    <View style={styles.videoContainer}>
                        {selectedVideo && (
                            <VideoView
                                style={styles.video}
                                player={player}
                                fullscreenOptions={{
                                    enable: true,
                                }}
                                nativeControls
                            />
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    )
    
};

const styles = StyleSheet.create({
    
    item:{
        padding:15,
        marginBottom: 10,
        backgroundColor: "#eee",
        borderRadius: 8,
        
    },
    text:{
        fontSize:16,
        
    },
    modalBackground:{
        flex:1,
        backgroundColor:"rgba(0,0,0,0.5)",
        justifyContent:'center',
        alignItems:'center',
        
    },
    closeArea:{
        ...StyleSheet.absoluteFillObject,
    },
    videoContainer:{
        width:'100%',
        height:'60%',
        
    },
    video:{
        width:'100%',
        height:'100%',
    },
});