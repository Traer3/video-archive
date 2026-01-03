import { useEffect, useRef, useState } from "react";
import { Audio } from "expo-av";

export default function useSoundEffect({volume = 0.3, rate = 8, correctPitch = true} = {}) {
    const soundRef = useRef(null);

    // '../../../assets/0103.mp3'
    useEffect(()=>{
       let isMounted = true;

       Audio.Sound.createAsync(
            require('../../../assets/0103.mp3')
       ).then(async ({sound}) =>{
        if(!isMounted) return;

        await sound.setVolumeAsync(volume);
        await sound.setRateAsync(rate, correctPitch);
        soundRef.current = sound
       });

       return () => {
        isMounted = false;
        if(soundRef.current){
            soundRef.current.unloadAsync();
        }
       };
    },[volume]);


    let isPlaying = false;
    const playSound =  () => {
        if(isPlaying) return Promise.resolve();

        isPlaying = true;

        return new Promise(async (resolve)=>{
            if(!soundRef.current){
                resolve();
                return;
            }
            
            soundRef.current.setOnPlaybackStatusUpdate(status => {
                if(status.didJustFinish){
                    isPlaying = false;
                    soundRef.current.setOnPlaybackStatusUpdate(null);
                    resolve();
                }
            });

            await soundRef.current.replayAsync();
        });
    };
    return playSound; 
}