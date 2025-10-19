import { useCallback, useEffect, useState } from "react";
import { TouchableOpacity, View, StyleSheet, FlatList, Text, Modal, Image} from "react-native";
import * as VideoThumbnails from 'expo-video-thumbnails';

import { VideoView, useVideoPlayer, } from "expo-video";
import YTVidForm from "./YTVidForm";

//import placeholder from "../../../assets/AronaServer.jpg"
import betterPlaceholder from "../../meme/arona.gif"
import { DurationFetcher } from "./DurationFetcher";


export default function YTAssembler () {

    const VIDEO_URL = 'http://192.168.0.8:3004'
    const DB_URL = 'http://192.168.0.8:3001';
    
    const [videos, setVideos] = useState([]);
    const [page, setPage] = useState(1);
    const [hasNext, setHasNext] = useState(true);
    const [loading, setLoading] = useState(false);

    const fetchAllVideos = useCallback(async (pageNum = 1) => {
        if(loading || !hasNext) return;
        setLoading(true);

            try{
                const dbResponse = await fetch(`${DB_URL}/videos`);
                const dbData = await dbResponse.json();
                //console.log("Videos form DB: ", data.lenght, data)

                const urlResponse = await fetch(`${VIDEO_URL}/videos?page=${pageNum}&limit=7`);
                const urlData = await urlResponse.json();

                setHasNext(urlData.hasNext);
                
                const dbVideos = dbData.map(v => ({
                    id: v.id,
                    name: v.name,
                    duration: v.duration,
                    isitunique: v.isitunique,
                }));

                const urls = urlData.videos;

                const merged = dbVideos.map(dbVid => {
                    const foundUrl = urls.find(u => {
                        const urlsWithoutExt = u.name.replace(/\.mp4$/i, '');
                        //console.log("name from express: ",urlsWithoutExt)
                        //console.log("name from DB: ",dbVid.name)
                       return urlsWithoutExt === dbVid.name
                    });
                    
                    return{
                        ...dbVid,
                        url: foundUrl ? foundUrl.url : null,
                    };
                });

                

                merged.forEach(v=>{
                    if(!v.url){
                       // console.warn("⚠️ No url found ! ", v.name)
                    }
                })

                merged.sort((a,b)=>  b.id - a.id);

                const enriched = await Promise.all(
                    merged.map(async(vid)=>{
                        if(vid.thumbnail) return vid;
                        try{
                            
                            let VideoUrl = String(vid.url)
                            
                           // console.log(vid.id);
                           console.log("URL для thumbnail: ",VideoUrl)
                            const {uri} = await VideoThumbnails.getThumbnailAsync(VideoUrl, {time:100});
                            return { ...vid, thumbnail: uri,};
    
                        } catch (e){
                            console.warn("Fail to get thumdnail for: ", vid.name, e.massage)
                            return{
                                ...vid,
                                thumbnail: Image.resolveAssetSource(betterPlaceholder).uri,
                            };
                        }
                    })
                );



                setVideos(prev => {
                    const existiongIds = new Set(prev.map(v => v.id));
                    const uniqueMeged = enriched.filter(v=> !existiongIds.has(v.id));
                    return [...prev, ...uniqueMeged]
                });
                setPage(pageNum);
                
              // console.log("Merged videos: ", merged)
            }catch(err){
                console.log("Error merging videos : ", err)
            }finally{
                setLoading(false);
            }
        },[loading,hasNext]);

    useEffect(()=>{
        fetchAllVideos(1);
    },[]);
    
    const loadMore = () => {
        if(hasNext && !loading){
            fetchAllVideos(page + 1);
        }
    };

   


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
            {videos.map((vid)=>
                !vid.duration ? (
                    <DurationFetcher
                        key={vid.id}
                        url={vid.url}
                        onDurationReady={(dur)=>{     
                            saveVideoData(vid.id, dur)
                            setVideos((prev)=> 
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
                data={videos}
                keyExtractor={(item)=>item.id.toString()}
                renderItem={renderItem}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
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