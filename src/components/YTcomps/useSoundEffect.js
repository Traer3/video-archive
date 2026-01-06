import { useEffect, useRef, useState } from "react";
import {useAudioPlayer, useAudioPlayerStatus } from "expo-audio";

// '../../../assets/0103.mp3'

export default function useSoundEffect() {
    
    const player = useAudioPlayer(require('../../../assets/0103.mp3'));
    const isPlayingRef = useRef(false);

    const playSound =  () => {
        if(!player || isPlayingRef.current){
            return Promise.resolve();
        }

        return new Promise((resolve)=>{
            try{
                isPlayingRef.current = true;
                player.seekTo(0);
                player.play();

                const duration = player.duration ?? 1000;
                console.log("Duration",duration)
                setTimeout(()=>{
                    isPlayingRef.current = false;
                    player.seekTo(0);
                    resolve();
                },duration);
            }catch(err){
                console.error("Error while playing sound", err);
                isPlayingRef.current = false;
                resolve();
            }
        });
    };

   return playSound;
}