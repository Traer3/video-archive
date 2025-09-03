import {Text, View } from 'react-native';
import styles from './src/styles/BaseStyle'
import Background from './src/styles/Background';
import CustomButton from './src/components/CustomButton';
import SidePanel from './src/components/SidePanel';
import SwipeArea from './src/components/YTcomps/SwipeArea';
import { useState } from 'react';
export default function App() {

  const [showYT, setShowYT] = useState(false);

  return (
    <View style={{flex:1,}}>
      
      <Background/>
     
      <View style={styles.baseTheme}>
        <SidePanel>
            <CustomButton buttonName={"YouTube"} buttonSetState={setShowYT} buttonState={showYT}/>
        </SidePanel>

        <>
          {showYT && <SwipeArea areaState={setShowYT}/>}
        </>
        
        
      </View>
      
      
    </View>
  );
}



