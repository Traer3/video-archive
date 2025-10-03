import { useState } from "react";
import { View, StyleSheet } from "react-native"
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated"


export default function SidePanel({children}){

    const [isOpen, setIsOpen] = useState(false);
    const translateX = useSharedValue(-85);
    const panGesture = Gesture.Pan()
        .onUpdate((event)=>{
            translateX.value = -85 + event.translationX;
        })

        .onEnd((event)=>{
            if(event.translationX > 100){
                translateX.value = withSpring(0);
                runOnJS(setIsOpen)(true);
                //runOnJS(alert)("Ты повернул вправо!")
                
            }else if(event.translationX < 100){
                translateX.value = withSpring(-85)
                //runOnJS(alert)("Ты повернул влево!")
                runOnJS(setIsOpen)(false);
            } else {
                translateX.value = withSpring(isOpen ? 0 : -85);
            }
            //translateX.value = withSpring(0, { damping: 10,stiffness: 100});
        });
    
    
    const animatedStyle = useAnimatedStyle(()=>({
        transform:[{translateX: translateX.value}],
        // transform:[{translateX: `${translateX.value}%`}],
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
        width:'100%',
        height:'8%',
        bottom:0,
        left:85,
        padding:10,
        
        flexDirection:'row',
        alignItems:'center',
        justifyContent:"space-between"
        
    },
    conteiner:{
        flex:1,
       
    }
})