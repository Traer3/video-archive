import { useEffect, useRef, useState } from "react";
import {useAudioPlayer, useAudioPlayerStatus } from "expo-audio";

// '../../../assets/0103.mp3'

export default function useSoundEffect() {

    const player = useAudioPlayer(require('../../../assets/0103.mp3'));
    const status = useAudioPlayerStatus(player);
    const isPlayingRef = useRef(false);

    if(player){
       // console.log("PlayerCreated")
    }
    
    const playSound = async () => {
        if(!player || isPlayingRef.current || !status.isLoaded) return;

        isPlayingRef.current = true;
        console.log("PlayerColdStart")
        player.seekTo(0);
        player.volume = 0.5
        player.play();

        return new Promise((resolve)=>{
            const check = setInterval(()=>{
                if(!status.playing){
                    clearInterval(check);
                    isPlayingRef.current = false;
                    resolve();
                }
            },50);
        });
    };

    useEffect(()=>{
        return()=>{
            console.log("Plaer release")
            player?.release();
        }
    },[])

   return playSound;
}