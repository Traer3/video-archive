import { useCallback, useEffect, useRef, useState } from "react";
import { TouchableOpacity, View, StyleSheet, FlatList, Text, Modal, Image, Pressable, Dimensions} from "react-native";
import { VideoView, useVideoPlayer, } from "expo-video";

import YTVidForm from "./YTVidForm";
import { DurationFetcher } from "./DurationFetcher";
import YTLoading from "./YTLoading";
import ModifiedYTVidForm from "./ModifiedYTVidForm";
import { useSharedValue } from "react-native-reanimated";

const DB_URL = 'http://192.168.0.8:3001';
const VIDEO_URL = 'http://192.168.0.8:3004'

export default function YTAssembler () {

    
    const [dbVideos,setDbVideos] = useState([]);
    const [videos, setVideos] = useState([]);
    const [page, setPage] = useState(0);
    const [hasNext, setHasNext] = useState(true);
    const [loading, setLoading] = useState(false);

    const [scrollAnimation, setScrollAnimation] = useState(true) 
    const [pressStartTime, setPressStartTime] = useState(null);
    const [timeHeld, setTimeHeld] = useState(0);

    const translateX = useSharedValue(0);
    const offsetRefX = useRef(0);
    const translateY = useSharedValue(0);
    const offsetRefY = useRef(0);

    const windowWidth = Dimensions.get('window').width;
    const windowHeight = Dimensions.get('window').height;

    const [initiationCount, setInitiationCount] = useState(0);
    const [Xstate,setXstate] = useState(0);
    const [Ystate,setYstate] = useState(0);
    const [newXstate,setNewXstate] = useState(0);
    const [newYstate,setNewYstate] = useState(0);

    const [firstItemPositionID, setFirstItemPositionID] = useState(null);
    const [firstItemPosition, setFirstItemPosition] = useState({x:0,y:0});




        
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
       // console.log(`🧩 Fetching page ${pageNum} (current state page: ${page})`)
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

   const getCurrentTimestamp = (event) => {
           if(event && event.timeStamp){
               return event.timeStamp;
           }
           return Date.now();
       };
   
    const hadlePressIn = (event) =>{
        /*
        const startTime = getCurrentTimestamp(event);
        setPressStartTime(startTime);
        setTimeHeld(0);
        */
        
    };
   
    const handlePressOut = (event,itemUrl) => {
        /*
        if(pressStartTime === null) return;
        console.log("Press Start Time: ",pressStartTime)
           
        const endTime = getCurrentTimestamp(event);
        const calculatedDuration = Math.round(endTime - pressStartTime);
        console.log("calculatedDuration: ", calculatedDuration)
           
        if(calculatedDuration > 150){
                
            setScrollAnimation(false)
        }else{
              
            setScrollAnimation(true)
            setPressStartTime(null)
        }
        //setSelectedVideo(itemUrl)
        setTimeHeld(calculatedDuration);
        setPressStartTime(null);
   
        console.log("handlePressOut duration",calculatedDuration)
        */


    }

    const hadleStart = (event) => {
        const eventSource = event.nativeEvent || event;
        let touchPoint;

        if(eventSource.touches && eventSource.touches.length > 0){
            touchPoint = eventSource.touches[0];
        }else{
            touchPoint = eventSource;
        }

        const clientX = touchPoint.pageX || touchPoint.clientX;
        offsetRefX.current = clientX - translateX.value;
        //console.log("clientX",clientX)

        const clientY = touchPoint.pageY || touchPoint.clientY;
        offsetRefY.current = clientY - translateY.value;
        //console.log("clientY",clientY)

        //movementCheck(clientX,clientY)
        //firstRenderItemPosition(dbVideos);
    }

    const hadleMove = (event) => {
        const eventSource = event.nativeEvent || event;
        let touchPoint;

        if(eventSource.touches && eventSource.touches.length > 0){
            touchPoint = eventSource.touches[0];
        }else{
            touchPoint = eventSource;
        }

        const clientX = touchPoint.pageX || touchPoint.clientX;
        offsetRefX.current = clientX - translateX.value;

        const clientY = touchPoint.pageY || touchPoint.clientY;
        offsetRefY.current = clientY - translateY.value;

        movementCheck(clientY);

    }

   
    const movementCheck = (y) =>{
        setInitiationCount(prevCount => {
            const nexCount = prevCount + 1;

            if(nexCount === 1){
                setYstate(y);
                return nexCount;
            }

            
            if(nexCount === 2){
                setNewYstate(y);
                
                if(Ystate > newYstate){
                    console.log("Ystate state: ",Ystate)
                    console.log("newYstate state: ",newYstate)
                    console.log("Y gooing up");
    
                }else{
                    console.log("Ystate state: ",Ystate)
                    console.log("newYstate state: ",newYstate)
                    console.log("Y gooing down")
                }
                
                return nexCount;
            }
            if(nexCount === 3){
                return 0;
            }
            return prevCount;
        });
    }



    const firstRenderItemPosition = (dbVideos)=>{
        const firstVidId = dbVideos[0].id
        console.log(firstVidId)
        setFirstItemPositionID(firstVidId)
        //console.log(firstItemPosition);
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
            <Pressable 
                //onPressIn={hadlePressIn}
                //onPressOut={(event)=> handlePressOut(event,item.url)}
                onTouchStart={hadleStart}
                onTouchMove={hadleMove}
                
            >
                <ModifiedYTVidForm 
                    thumbnail={item.thumbnail} 
                    name={item.name} 
                    date={item.date} 
                    duration={item.duration} 
                    isItUnique={item.isitunique} 
                    id={item.id}

                    //scrollAnimation={scrollAnimation}
                    //setScrollAnimation={setScrollAnimation}
                    //setPressStartTime={setPressStartTime}

                    //setFirstItemPosition={setFirstItemPosition}
                    //firstItemPositionID={firstItemPositionID}
                />
                
            </Pressable>
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
                scrollEnabled={scrollAnimation}
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