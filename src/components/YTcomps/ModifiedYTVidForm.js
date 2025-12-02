import { View, StyleSheet, Text, Image, Pressable } from "react-native"
import creature from '../../meme/hoshino.png'
import bratty from '../../meme/arona.gif'
import shareIcon from '../../../assets/share.png'
import { useRef, useState } from "react"
//import placeholder from "../../../assets/AronaServer.jpg"


export default function ModifiedYTVidForm({thumbnail, name, date , duration,isItUnique,id}) {


    const [buttonTest, setButtonTest] = useState(0)


    const [isDragging, setIsDragging] = useState(false);
    const [offset, setOffset] = useState({x:0})
    const [position, setPosition] = useState({x:0});

    const [pressStartTime, setPressStartTime] = useState(null);
    const [timeHeld, setTimeHeld] = useState(0);


    const hadleStart = (event)=> {
        console.log("someone is touching me")
        setIsDragging(true);

        const eventSource = event.nativeEvent || event;
        let touchPoint;
        if(eventSource.touches && eventSource.touches.length > 0){
            touchPoint = eventSource.touches[0];
        }else{
            touchPoint = eventSource;
        }

        const clientX = touchPoint.pageX || touchPoint.clientX;

        setOffset({
            x: clientX - position.x,
        });
    }

    const hadleMove = (event) =>{
        console.log("move me ")
        if(!isDragging) return;

        const eventSource = event.nativeEvent || event;
        let touchPoint;
        if(eventSource.touches && eventSource.touches.length > 0){
            touchPoint = eventSource.touches[0];
        }else{
            touchPoint = eventSource;
        }

        const clientX = touchPoint.pageX || touchPoint.clientX;

        console.log("Moi cordi: ", clientX)

        setPosition({
            x: clientX - offset.x,
        });
    };

    const hadleEnd = () =>{
        setIsDragging(false);

    }

    const specialFunction = () =>{
        console.log("Я активировался! ")
    }


    const getCurrentTimestamp = (event) => {
        if(event && event.timeStamp){
            return event.timeStamp;
        }
        return Date.now();
    };

    const hadlePressIn = (event) =>{
        const startTime = getCurrentTimestamp(event);
        setPressStartTime(startTime);
        setTimeHeld(0);
    };

    const handlePressOut = (event) => {
        if(pressStartTime === null) return;

        const endTime = getCurrentTimestamp(event);
        const calculatedDuration = Math.round(endTime - pressStartTime);

        setTimeHeld(calculatedDuration);
        setPressStartTime(null);

        console.log(calculatedDuration)
    }
  
    
    

    return(
        <View 
            style={[
                styles.baseForm,{
                    borderColor: isItUnique ? 'red': 'rgb(43,75,123)', 
                    right:`${position.x}`,
                }
            ]}
            

            //onTouchStart={hadleStart}
            //onTouchMove={hadleMove}
            //onTouchEnd={hadleEnd}

            
        >
            <Pressable 
            onPressIn={hadlePressIn}
            onPressOut={handlePressOut}
            >
            <Image
                    style={styles.imageStyle}
                    source={thumbnail ? {uri: thumbnail} : bratty}
                    resizeMode='stretch'
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
            </Pressable>
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

//Версия с pangestur
/*
import { View, StyleSheet, Text, Image, Pressable } from "react-native"
import creature from '../../meme/hoshino.png'
import bratty from '../../meme/arona.gif'
import shareIcon from '../../../assets/share.png'
import { useState } from "react"
//import placeholder from "../../../assets/AronaServer.jpg"
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated"

export default function ModifiedYTVidForm({thumbnail, name, date , duration,isItUnique,id}) {


    const [buttonTest, setButtonTest] = useState(0)


    const [isDragging, setIsDragging] = useState(false);
    const [offset, setOffset] = useState({x:0})
    const [position, setPosition] = useState({x:0});

    const translateX = useSharedValue(0);

    const hadleStart = (e)=> {
        console.log("someone is touching me")
        setIsDragging(true);
        const clientX = e.touches ? e.touches[0].client.X : e.clientX;

        setOffset({
            x: clientX - position.x,
        });
    }

    const hadleMove = (e) =>{
        console.log("move me ")
        if(!isDragging) return;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;

        console.log("Cordinats: ",clientX)

        setPosition({
            x: clientX - offset.x,
        });
    };

    const hadleEnd = () =>{
        setIsDragging(false);

    }

    const specialFunction = () =>{
        console.log("Я активировался! ")
    }

    //бля вся эта хуйня может не сработать нахуй в FlatListe , если не работает , удали withSpring , если нет
    // УДАЛИ НАХУЙ FLATLIST и создай свой 
    const panGesture = Gesture.Pan()
        .onUpdate((event)=>{
            translateX.value = 0 + event.translationX;
        })

        .onEnd((event)=>{
            if(event.translationX > 100){
                translateX.value = withSpring(0);
                //сюда можно как раз добавить функцию которя будет запускаться
                // для этого нужно ебануть новый runOnJS() 
            }else{
                translateX.value = withSpring(0);
            }
            translateX.value = withSpring(0, {damping: 10, stiffness: 100});
        });
    
    const animatedStyle = useAnimatedStyle(()=>({
        transform:[{translateX: translateX.value}],
    }))

    return(
        <GestureHandlerRootView style={{flex:1}}>
            <View 
            style={styles.baseForm}
            >
                <GestureDetector gesture={panGesture}>
                    <Animated.View>
                                <View 
                                    style={[
                                        styles.baseForm,{
                                            borderColor: isItUnique ? 'red': 'rgb(43,75,123)', 
                                            
                                            //right:`${position.x}`,
                                            
                                        }
                                        ]}
                                        //onTouchStart={(e)=>{hadleStart(e);}}
                                        //onTouchMove={hadleMove}
                                        //onTouchEnd={hadleEnd}
                        
                                    >
                                        <Image
                                            style={styles.imageStyle}
                                            source={thumbnail ? {uri: thumbnail} : bratty}
                                            resizeMode='stretch'
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
                                </View>
                    </Animated.View>
                </GestureDetector>
            </View>
        </GestureHandlerRootView>
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

*/