import { View, StyleSheet, Text, Dimensions, Pressable } from "react-native"
import YTVidForm from "./YTVidForm";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withDecay, withSpring } from "react-native-reanimated";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";


export default  function SwipeArea({areaState}) {

    const offSetY = useSharedValue(0);
    const translateY = useSharedValue(0);

    const panGesture = Gesture.Pan()
        .onBegin(()=>{
            offSetY.value = translateY.value;
        })
        .onUpdate((event)=>{
            translateY.value = offSetY.value + event.translationY;
        })

        .onEnd((event)=>{
           translateY.value = offSetY.value + event.translationY
           
           translateY.value = withDecay({
                velocity: event.velocityY,
                clamp: [-1000, 1000]
           });
        })
    
    const animatedStyle = useAnimatedStyle(()=>({
        transform:[{translateY: translateY.value}],
    }))

    const onAreaPress = () =>{
        areaState(false)
    }

    return(
        <GestureHandlerRootView style={{borderWidth:0.1}} >
          
                <Pressable 
                    style={styles.outerArea} 
                    onPress={onAreaPress}
                    >
                </Pressable>
                
                <GestureDetector gesture={panGesture}>
                            <View style={styles.conteiner}>
                                <Animated.View 
                                    style={[
                                        styles.content, 
                                        animatedStyle
                                    ]}>
                                    <YTVidForm/>
                                    <YTVidForm/>
                                    <YTVidForm/> 
                                    <YTVidForm/>
                                    <YTVidForm/>
                                    <YTVidForm/>
                                    <YTVidForm/>
                                    <YTVidForm/>
                                    <YTVidForm/>
                                    <YTVidForm/>
                                    <YTVidForm/>
                                    <YTVidForm/>
                                    <YTVidForm/>
                                    <YTVidForm/>
                                    <YTVidForm/>
                                    <YTVidForm/>
                                    <YTVidForm/>
                                    <YTVidForm/>          
                                </Animated.View>
                            </View>
                        </GestureDetector>
           
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    conteiner: {
        width:'60%',
        height:'100%',
        backgroundColor:'rgb(71, 103, 151)',
        marginLeft:'20%',
        marginTop:'10%',
        overflow:'hidden',
    },
    content:{
        flex:1,
        justifyContent:'colume',
    },
    outerArea:{
        position:'absolute',
        width:'100%',
        height:'100%',
        backgroundColor:'rgba(0,0,0,0.5)',
    }
    

})