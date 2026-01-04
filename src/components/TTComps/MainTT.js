import { useEffect, useRef, useState } from "react"; 
import { Audio } from "expo-av"; 

export default function useSoundEffect() {
    const soundRef = useRef(null);

    useEffect(()=>{
        let isMounted = true;

        Audio.Sound.createAsync(
            require('../../../assets/0103.mp3')
        ).then(({sound})=>{
            if(isMounted){
                soundRef.current = sound;
            }
        });

        return () => {
            isMounted = false;
            if(soundRef.current){
                soundRef.current.unloadAsync();

            }
        };
    },[]);

    const playSound = async () => {
        if(!soundRef.current) return;
        await soundRef.current.replayAsync();
    };

    return playSound;
}

