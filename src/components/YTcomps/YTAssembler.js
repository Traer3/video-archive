import { useCallback, useEffect, useRef, useState } from "react";
import { TouchableOpacity, View, StyleSheet, FlatList, Text, Modal, Image} from "react-native";
import { VideoView, useVideoPlayer, } from "expo-video";

import YTVidForm from "./YTVidForm";
import { DurationFetcher } from "./DurationFetcher";
import YTLoading from "./YTLoading";
import ModifiedYTVidForm from "./ModifiedYTVidForm";

const DB_URL = 'http://192.168.0.8:3001';
const VIDEO_URL = 'http://192.168.0.8:3004'

export default function YTAssembler () {

    
    const [dbVideos,setDbVideos] = useState([]);
    const [videos, setVideos] = useState([]);
    const [page, setPage] = useState(0);
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
                //console.log('DB videos loaded:',formatted.length);
            }catch(err){
                console.log("Error loading DB videos:", err);
            }
        })();
        return () => {mounted = false;};
    },[]);

    
    useEffect(()=>{
        if(dbVideos.length === 0 ) return;
        fetchAllVideos(1)
    },[dbVideos,page]);

  


    const fetchAllVideos = useCallback(async (pageNum = 1) => {
        console.log(`🧩 Fetching page ${pageNum} (current state page: ${page})`)
        if(loading || !hasNext ) return;
        setLoading(true);
            try{
                const urlResponse = await fetch(`${VIDEO_URL}/videos?page=${pageNum}&limit=7`);
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

                console.log('Loaded page ', pageNum, 'items:', newFormPage.length);

            }catch(err){
                console.log("Error merging videos : ", err)
            }finally{
                setLoading(false);
            }
        },[loading,hasNext,dbVideos]);

  
    
    const loadMore = () => {
        const nextPage = page + 1;
        if(hasNext && !loading){
            fetchAllVideos(nextPage).then(()=>{
                 setPage(nextPage) 
            })
        }
    };

    const keyExtractor = item => (item.id ? item.id.toString() : item.url);

   const savedIds = useRef(new Set());
   const saveVideoData = async (vidId,vidDuration) =>{
        if(!vidId  || vidId === 0) return
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
            console.log(`⏱ Duration saved for video ${vidId} : ${vidDuration}`)
            console.log("✅Updated video: ", data.updatedVideo);
                       
        }catch(err){
            console.error('❌ Error saving video: ', err);
        }
        
   }


    const renderItem = ({item}) => {
        if(!item.id) return null;

        if(!item.duration || !item.thumbnail) {
            const placeholder = Array.from({length: 7}, (_,i)=>(
                <YTLoading key={i} delay={i * 150}/>
            ))
            return(
                <>{placeholder}</>
            );
        }
        
        return(
            <TouchableOpacity onPress={()=> setSelectedVideo(item.url)}>
                <ModifiedYTVidForm 
                    thumbnail={item.thumbnail} 
                    name={item.name} 
                    date={item.date} 
                    duration={item.duration} 
                    isItUnique={item.isitunique} 
                    id={item.id}
                />
                
            </TouchableOpacity>
        )
    }



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
            {videos.find(v => !v.duration) && (
                <DurationFetcher
                    key={videos.find(v => !v.duration).id}
                    url={videos.find(v => !v.duration).url}
                    onDurationReady={(dur)=>{
                        const target = videos.find(v => !v.duration);
                        saveVideoData(target.id, dur);
                        setVideos(prev =>
                            prev.map(v=>
                                v.id === target.id ? {...v, duration: dur} : v
                            )
                        );
                    }}
                />
            )}
            <FlatList
                style={{flex:1}}
                contentContainerStyle={{paddingBottom: 105}}
                data={videos}
                scrollEnabled={true}
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