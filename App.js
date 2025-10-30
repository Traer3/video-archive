import {Text, View } from 'react-native';
import styles from './src/styles/BaseStyle'
import Background from './src/styles/Background';
import CustomButton from './src/components/CustomButton';
import SidePanel from './src/components/SidePanel';
import SwipeArea from './src/components/YTcomps/SwipeArea';
import { useState } from 'react';
import Menu from './src/components/menuComps/Menu';
export default function App() {

  const [showYT, setShowYT] = useState(false);
  const [showTT, setShowTT] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  return (
    <View style={{flex:1,}}>
      
      <Background/>
     
      <View style={styles.baseTheme}>
        <SidePanel>
            
            <CustomButton iconsName="TTLogo" buttonSetState={setShowTT} buttonState={showTT}/>
            <CustomButton iconsName="MenuIcon" buttonSetState={setShowMenu} buttonState={showMenu}/>
            <CustomButton iconsName="YTLogo" buttonSetState={setShowYT} buttonState={showYT}/>
        </SidePanel>

        <>
          {showYT && <SwipeArea areaState={setShowYT}/>}
          {showMenu && <Menu areaState={setShowMenu}/>}
        </>
        
        
      </View>
      
      
    </View>
  );
}



