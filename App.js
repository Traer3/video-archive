import {View } from 'react-native';
import styles from './src/styles/BaseStyle'
import Background from './src/styles/Background';
import TestArea from './src/TestArea'
import CustomButton from './src/components/CustomButton';
import SidePanel from './src/components/SidePanel';
import SwipeComponent from './src/components/SwipeComponent';
export default function App() {

   //<TestArea/>
  return (
    <View 
        style={styles.baseTheme}
        >
        <Background/>
        
       

        <View style={{position:'absolute'}}>
        <SwipeComponent/>
        </View>
    </View>
  );
}



