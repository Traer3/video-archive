import { Animated, View, Text, StyleSheet } from "react-native";
import { PanGestureHandler, State, GestureHandlerRootView } from "react-native-gesture-handler";


export default function SwipeComponent(){
    const translateX = new Animated.Value(0);

    const  onGestureEvent = Animated.event(
        [{nativeEvent: {translationX: translateX}}],
        {useNativeDriver: true}
    );

    const onHandlerStateChange = (event) =>{
        if(event.nativeEvent.oldState === State.ACTIVE) {
            if(event.nativeEvent.translationX > 100){
                Animated.spring(translateX,{
                    toValue: 0,
                    useNativeDriver: true
                }).start();
                alert('Элемент активирован');
            }else{
                // Возвращаем на место
                Animated.spring(translateX,{
                    toValue: 0,
                    useNativeDriver:true
                }).start();
            }
        }
    };

    return(
        <GestureHandlerRootView style={{flex:1}}>
            <View style={styles.container}>
                <PanGestureHandler
                    onGestureEvent={onGestureEvent}
                    onHandlerStateChange={onHandlerStateChange}
                >
                    <Animated.View
                        style={[
                            styles.box,
                            {
                                transform:[{translateX: translateX}]
                            }
                        ]}
                    >
                        <Text>Свайпни меня вправо</Text>
                    </Animated.View>
                </PanGestureHandler>
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