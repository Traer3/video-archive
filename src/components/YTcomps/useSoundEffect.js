import { useEffect, useRef, useState } from "react";
import {useAudioPlayer, useAudioPlayerStatus } from "expo-audio";

// '../../../assets/0103.mp3'

export default function useSoundEffect() {
    const player = useAudioPlayer(
        require('../../../assets/0103.mp3')
    );
    const status = useAudioPlayerStatus(player);
    //console.log("Duration:", status.duration)

    const isPlayingRef = useRef(false);

    const playSound = async () => {
        if(!player || isPlayingRef.current){
            return Promise.resolve();
        }

        try{
            if(!status.isLoaded){
                //console.log("Soud is loading");
                return;
            }

            isPlayingRef.current = true;
            player.play();

            const duration = status.duration ?? 1000;

            await new Promise((resolve)=>{
                setTimeout(()=>{
                    isPlayingRef.current = false;
                    //console.log("Sound ended");
                    player.seekTo(0);
                    resolve();
                },duration);
            });
        }catch(err){
            console.error("Error while playing sound", err);
            isPlayingRef.current = false;
        }
    };

   return playSound;
}