import {Text, View } from 'react-native';
import styles from './src/styles/BaseStyle'
import Background from './src/styles/Background';
import TestArea from './src/TestArea'
import CustomButton from './src/components/CustomButton';
import SidePanel from './src/components/SidePanel';
import SwipeComponent from './src/components/SwipeComponent';
export default function App() {

   //<TestArea/>
  return (
    <View style={{flex:1,}}>
      
      
      <View style={styles.baseTheme}>
        <SidePanel>
            <Text>HELP</Text>
          </SidePanel>
      </View>
      
    </View>
  );
}



