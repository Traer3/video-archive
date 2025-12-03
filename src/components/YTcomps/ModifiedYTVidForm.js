import { View, StyleSheet, Text, Image, Pressable, ImageBackground } from "react-native"
import creature from '../../meme/hoshino.png'
import bratty from '../../meme/arona.gif'
import shareIcon from '../../../assets/share.png'
import { useRef, useState } from "react"
import deleteIcon from "../buttons/buttonIcons/delete-button.png"
//import placeholder from "../../../assets/AronaServer.jpg"


export default function ModifiedYTVidForm({thumbnail, name, date , duration,isItUnique,id,scrollAnimation,setScrollAnimation}) {


    const [buttonTest, setButtonTest] = useState(0)


    const [isDragging, setIsDragging] = useState(false);
    const [offset, setOffset] = useState({x:0})
    const [position, setPosition] = useState({x:0});

    const [pressStartTime, setPressStartTime] = useState(null);
    const [timeHeld, setTimeHeld] = useState(0);

    const MIN_X_LIMIT = -101;
    const MAX_X_LIMIT = 0;


    const hadleStart = (event)=> {
        if(scrollAnimation) return;

        //console.log("someone is touching me")
        setIsDragging(true);

        const eventSource = event.nativeEvent || event;
        let touchPoint;
        if(eventSource.touches && eventSource.touches.length > 0){
            touchPoint = eventSource.touches[0];
        }else{
            touchPoint = eventSource;
        }

        const clientX = -touchPoint.pageX || -touchPoint.clientX;

        

        setOffset({
            x: clientX - position.x,
        });
    }

    const hadleMove = (event) =>{
        if(scrollAnimation) return;

        if(!isDragging) return;

        const eventSource = event.nativeEvent || event;
        let touchPoint;
        if(eventSource.touches && eventSource.touches.length > 0){
            touchPoint = eventSource.touches[0];
        }else{
            touchPoint = eventSource;
        }
       

        const clientX = -touchPoint.pageX || -touchPoint.clientX;

        const desiredX = clientX - offset.x;
        console.log("desiredX:", desiredX)
        const clampedX = Math.max(MIN_X_LIMIT, Math.min(desiredX, MAX_X_LIMIT))
        console.log("clampedX:", clampedX)

        console.log("Moi cordi: ", clientX)

        setPosition({
            x: clampedX
        });
    };

    const hadleEnd = () =>{
        if(scrollAnimation) return;

        setIsDragging(false);
        setScrollAnimation(true)

    }

    const specialFunction = () =>{
        console.log("Я активировался! ")
        setScrollAnimation(false)
    }


    const getCurrentTimestamp = (event) => {
        if(event && event.timeStamp){
            return event.timeStamp;
        }
        return Date.now();
    };

    const hadlePressIn = (event) =>{
        //console.log("Item id",id)
        const startTime = getCurrentTimestamp(event);
        setPressStartTime(startTime);
        setTimeHeld(0);
    };

    const handlePressOut = (event) => {
        if(pressStartTime === null) return;

        const endTime = getCurrentTimestamp(event);
        const calculatedDuration = Math.round(endTime - pressStartTime);

        if(calculatedDuration > 150){
            specialFunction();
        }
        if(calculatedDuration < 150){
            setScrollAnimation(true)
        }

        setTimeHeld(calculatedDuration);
        setPressStartTime(null);

        console.log(calculatedDuration)
    }
  
    
    

    return(
        <Pressable 
                onPressIn={hadlePressIn}
                onPressOut={handlePressOut}
                >
            <Pressable
                style={[
                    styles.baseForm,{
                        position:'absolute',
                        borderColor: 'red', 
                        width:"30%",
                        backgroundColor:'red'
                    }
                ]}
            >
               <Text 
                    style={{
                        height:"100%",
                        width:'100%',
                        
                        textAlign:'center',
                        textAlignVertical:'center',
                        fontWeight:'600',
                        fontSize:20,
                        color:'white'
                    }}
               >
                delete
               </Text>
            </Pressable>
            <View 
                style={[
                    styles.baseForm,{
                        borderColor: isItUnique ? 'red': 'rgb(43,75,123)', 
                        //borderColor: 'green', 
                        right:`${position.x}`,
                    }
                ]}
                onTouchStart={hadleStart}
                onTouchMove={hadleMove}
                onTouchEnd={hadleEnd}
            >
                <Image
                    style={styles.imageStyle}
                    source={thumbnail ? {uri: thumbnail} : bratty}
                    resizeMode='stretch'
                />

                <View 
                    style={{
                    marginLeft:3,
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

                    <Pressable
                        style={{
                            //borderWidth:1,
                            //borderColor:'red',
                            alignItems:"flex-end"
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

                
                
            </View>   
        </Pressable>     

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
