import { useCallback, useEffect, useRef, useState } from "react";
import { TouchableOpacity, View, StyleSheet, FlatList, Text, Modal, Image, Pressable, Dimensions} from "react-native";
import { VideoView, useVideoPlayer, } from "expo-video";
import * as  Haptics from 'expo-haptics';

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

    const [scrollAnimation, setScrollAnimation] = useState(true);
    const pressStartTime = useRef(null);

    
    const translateX = useSharedValue(0);
    const offsetRefX = useRef(0);
    const translateY = useSharedValue(0);
    const offsetRefY = useRef(0);

    const [firstItemPositionID, setFirstItemPositionID] = useState(null);
    const firstItemPosition = useRef(null);

    const prevYRef = useRef(null);

    const releseTime = useRef(null);
    const buttonHeld = useRef(null);

    const [deletionTrigger, setDeletionTrigger] = useState(0);

    const [viewLayout, setViewLayout] = useState({})

    const startX = useRef(null);
    const startY = useRef(null);
    const direction = useRef(null);
    const THRESHOLD = 4
    

        
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
            savedIds.current.add(vidId);
            console.log(`⏱ Duration saved for video ${vidId} : ${vidDuration}`)
            console.log("✅Updated video: ", data.updatedVideo);
                       
        }catch(err){
            console.error('❌ Error saving video: ', err);
        }
        
   }

   const checkPont = (x,y)=>{
    const {top, left, right, bottom} = viewLayout;
    console.log("top",top);
    console.log("left",left);
    console.log("right",right);
    console.log("bottom",bottom);
    console.log("x",x);
    console.log("y",y);
    return (x > left && x < right && y > top && y < bottom);
   }
   
    const hadlePressIn = (event,itemUrl) =>{
        //это для использования касаний 
        pressStartTime.current = Date.now();

    //Это уже второй варик проверки
    const e = event.nativeEvent;
    const touch = e.touches?.[0] ?? e;

    startX.current = touch.pageX;
    startY.current = touch.pageY;
    direction.current = null;
    console.log("Start", startX.current, startY.current);

    /*
      //ВАРИАНТ 1  //это для работы по положение x y 
        const eventSource = event.nativeEvent || event;
        let touchPoint;

        if(eventSource.touches && eventSource.touches.length > 0){
            touchPoint = eventSource.touches[0];
        }else{
            touchPoint = eventSource;
        }

        const clientX = touchPoint.pageX || touchPoint.clientX;
        offsetRefX.current = clientX - translateX.value;
        console.log("clientX",clientX)

        const clientY = touchPoint.pageY || touchPoint.clientY;
        offsetRefY.current = clientY - translateY.value;
        console.log("clientY",clientY)

        //console.log("checkPont",checkPont(offsetRefX.current,offsetRefY.current))
    */
        
    };

    const hadleMove = (event)=>{
        if(startX.current === null || startY.current === null) return;

        const e = event.nativeEvent;
        const touch = e.touches?.[0] ?? e;

        const directionX = touch.pageX - startX.current;
        const directionY = touch.pageY - startY.current;

        if(!direction.current){
            if(Math.abs(directionX)< THRESHOLD && Math.abs(directionY) < THRESHOLD) return;

            if(Math.abs(directionX) > Math.abs(directionY)){
                direction.current = "x";

                setScrollAnimation(false);
                
                console.log("Movment by X");
            }else{
                direction.current = "y";
                console.log("Movment by Y");
                
            }
        }
    };


   
    const handlePressOut = (event,itemUrl) => {

        startX.current = null;
        startY.current = null;
        direction.current = null;
        setScrollAnimation(true);

        /* это для варика 1 
        offsetRefX.current = null;
        offsetRefY.current = null
        */

        //ниже хуйня для работы с касаниями ОТДЕЛЬАНЯ ХУЙНЯ
        if(pressStartTime.current){
            releseTime.current = Date.now();
            buttonHeld.current = releseTime.current - pressStartTime.current;
            //console.log("buttonHeld", buttonHeld.current,'ms'); //касание 130-145ms // нажатие срабатывает от 159 - 180 ms 
            
            //почти хорошо , но касания 
            if(buttonHeld.current > 140 && buttonHeld.current < 400){
                //setSelectedVideo(itemUrl)
            }

            //ебануть условие для проверки сработала ли функция после hadleOnLoongPress, если сработал , включить скролинг , если нет , включить скролинг 
           
            //если нихуя не поменяеться , то ебашь releseTime и buttonHeld в простые константы
            pressStartTime.current = null;
            releseTime.current = null;
            buttonHeld.current = null
        }
    }

    const hadleOnLoongPress = () =>{
        /* анимацию стопить не буду , при зажатии буду показывать окно удаление видосов 
        console.log("we looked scrolling scrollAnimation = false")
        scrollAnimation.current = false;

        */
        // ебануть вибрацию по активации 
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft)
        
        // затем показать вариант удаление сразу нескольких видосов 
        setDeletionTrigger(true)
    }

    const hadleStart = (event) => {
        

        /* двигать эту хуйню буду в ModifiedYTForm
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

        */
    }

    /*
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

        //movementCheck(clientY);

    }
    */
   
    const movementCheck = (y) =>{

       
        if(prevYRef.current === null){
            prevYRef.current = y;
            return;
        }

        if(y < prevYRef.current){
            console.log("Y going up")
        } else{
            console.log("Y gooing down");
        }

        console.log("prevY:",prevYRef.current);
        console.log("currentY:",y)

        prevYRef.current = y

       

    }


    const firstRenderItemPosition = (dbVideos)=>{
        if(firstItemPositionID === null){
            let indexId = dbVideos.length - 1;
            const firstVidId = dbVideos[indexId].id
            console.log(firstVidId)
            setFirstItemPositionID(firstVidId)
        }
        
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
                //onTouchStart={hadleStart}
                onPressIn={(event)=> hadlePressIn(event,item.url)}
                onTouchMove={hadleMove}
                onPressOut={(event)=> handlePressOut(event,item.url)}
                onLongPress={hadleOnLoongPress}
                //delayLongPress={100}

                
            >
                <ModifiedYTVidForm 
                    thumbnail={item.thumbnail} 
                    name={item.name} 
                    date={item.date} 
                    duration={item.duration} 
                    isItUnique={item.isitunique} 
                    id={item.id}

                    firstItemPosition={firstItemPosition}
                    firstItemPositionID={firstItemPositionID}
                    setDeletionTrigger={setDeletionTrigger}
                    deletionTrigger={deletionTrigger}
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
        <View 
            style={{flex:1, }}
            onLayout={(event)=>{
                const {x, y, height , width} = event.nativeEvent.layout;
                const viewLayoutProp = {
                    top: y,
                    bottom: y + height,
                    right: x + width,
                    left: x,
                }
                setViewLayout(viewLayoutProp)
            }}
            >
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