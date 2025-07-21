import { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler"; 
import Animated,{useSharedValue, useAnimatedStyle, withSpring, runOnJS} from "react-native-reanimated";


export default function SwipeComponent(){
    const translateX = useSharedValue(0);

    const [text, setText] = useState("kys")
    const panGesture = Gesture.Pan()

        .onUpdate((event)=>{
            translateX.value = event.translationX;
        })
        
        .onEnd((event)=>{
            if(event.translationX > 100){ // в какую сторону 
               runOnJS(setText)("never KYS")
               runOnJS(alert)("Элемент активирован! ")
            }
            //возврат в исходное положение
            translateX.value = withSpring(0, {
                damping: 10,  
                stiffness: 100 
              });
        });

        const animatedStyle = useAnimatedStyle(()=>({
            transform:[{translateX: translateX.value}],
        }));

    return(
        <GestureHandlerRootView style={{flex:1}}>
            <View style={styles.container}>     
                <GestureDetector gesture={panGesture}>
                    <Animated.View style={[styles.box, animatedStyle]}>
                            <Text>{text}</Text>
                    </Animated.View>
                </GestureDetector>
            </View>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container:{
        flex:1,
        justifyContent:'center',
        alignItems:'center',
    },
    box:{
        width:200,
        height:100,
        backgroundColor:'lightblue',
        justifyContent:'center',
        alignItems:'center',
        borderRadius:10,
    },
})