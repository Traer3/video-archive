import { useRef } from "react";
import { Pressable } from "react-native";
import * as  Haptics from 'expo-haptics';
import ModifiedYTVidForm from "./ModifiedYTVidForm";
import YTLoading from "./YTLoading";

export default function RenderItem ({item,setScrollAnimation,setSelectedVideo,setDeletionTrigger,deletionTrigger}){
    if(!item.id) return null;
    if(!item.duration || !item.thumbnail) {
        const placeholder = Array.from({length: 7}, (_,i)=>(
            <YTLoading key={i} delay={i * 150}/>
        ))
        return(
            <>{placeholder}</>
        );
    }

    const pressStartTime = useRef(null);

    const startX = useRef(null);
    const startY = useRef(null);
    const direction = useRef(null);
    const THRESHOLD = 4

    const hadlePressIn = (event) =>{
        pressStartTime.current = Date.now();

        setScrollAnimation(false);
        const e = event.nativeEvent;
        const touch = e.touches?.[0] ?? e;

        startX.current = touch.pageX;
        startY.current = touch.pageY;
        direction.current = null;     
    };

    const hadleMove = (event)=>{
        if(startX.current === null || startY.current === null) return;

        const e = event.nativeEvent;
        const touch = e.touches?.[0] ?? e;

        const directionX = touch.pageX - startX.current;
        const directionY = touch.pageY - startY.current;

        if(!direction.current){
            if(Math.abs(directionX)< THRESHOLD && Math.abs(directionY) < THRESHOLD) return;

            if(Math.abs(directionX) > Math.abs(directionY)){
                direction.current = "x";
                setScrollAnimation(false)
                pressStartTime.current = null
                //console.log("Movment by X");
            }else{
                direction.current = "y";
                setScrollAnimation(true)
                pressStartTime.current = null
                //console.log("Movment by Y");               
            }
        }
    };

    const handlePressOut = async (itemUrl) => {
        startX.current = null;
        startY.current = null;
        direction.current = null;

        setScrollAnimation(true)

        if(pressStartTime.current){
            const releseTime = Date.now();
            const buttonHeld = releseTime - pressStartTime.current;
            //console.log("buttonHeld", buttonHeld,'ms');
            
            if(buttonHeld > 139 && buttonHeld < 400){
               setSelectedVideo(itemUrl)
            }
            pressStartTime.current = null;
        }
    };

    const hadleOnLoongPress = () =>{
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft)
        setDeletionTrigger(true)
    }
    
    return(
        <Pressable 
            onPressIn={(event)=> hadlePressIn(event,item.url)}
            onTouchMove={hadleMove}
            onPressOut={()=> handlePressOut(item.url)}
            onLongPress={hadleOnLoongPress}
            >
                <ModifiedYTVidForm 
                    thumbnail={item.thumbnail} 
                    name={item.name} 
                    date={item.date} 
                    duration={item.duration} 
                    isItUnique={item.isitunique} 
                    id={item.id}
                    url={item.url}
    
                    setDeletionTrigger={setDeletionTrigger}
                    deletionTrigger={deletionTrigger}
                />
        </Pressable>
    )
}
