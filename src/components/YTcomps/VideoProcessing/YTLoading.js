import { useEffect, useRef } from "react";
import { Animated , StyleSheet} from "react-native";

export default function YTLoading ({delay = 0}){
    const fadeAnim = useRef(new Animated.Value(0.5)).current;

    useEffect(()=>{
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(fadeAnim,{
                    toValue: 1,
                    duration: 800,
                    delay,
                    useNativeDriver: false,
                }),
                Animated.timing(fadeAnim,{
                    toValue: 0.4,
                    duration: 800,
                    useNativeDriver: false,
                }),
            ])
        );
        loop.start();
        return()=> loop.stop();
    },[fadeAnim]);

    return(
        <Animated.View
            style={[
                styles.baseForm,
                {
                    backgroundColor: fadeAnim.interpolate({
                        inputRange: [0.4, 1],
                        outputRange: ["rgb(63,96,144)","rgb(83,126,184)"],
                    }),
                },
            ]}
        />
    );
}

const styles = StyleSheet.create({
    baseForm:{
        flexDirection:'row',
        height: 80,
        marginVertical: 6,
        marginHorizontal: 10,
        borderRadius:4,
    },
});