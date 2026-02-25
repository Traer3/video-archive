import { View, StyleSheet, Text, Pressable} from "react-native"
import { useEffect, useRef, useState } from "react"
import Animated, { ReduceMotion, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import YTVidForm from "./YTVidForm"
import { useDatabase } from "../../../../DatabaseContext";

export default function ModifiedYTVidForm({thumbnail, name, date ,id, duration,isItUnique,setDeletionTrigger,deletionTrigger,url}){
    const {DB_URL} = useDatabase();
    const translateX = useSharedValue(0);
    const offsetRefX = useRef(0);
    const translateY = useSharedValue(0);
    const offsetRefY = useRef(0);

    const [disableDeletion,setDisableDeletion] = useState(false);
   
    const MIN_X_LIMIT = 0;
    const MAX_X_LIMIT = 101;

    const animatedStyles = useAnimatedStyle(()=>({
        transform: [{translateX: translateX.value}],
    }));
    const translateXValue = withSpring(100,{
        stiffness: 900,
        damping:120,
        mass:4,
        overshootClamping:false,
        energyThreshold:6e-9,
        velocity:0,
        reduceMotion: ReduceMotion.System
    });

    useEffect(()=>{
        if(deletionTrigger){
            setDisableDeletion(true)
            translateX.value = translateXValue;

        }else{
            setDisableDeletion(false);
            translateX.value = withSpring(0);
        }

    },[deletionTrigger]);

    const filteredVideo = async (id) =>{
        if(!id) return;
        translateX.value = withSpring(0);
        console.log("VideoFILTERED ", id);
        try{
            const res = await fetch(`${DB_URL}/filterVideo`,{
                method:'POST',
                headers: {'Content-Type':'application/json'},
                body: JSON.stringify({
                    id:id,
                    state: true,
                })
            });
            if(!res.ok){
                throw new Error(`Error changing filtered state for if: ${id}`);
            }
            console.log(`Video ${id} Filtered!`)
        }catch(err){
            console.log("Error changing state id:",id);
        }
    }

    const deleteVideo = async (id) => {
        if(!id) return;
        const idsForDeletion = [id]
        translateX.value = withSpring(0);
        console.log("VideoDeleted", id);
        /*
        try{
            const res = await fetch("http://192.168.0.8:3004/deleteVideo",{
                method:'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    videos:idsForDeletion,
                }),
            });
            if(!res.ok){
                throw new Error(`Error deleting video id: ${id} , ${res.status}`);
            }
            console.log(`Video deleted ${id}`)
        }catch(err){
            console.log("Error deleting vide id:",id);
        }
        */
    };

        const hadleStart = (event)=>{
            translateX.value = 0;
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
        }
    
        const hadleMove = (event)=>{
            const eventSource = event.nativeEvent || event;
            let touchPoint;
    
            if(eventSource.touches && eventSource.touches.length > 0){
                touchPoint = eventSource.touches[0];
                translateX.value = withSpring(0);
            }else{
                touchPoint = eventSource;
                translateX.value = translateXValue;
            }
    
            const clientX = touchPoint.pageX || touchPoint.clientX;
            const desiredX = clientX - offsetRefX.current;
            
            const clientY = touchPoint.pageY || touchPoint.clientY;
            offsetRefY.current = clientY - translateY.value;

            translateX.value = Math.max(MIN_X_LIMIT, Math.min(desiredX, MAX_X_LIMIT));
            
            if(translateX.value < 40){
                translateX.value = withSpring(0);
            }else{
                translateX.value = translateXValue;
            }
        };
    
        const hadleEnd = () => {
            translateX.value = withSpring(0);
            //console.log("hadleEnd",translateX.value)
            
            if(translateX.value < 40){
                translateX.value = withSpring(0);
            }else{
                translateX.value = translateXValue
            }
            
        }

    return(
        <View style={{justifyContent:'center' }}>
            {disableDeletion && 
                    <Pressable 
                    //полная хуйня , но меня ебет фиксить , новая мобила , новый размер ) 
                        style={{
                            position:'absolute',
                            height:"100%",
                            width:"230%",
                            zIndex:10,
                            marginLeft:110,
                        }}
                        onPress={()=>{setDeletionTrigger(false)}}
                    />
                }
            <View style={styles.deletionForm}>
               <Pressable 
                    style={{ height:"100%",width:'100%',}}
                    //onPress={()=>deleteVideo(id)}
                    onPress={()=>filteredVideo(id)}
               >
                    <Text style={styles.deleteButton}>
                        delete
                    </Text>
               </Pressable>
            </View>
           
            <Animated.View 
                style={[
                    styles.baseForm,
                    animatedStyles,
                ]}
                onTouchStart={hadleStart}
                onTouchMove={hadleMove}
                onTouchEnd={hadleEnd}
            >
                <YTVidForm 
                    thumbnail={thumbnail} 
                    name={name} 
                    date={date} 
                    duration={duration} 
                    id={id}
                    isItUnique={isItUnique}
                    url={url}
                />
            </Animated.View >   
        </View>     
    );
};

const styles = StyleSheet.create({
    baseForm:{
        flex:1,
        //marginLeft:10
    },
    deletionForm:{
        position:'absolute',
        width:"30%",
        backgroundColor:'red',
        height:76,
        flex:1,
        flexDirection:'row',

        marginTop:8,
        //marginLeft:10,
        
    },
    deleteButton:{
        height:"100%",
        width:'100%',
        textAlign:'center',
        textAlignVertical:'center',
        fontWeight:'600',
        fontSize:20,
        color:'white'
    }
    
})
