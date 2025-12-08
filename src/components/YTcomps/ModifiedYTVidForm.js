import { View, StyleSheet, Text, Image, Pressable, ImageBackground } from "react-native"
import creature from '../../meme/hoshino.png'
import bratty from '../../meme/arona.gif'
import shareIcon from '../../../assets/share.png'
import { useRef, useState } from "react"
import Animated, { ReduceMotion, useAnimatedStyle, useSharedValue, withRepeat, withSpring } from "react-native-reanimated";

//import placeholder from "../../../assets/AronaServer.jpg"


export default function ModifiedYTVidForm({thumbnail, name, date , duration,isItUnique,id,scrollAnimation,setScrollAnimation, setPressStartTime}) {


    const [buttonTest, setButtonTest] = useState(0)

    const translateX = useSharedValue(0);
    const offsetRef = useRef(0);

    const MIN_X_LIMIT = 0;
    const MAX_X_LIMIT = 101;
    
    const animatedStyles = useAnimatedStyle(()=>({
        transform: [{translateX: translateX.value}],
    }));
    
    
        const hadleStart = (event)=>{
            setScrollAnimation(false);
            const eventSource = event.nativeEvent || event;
            let touchPoint;
    
            if(eventSource.touches && eventSource.touches.length > 0){
                touchPoint = eventSource.touches[0];
            }else{
                touchPoint = eventSource;
            }
    
            const clientX = touchPoint.pageX || touchPoint.clientX;
            
            offsetRef.current = clientX - translateX.value;
        }
    
        const hadleMove = (event)=>{
            setScrollAnimation(false);
            const eventSource = event.nativeEvent || event;
            let touchPoint;
    
            if(eventSource.touches && eventSource.touches.length > 0){
                touchPoint = eventSource.touches[0];
                translateX.value = withSpring(0);
            }else{
                touchPoint = eventSource;
                translateX.value = withSpring(100,{
                    stiffness: 900,
                    damping:120,
                    mass:4,
                    overshootClamping:false,
                    energyThreshold:6e-9,
                    velocity:0,
                    reduceMotion: ReduceMotion.System
                })
            }
    
            const clientX = touchPoint.pageX || touchPoint.clientX;
            const desiredX = clientX - offsetRef.current;
    
       
            translateX.value = Math.max(MIN_X_LIMIT, Math.min(desiredX, MAX_X_LIMIT));
    
        };
    
        const hadleEnd = () => {
            setScrollAnimation(true)
            setPressStartTime(null)
            translateX.value = withSpring(0);
            if(translateX.value < 30){
                translateX.value = withSpring(0);
            }else{
                translateX.value = withSpring(100,{
                    stiffness: 900,
                    damping:120,
                    mass:4,
                    overshootClamping:false,
                    energyThreshold:6e-9,
                    velocity:0,
                    reduceMotion: ReduceMotion.System
                })
            }
        }


    const specialFunction = () =>{
        console.log("Я активировался! ")
        setScrollAnimation(false)
    }


    const deleteVideo = (id) => {
        translateX.value = withSpring(0);
        console.log(`Video deleted ${id}`)
    }

    return(
        <View 
                style={{
                    justifyContent:'center'
                }}
                >
            <View
                style={[
                    styles.baseForm,{
                        position:'absolute',
                        
                        width:"30%",
                        backgroundColor:'red',
                        height:76,
                        
                    },
                ]}
            >
               <Pressable 
                 style={{
                    //borderColor:'green',
                    //borderWidth:2,
                    height:"100%",
                    width:'100%',
                 }}
                 onPress={()=>deleteVideo(id)}
               >
                <Text 
                        style={{
                            height:"100%",
                            width:'100%',
                            
                            textAlign:'center',
                            textAlignVertical:'center',
                            fontWeight:'600',
                            fontSize:20,
                            color:'white'
                        }}
                >
                    delete
                </Text>
               </Pressable>
            </View>
        
            <Animated.View 
                style={[
                    styles.baseForm,{
                        borderColor: isItUnique ? 'red': 'rgb(43,75,123)', 
                        //borderColor: 'green', 
                        //right:`${position.x}`,
                    },
                    animatedStyles,
                ]}
                onTouchStart={hadleStart}
                onTouchMove={hadleMove}
                onTouchEnd={hadleEnd}
            >
                <Image
                    style={styles.imageStyle}
                    source={thumbnail ? {uri: thumbnail} : bratty}
                    resizeMode='stretch'
                />

                <View 
                    style={{
                    marginLeft:3,
                }}>
                    <Text style={{width:'220',}} numberOfLines={1} ellipsizeMode="tail">
                        {name}
                    </Text>
                    <Text>
                        {date}
                    </Text>
                    <Text>
                        {duration}
                    </Text>

                    <Pressable
                        style={{
                            //borderWidth:1,
                            //borderColor:'red',
                            alignItems:"flex-end"
                        }}
                        onPress={()=>{
                            setButtonTest(prev => prev + 1)
                            console.log(buttonTest)
                        }}
                    >
                        <Image
                            source={shareIcon}
                            style={{width:20, height:20}}
                            resizeMode="contain"
                        />
                    </Pressable>
                </View>

                
                
            </Animated.View >   
        </View>     

    );
};

const styles = StyleSheet.create({
    baseForm:{
        flex:1,
        flexDirection:'row',
        backgroundColor:'rgb(73,106,154)',
        height:'80',
        borderWidth:2,

        marginTop:8,
        marginLeft:10,
        marginRight:10,

        
    },
    imageStyle:{
        borderWidth:1,
        borderRadius:2,
        height:'100%',
        width:'30%'
    }
})


//рабочая хуйня без анимки 
/*
<View
                style={[
                    styles.baseForm,{
                        position:'absolute',
                        borderColor: 'red', 
                        width:"30%",
                        backgroundColor:'red'
                    }
                ]}
            >
               <Pressable 
                 style={{
                    borderColor:'green',
                    borderWidth:2,
                    height:"100%",
                    width:'100%',
                 }}
                 onPress={()=>deleteVideo(id)}
               >
                <Text 
                        style={{
                            height:"100%",
                            width:'100%',
                            
                            textAlign:'center',
                            textAlignVertical:'center',
                            fontWeight:'600',
                            fontSize:20,
                            color:'white'
                        }}
                >
                    delete
                </Text>
               </Pressable>
            </View>

*/