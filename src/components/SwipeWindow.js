import { useEffect } from "react";
import { View, StyleSheet, Text, Pressable, Dimensions } from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, ReduceMotion, useAnimatedReaction } from "react-native-reanimated";
import { runOnJS, scheduleOnRN } from "react-native-worklets";


export default function SwipeWindow ({setTriggerButton}) {
    const SWIPE_THRESHOLD = -60;
    const {height, width} = Dimensions.get('window');
    const isFinished = useSharedValue(false);
    const translateX = useSharedValue(0);
    const transleteHeight = useSharedValue(height);
    const transleteWidth = useSharedValue(width);


    const animatedStyles = useAnimatedStyle(()=>({
        transform: [{translateX: translateX.value}],
       
    }))
    const animatedSize = useAnimatedStyle(()=>({
        height: transleteHeight.value,
        width: transleteWidth.value,
    }))

    const translateXValue = withSpring(-width,{
            stiffness: 5000,
            damping:500,
            mass:1,
            overshootClamping:false,
            energyThreshold:6e-9,
            velocity:3,
            reduceMotion: ReduceMotion.System
    });

    const translateXValueReverse = withSpring(-1,{
        stiffness: 3000,
        damping:200,
        mass:4,
        overshootClamping:false,
        energyThreshold:6e-9,
        velocity:0,
        reduceMotion: ReduceMotion.System
    });

    const transformHeight = withSpring(height * 0.7,{
        stiffness: 5000,
    })
    const transformWidth = withSpring(width * 0.7,{
        stiffness: 5000,
    })
    
    useEffect(()=>{
        if(setTriggerButton){
            translateX.value = translateXValue
        }

    },[setTriggerButton])

   function togOff() {
        setTimeout(()=>{
            setTriggerButton(false);
        },300)
   }

    useAnimatedReaction(
        () => isFinished.value,
        (current, previous) =>{
            if(current && current !== previous){
                scheduleOnRN(togOff)
            }
        }
    );

    const panGesture = Gesture.Pan()
        .shouldCancelWhenOutside(false)
        .onEnd((event)=>{
            if(event.translationX < SWIPE_THRESHOLD || event.velocityX < -500){
                
                translateX.value = translateXValueReverse
                transleteHeight.value = transformHeight
                transleteWidth.value = transformWidth
                
                isFinished.value = true;
            }
        })
    
    return(
        <GestureHandlerRootView style={styles.root}>
            <GestureDetector gesture={panGesture}>
                <Animated.View style={[styles.conteiner,animatedStyles]}>
                    <Animated.View style={[styles.main,animatedSize]}>
                        <Pressable 
                            style={{
                                position:'absolute',
                                zIndex:10,
                                height:'30%',
                                width:'30%',
                                borderColor:'red',
                                borderWidth:2,
                                backgroundColor:'red',
                            }}
                            //onPress={()=> setTriggerButton(false)}
                        />
                    </Animated.View>
                </Animated.View>
            </GestureDetector>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    root:{
        position:'absolute',
        height:"100%",
        width:"100%",
        zIndex:3,
    },
    conteiner:{
        position:'absolute',
        height:"100%",
        alignItems:'center',
        justifyContent:'center',
        right:'-100%',
        zIndex:3,
    },
    main:{
        //borderColor:'green',
        borderWidth:2,
        borderRadius:2,
        borderWidth:1,
        borderColor:'rgb(43,75,123)',
        backgroundColor:'rgb(73,106,154)',
    }
})