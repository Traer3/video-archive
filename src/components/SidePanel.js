import { View, StyleSheet } from "react-native"
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated"


export default function SidePanel({children}){


    const translateX = useSharedValue();
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
        <GestureHandlerRootView>
            <View style={{flex:1}}>
                <GestureDetector gesture={panGesture}>
                    <Animated.View 
                        style={[styles.conteiner, animatedStyle]}>
                            <View style={styles.panel}>
                                {children}
                            </View>
                    </Animated.View>
                </GestureDetector>
            </View>
        </GestureHandlerRootView>
    )
}

const styles = StyleSheet.create({

    panel:{
        flex:1,
        position:'absolute',
        borderRadius:2,
        borderWidth:1,
        borderColor:'rgb(43,75,123)',
        backgroundColor:'rgb(73,106,154)',
        width:'20%',
        height:'95%',
        top:30,
        left:1,
        transform: "translateX(-85%)"
    },
    conteiner:{
        flex:1,
    }
})