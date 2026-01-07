import {Text, View } from 'react-native';
import styles from './src/styles/BaseStyle'
import Background from './src/styles/Background';
import CustomButton from './src/components/CustomButton';
import SidePanel from './src/components/SidePanel';
import SwipeArea from './src/components/YTcomps/SwipeArea';
import { useEffect, useState } from 'react';
import Menu from './src/components/menuComps/Menu';
import MainTT from './src/components/TTComps/MainTT';
import useSoundEffect from './src/components/YTcomps/useSoundEffect';
import { Audio } from 'expo-av';


export default function App() {

  useEffect(()=>{
    const confAudion = async () => {
      try{
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS:true,
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
          interruptionModeAndroid: 1,
          interruptionModeIOS: 1,
          shouldDuckAndroid: true,
        })
        console.log("Audio configuration successful")
      }catch(err){
        console.error("Error while configuration audio ")
      }
    };

    confAudion();
  },[])

  const [showYT, setShowYT] = useState(false);
  const [showTT, setShowTT] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const playSound = useSoundEffect();


  return (
    <View style={{flex:1,}}>
      
      <Background/>
     
      <View style={styles.baseTheme}>
        <>
          {showYT && <SwipeArea areaState={setShowYT}/>}
        </>
        <>
          {showMenu && <Menu areaState={setShowMenu}/>}
        </>
        <>
          {showTT && <MainTT/>}
        </>
        <SidePanel>
            
            <CustomButton iconsName="TTLogo" buttonSetState={setShowTT} buttonState={showTT}/>
            <CustomButton iconsName="MenuIcon" buttonSetState={setShowMenu} buttonState={showMenu}/>
            <CustomButton iconsName="YTLogo" buttonSetState={setShowYT} buttonState={showYT} executeFunction={playSound}/>
        </SidePanel>

        
        
        
      </View>
      
      
    </View>
  );
}



