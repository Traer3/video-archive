import { useCallback, useEffect, useState } from "react";
import { TouchableOpacity, View, StyleSheet, FlatList, Text, Modal} from "react-native";
import { VideoView, useVideoPlayer, } from "expo-video";
import { DurationFetcher } from "./VideoProcessing/DurationFetcher";
import RenderItem from "./VideoProcessing/RenderItem";
import { useSaveVideo } from "./VideoProcessing/SaveVideoData";
import ServerLoading from "../ServerLoading";

const DB_URL = 'http://192.168.0.8:3001';
const VIDEO_URL = 'http://192.168.0.8:3004'

export default function YTAssembler () {
    const [dbVideos,setDbVideos] = useState([]);
    const [videos, setVideos] = useState([]);
    const [page, setPage] = useState(0);
    const [hasNext, setHasNext] = useState(true);
    const [loading, setLoading] = useState(false);

    const [offline, setOffline] = useState(false);

    const [deletionTrigger, setDeletionTrigger] = useState(0);
    const [scrollAnimation, setScrollAnimation] = useState(true);

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

                //console.log('DB formated: ',formatted)
                //console.log('DB videos loaded:',formatted.length);
            }catch(err){
                console.log("Error loading DB videos:", err);
            }
        })();
        return () => {mounted = false;};
    },[]);
    

    /*
    const PromiseDB =  new Promise(async (resolve, reject)=>{
        console.log("Promise Created!")
        try{
            const res = await fetch(`${DB_URL}/videos`);
            const arr = await res.json();
            const formatted = arr.map(v => ({
                id: v.id,
                name: v.name,
                tumbnail: v.thumbnail,
                duration: v.duration,
                isitunique: v.isitunique,
            }))
            resolve(formatted);
        }catch(err){

        }
    });
    */
   
    useEffect(()=>{
        if(dbVideos.length === 0) return;
        fetchAllVideos(1)
    },[dbVideos,page]);
    


    const fetchAllVideos = useCallback(async (pageNum = 1) => {
       // console.log(`🧩 Fetching page ${pageNum} (current state page: ${page})`)
        if(loading || !hasNext ) return;

        /*
        PromiseDB.then(result => {
            setDbVideos(result)
            console.log("Promise result");
        })
        */

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

                //Делаем 3 списка по 7 
                //1. preLoad который
                //2. ready который уже загружен и ждет тригера от FlatList 
                //3. videos на показ тригер сработал и показал видосы 

                setVideos(prev => {
                    const existingIds = new Set(prev.map(p => p.id));
                    const unique = newFormPage.filter(v => !existingIds.has(v.id));
                    return[...prev, ...unique];
                });

                console.log('Loaded page ', pageNum, 'items:', newFormPage.length);

            }catch(err){
                console.log("Error merging videos : ", err)
                setLoading(false);
                setHasNext(false);
                setOffline(true);

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

    const {saveVideoData} = useSaveVideo();
   
    const renderItem = ({item}) => {
        return(
            <RenderItem
                item={item}
                setScrollAnimation={setScrollAnimation}
                setSelectedVideo={setSelectedVideo}
                setDeletionTrigger={setDeletionTrigger}
                deletionTrigger={deletionTrigger}
            />
        )
    }

    const [selectedVideo, setSelectedVideo] = useState(null);
    const player = useVideoPlayer(
        selectedVideo,
        (player) => {
            player.loop = false
            player.play();
            player.audioMixingMode='mixWithOthers'
        }
    );

    return(
        <View style={{flex:1}}>
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
            {offline && 
                <ServerLoading/>
            }
            <FlatList
                style={{flex:1}}
                contentContainerStyle={{paddingBottom: 105}}
                data={videos}
                scrollEnabled={scrollAnimation}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                removeClippedSubviews={false}
                initialNumToRender={10}
                windowSize={10}
                ListFooterComponent={loading ? <Text style={{textAlign:'center',marginTop:"50%",fontWeight:'600',fontSize:20}}>loading...</Text> : null}
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