import { useCallback, useEffect, useRef, useState } from "react";
import { TouchableOpacity, View, StyleSheet, FlatList, Text, Modal, Image} from "react-native";
import * as VideoThumbnails from 'expo-video-thumbnails';

import { VideoView, useVideoPlayer, } from "expo-video";
import YTVidForm from "./YTVidForm";


import { DurationFetcher } from "./DurationFetcher";


export default function YTAssembler () {

    const VIDEO_URL = 'http://192.168.0.8:3004'
    const DB_URL = 'http://192.168.0.8:3001';
    
    const [dbVideos,setDbVideos] = useState([]);
    const [videos, setVideos] = useState([]);
    const [page, setPage] = useState(1);
    const [hasNext, setHasNext] = useState(true);
    const [loading, setLoading] = useState(false);
    
    useEffect(()=>{
        let mounted = true;
        (async ()=>{
            try{
                const res = await fetch(`${DB_URL}/videos`);
                const arr = await res.json();
                if(!mounted) return;
                const formatted = arr.map(v => ({
                    id: v.id,
                    name: v.name,
                    tumbnail: v.thumbnail,
                    duration: v.duration,
                    isitunique: v.isitunique,
                }));
                setDbVideos(formatted);
                console.log('DB videos loaded:',formatted.length);
            }catch(err){
                console.log("Error loading DB videos:", err);
            }
        })();
        return () => {mounted = false;};
    },[]);

    const [initialLoadDone, setInitialLoadDone] = useState(false);
    useEffect(()=>{
        if(dbVideos.length === 0 || initialLoadDone) return;
        fetchAllVideos(1).then(()=>{
            setPage(2);
            setInitialLoadDone(true);
        });
       
    },[dbVideos,initialLoadDone,page]);

    const fetchAllVideos = useCallback(async (pageNum = 1) => {
        console.log(`🧩 Fetching page ${pageNum} (current state page: ${page})`)
        if(loading || !hasNext ) return;
        setLoading(true);
            try{
                const urlResponse = await fetch(`${VIDEO_URL}/videos?page=${pageNum}&limit=9`);
                const urlData = await urlResponse.json()

                setHasNext(urlData.hasNext);

                const normolizeName = (name) => name.replace(/\.mp4$/i, '');
                const newFormPage = urlData.videos.map(u => {
                    const urlName = normolizeName(u.name);
                    const dbVid = dbVideos.find(db => db.name === urlName);

                    return{
                        id: dbVid ? dbVid.id : null,
                        name: u.name,
                        url: u.url,
                        thumbnail: u.thumbnail,
                        duration: dbVid ? dbVid.duration : null,
                        isitunique: dbVid ? dbVid.isitunique : false,
                    };
                });

                setVideos(prev => {
                    const existingIds = new Set(prev.map(p => p.id));
                    const unique = newFormPage.filter(v => !existingIds.has(v.id));
                    return[...prev, ...unique];
                });

                setPage(pageNum);
                console.log('Loaded page ', pageNum, 'items:', newFormPage.length);

            }catch(err){
                console.log("Error merging videos : ", err)
            }finally{
                setLoading(false);
            }
        },[loading,hasNext,dbVideos]);

  
    
    const loadMore = () => {
        if(hasNext && !loading){
            fetchAllVideos(page).then(()=>{
                setPage(prev => prev +1)
            })
        }
    };

    //id всегда есть в базе , я не отображаю видео без id или вне базы 
    const keyExtractor = item => (item.id ? item.id.toString() : item.url);


   const savedIds = useRef(new Set());
   const saveVideoData = async (vidId,vidDuration) =>{
        console.log(vidId);
        console.log(vidDuration)
        try{

            if(!vidDuration){
                console.log("⚠️ Video duration is null or undefined")
                return;
            }

            if(savedIds.current.has(vidId)){
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
                <YTVidForm thumbnail={item.thumbnail} name={item.name} date={item.date} duration={item.duration} isItUnique={item.isitunique} id={item.id}/>
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
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                removeClippedSubviews={false}
                initialNumToRender={10}
                windowSize={10}
                ListFooterComponent={loading ? <Text style={{textAlign:'center'}}>loading...</Text> : null}
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