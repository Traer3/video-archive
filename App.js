import { View } from 'react-native';
import styles from './src/styles/BaseStyle'
import Background from './src/styles/Background';
import CustomButton from './src/components/CustomButton';
import SidePanel from './src/components/SidePanel';
import SwipeArea from './src/components/YTcomps/SwipeArea';
import {useState} from 'react';
import Menu from './src/components/menuComps/Menu';
import MainTT from './src/components/TTComps/MainTT';
import SoundEffect from './src/components/YTcomps/SoundEffect';
import SwipeWindow from './src/components/SwipeWindow';
import InfoPanel from './src/components/menuComps/InfoPanel';
import FilteredVideos from './src/components/YTcomps/FilteredVideos';

export default function App() {
  const [showYT, setShowYT] = useState(false);
  const [showTT, setShowTT] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showFiltered, setShowFiltered] = useState(false)

  return (
    <View style={{flex:1}}>
      <Background/>
      <View style={styles.baseTheme}>
        <>{showMenu && <Menu areaState={setShowMenu}/>}</>
        <>{showInfo && <InfoPanel/>}</>
        <>{showTT && <MainTT/>}</>
        
        <>{showYT && (
          <>
            <SoundEffect/>
            <SwipeWindow setTriggerButton={setShowYT} >
              <SwipeArea />
            </SwipeWindow>
          </>
        )}</>
        <>{showFiltered && <FilteredVideos setShowFiltered={setShowFiltered}/>}</>

        <SidePanel>
            <CustomButton iconsName="TTLogo" buttonSetState={setShowTT} buttonState={showTT}/>
            <CustomButton iconsName="MenuIcon" buttonSetState={setShowMenu} buttonState={showMenu} onLongState={showInfo} setOnLongState={setShowInfo}/>
            <CustomButton iconsName="YTLogo" buttonSetState={setShowYT} buttonState={showYT} onLongState={showFiltered} setOnLongState={setShowFiltered}/>
            
        </SidePanel>
      </View>
      
      
    </View>
  );
}



