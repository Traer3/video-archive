import { useCallback, useEffect, useState } from "react";
import { TouchableOpacity, View, StyleSheet, FlatList, Text, Modal, Image} from "react-native";
import * as VideoThumbnails from 'expo-video-thumbnails';

import { VideoView, useVideoPlayer, } from "expo-video";
import YTVidForm from "./YTVidForm";

//import placeholder from "../../../assets/AronaServer.jpg"
import betterPlaceholder from "../../meme/arona.gif"
import { DurationFetcher } from "./DurationFetcher";


export default function YTAssembler () {

    const DB_URL = 'http://192.168.0.8:3001'
    const VIDEO_URL = 'http://192.168.0.8:3004'
    const [page, setPage]= useState(1);
    const [hasNext, setHasNext] = useState(true);
    const [loading, setLoading]  = useState (false);

    const [videoData, setVideoData] = useState([]);

    const getVids = useCallback(async(pageNum = 1 )=>{
        if(loading || !hasNext) return;
        setLoading(true);

        try{
            const responce = await fetch(`${VIDEO_URL}/videos?page=${pageNum}&limit=7`);
            const data = await responce.json();

            setVideoData((prev)=> [...prev, ...data.videos]);
            setHasNext(data.hasNext);
            setPage(pageNum);
        }catch(err){
            console.log("Node express servder ERROR: ", err);
        }finally{
            setLoading(false);
        }
    },[loading,hasNext]);

    useEffect(()=>{
        getVids(1);
    },[]);

    const [videos, setVideos] = useState([])
    useEffect(()=>{
        const VideoFromDB = async () => {
            try{
                const responce = await fetch(`${DB_URL}/videos`);
            
                const data = await responce.json();
                //console.log("Videos form DB: ", data.lenght, data)
                vidReader(data)
            }catch(err){
                console.log("DB error: ", err)
            }
        }
        VideoFromDB();

    },[])

    const vidReader = (DBvideos) => {
       const parsedVideos = DBvideos.map((vid)=>({
        ...vid,
        id: vid.id,
        duration: vid.duration,
        isitunique: vid.isitunique
       }))
       .sort((a,b)=> b.id - a.id);
        setVideos(parsedVideos)
        
    }

    const findId = (vidName) => {
        const match = videos.filter(video => {
            console.log("Video name: ", video.name )
            console.log("Video find: ", vidName )
            video.name === vidName
        });
        if(match.length > 0){
            //console.log("ID : " , match[0].id);
            return match[0].id;
        }else{
            console.log("No vid found: ", vidName)
            return null;
        }
    }

    


   const savedIds = new Set();
   const saveVideoData = async (vidId,vidDuration) =>{
        //console.log(vidId);
        //console.log(vidDuration)
        try{

            if(!vidDuration){
                console.log("⚠️ Video duration is null or undefined")
                return;
            }

            if(savedIds.has(vidId)){
                console.log(`⏭ Video ${vidId} already saved, skipping...`);
                return;
            }

            const res = await fetch(`${DB_URL}/saveVidDuration`,{
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
        if(videos.length === 0 || videoData.length === 0) return;
        const loadThumbnails = async () => {
            const enriched = [];

            for(let vid of videoData){
                let vidId = findId(vid.name)
                try{
                    
                    console.log("Vid id: ", vidId)
                    let VideoUrl = String(vid.url)
                    //console.log("Vid id: ", vid.id, "Vid url: ", vid.url)

                    const {uri} = await VideoThumbnails.getThumbnailAsync(VideoUrl, {time:100});

                    
                    
                    enriched.push({
                        ...vid,
                        id: vidId,
                        thumbnail: uri,
                    });

                    
                } catch (e){
                    //console.warn("Thumbnail error",vid.id);
                    
                    enriched.push({
                        ...vid,
                        id: vidId,
                        thumbnail: Image.resolveAssetSource(betterPlaceholder).uri,
                    })
                    continue;
                }
            }
            setVideoData(enriched);
            
        };
        loadThumbnails();
        
    },[videos])

    


    const renderItem = ({item}) => (
            <TouchableOpacity onPress={()=> setSelectedVideo(item.url)}>
                <YTVidForm thumbnail={{uri: item.thumbnail}} name={item.name} date={item.date} duration={item.duration} isItUnique={item.isitunique} id={item.id}/>
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
                style={{flex:1}}
                contentContainerStyle={{paddingBottom: 105}}
                data={videoData}
                keyExtractor={(item)=> (item.id ? item.id.toString() : item.url)}
                renderItem={renderItem}
                removeClippedSubviews={false}
                initialNumToRender={10}
                windowSize={10}
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