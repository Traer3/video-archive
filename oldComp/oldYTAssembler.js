import { useEffect, useState } from "react";
import { TouchableOpacity, View, StyleSheet, FlatList, Text, Modal, Image} from "react-native";
import * as VideoThumbnails from 'expo-video-thumbnails';

import { VideoView, useVideoPlayer, } from "expo-video";
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
                //console.log("Videos form DB: ", data.lenght, data)
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
        duration: vid.duration,
        isitunique: vid.isitunique
       }))
       .sort((a,b)=> b.id - a.id);
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
                    //console.log("Vid id: ", vid.id, "Vid url: ", vid.url)

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
                keyExtractor={(item)=>item.id.toString()}
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

/*
OLD STUFF

const normolizeName = (name = '') =>
        name
            .replace(/\.mp4$/i, '')
            .replace(/\s+/g, ' ')
            .trim()
            .normalize('NFC');

const  loadDbVideos = async () => {
            try{
                const dbResponse = await fetch(`${DB_URL}/videos`);
                const dbData = await dbResponse.json();
    
            const formatted = dbData.map(v => ({
                id: v.id,
                name: v.name,
                thumbnail: v.thumbnail,
                duration: v.duration,
                isitunique: v.isitunique,
            }));
    
            setDbVideos(formatted);
            console.log("DB videos loaded: ", formatted.length)
            }catch(err){
                console.log("Error loading DB videos: ", err);
            }
        }
        loadDbVideos();

 const newVideos = urlData.videos.map(u => {

                    const urlName = normolizeName(u.name);
                    console.log("🎬URL name: ",  JSON.stringify(urlName))
                    
                   

                    const dbVid = dbVideos.find(db => db.name === urlName);

                    console.log("📥 DB name: ",JSON.stringify(dbVid))
                    //setDbVidId(db.id);
                    
                    console.log("dbVidId: " , dbVidId)

                    const newVideoObject ={
                        id: dbVidId,
                        name: u.name,
                        url: u.url,
                        thumbnail: u.thumbnail,
                        duration: dbVid ? dbVid.duration : null,
                        isitunique: dbVid ? dbVid.isitunique : false,
                    }
                    return newVideoObject;
                });

                setVideos(prev => {
                    const existingNames = new Set(prev.map(v => v.name));
                    const unique = newVideos.filter(v => !existingNames.has(v.name));
                    return[...prev,  ...unique];
                })

                
                SUPPER OLD STUFF
                /*
                const urls = urlData.videos;
                
                const merged = dbVideos.map(dbVid => {
                   // const normolizeName = name => name.replace(/\.[^/.]+$/, '').trim().toLowerCase();
                    const foundUrl = urls.find(u => {
                        const urlsWithoutExt = u.name.replace(/\.mp4$/i, '');
                        //console.log("name from express: ",urlsWithoutExt)
                        //console.log("name from DB: ",dbVid.name)
                       return urlsWithoutExt === dbVid.name
                    });
                    console.log("Matchung names check: ");
                    //urls.forEach(u => console.log("Url name: ", u.name));
                    //urls.forEach(u => console.log("Url thumbnail: ", u.thumbnail));
                    //dbVideos.forEach(v => console.log("DB name: ", v.name))
                    
                    return{
                        ...dbVid,
                        url: foundUrl ? foundUrl.url : null,
                        thumbnail: foundUrl ? foundUrl.thumbnail : "no default.jpg" 
                    };
                });

                

                merged.forEach(v=>{
                    if(!v.url){
                       // console.warn("⚠️ No url found ! ", v.name)
                    }
                })

                merged.sort((a,b)=>  b.id - a.id);

                setVideos(prev => {
                    const existiongIds = new Set(prev.map(v => v.id));
                    const uniqueMeged = merged.filter(v=> !existiongIds.has(v.id));
                    return [...prev, ...uniqueMeged]
                });
                setPage(pageNum);
                console.log("Loading page: ", pageNum)
              // console.log("Merged videos: ", merged)
                
                
*/