import { View, StyleSheet } from "react-native"
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated"


export default function SidePanel({children}){

    const translateX = useSharedValue(0);
    const panGesture = Gesture.Pan()
        .onUpdate((event)=>{
            translateX.value = event.translationX;
        })

        .onEnd((event)=>{
            if(event.translationX > 100){
                runOnJS(alert)("Ты повернул вправо!")
            }
            if(event.translationX < 100){
                runOnJS(alert)("Ты повернул влево!")
            }
            translateX.value = withSpring(0, {
                damping: 10,
                stiffness: 100
            });
        });
    
    const animatedStyle = useAnimatedStyle(()=>({
        transform:[{translateX: translateX.value}],
    }));

    return(
        <GestureHandlerRootView style={{flex:1,}}>
            <View style={styles.conteiner}>
                <GestureDetector gesture={panGesture}>
                    <Animated.View style={[styles.panel, animatedStyle]}>
                        {children}
                    </Animated.View>
                </GestureDetector>
            </View>
        </GestureHandlerRootView>
    )
}

const styles = StyleSheet.create({
    panel:{
        position:'absolute',
        borderRadius:2,
        borderWidth:1,
        borderColor:'rgb(43,75,123)',
        backgroundColor:'rgb(73,106,154)',
        width:'20%',
        height:'95%',
        top:30,
        left:1,
    },
    conteiner:{
        flex:1, 
    }
})