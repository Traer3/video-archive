import { Dimensions, StyleSheet } from "react-native";
import { View, Image,Pressable,Text } from "react-native";
import { useEffect, useRef, useState } from "react";
import bratty from "../../meme/arona.gif"
import shareIcon from "../../../assets/share.png"
import Animated, { ReduceMotion, useAnimatedStyle, useSharedValue, withRepeat, withSpring } from "react-native-reanimated";



export default function MainTT ({thumbnail, name, date , duration,id}) {
    const [buttonTest, setButtonTest] = useState(0);
    
    //const windowWidth = Dimensions.get('window').width
    const translateX = useSharedValue(0);
    const offsetRef = useRef(0);

    const animatedStyles = useAnimatedStyle(()=>({
        transform: [{translateX: translateX.value}],
    }));

    useEffect(()=>{
        translateX.value = withRepeat(withSpring(-translateX.value,{
            stiffness: 900,
            damping:120,
            mass:4,
            overshootClamping:false,
            energyThreshold:6e-9,
            velocity:0,
            reduceMotion: ReduceMotion.System
        }));
    },[]);

    const hadleStart = (event)=>{
        const eventSource = event.nativeEvent || event;
        let touchPoint;

        if(eventSource.touches && eventSource.touches.length > 0){
            touchPoint = eventSource.touches[0];
        }else{
            touchPoint = eventSource;
        }

        const clientX = touchPoint.pageX || touchPoint.clientX;
        const initialClientX = -clientX;

        offsetRef.current = initialClientX - translateX.value;
    }

    const hadleMove = (event)=>{
        const eventSource = event.nativeEvent || event;
        let touchPoint;

        if(eventSource.touches && eventSource.touches.length > 0){
            touchPoint = eventSource.touches[0];
        }else{
            touchPoint = eventSource;
        }

        const clientX = touchPoint.pageX || touchPoint.clientX;
        const desiredX = clientX + offsetRef.current;
        translateX.value = desiredX

        console.log(desiredX)
    };

    const hadleEnd = () => {
        console.log("FuckOFF");

        if(translateX.value < 50){
            translateX.value = withSpring(0);
        }else{
            translateX.value = withSpring(120,{
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


        return(
            <View style={styles.main}>
                
                <View 
                style={{
                    borderColor:"green",
                    backgroundColor:'rgb(71, 103, 151)',
                    borderWidth:4,
                    alignItems:'center',
                    

                    height:"90%",
                    width:'90%',
                    marginTop:"10%",
                    marginLeft:"5%",
                    zIndex:1,
                }}>

                    <Animated.View 
                        style={[styles.baseForm, animatedStyles]}
                        onTouchStart={hadleStart}
                        onTouchMove={hadleMove}
                        onTouchEnd={hadleEnd}
                        >
                            <Image
                                style={styles.imageStyle}
                                source={thumbnail ? {uri: thumbnail} : bratty}
                                resizeMode="contain"
                            />
                                    
                            <View 
                                style={{
                                    flex:1,
                                    marginLeft:3
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
                            </View>
                            <Pressable
                                style={{
                                    marginRight:5,
                                    marginTop:50
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
                    </Animated.View >
                </View>
            </View>
        );
};

const styles = StyleSheet.create({
    main:{
        position:'absolute',
        width:'100%',
        height: '92%',
        borderWidth:1,
        borderColor:'red',
        
    },
    baseForm:{
        position:"absolute",
        flexDirection:'row',
        backgroundColor:'rgb(73,106,154)',
        borderWidth:2,
        borderColor:'rgb(43,75,123)',
        height:'10%',
        width:'70%',

        marginTop:'2%',
        
    },
    imageStyle:{
        borderWidth:0.3,
        borderRadius:2,
        
        height:'100%',
        width:'40%'
    }
})