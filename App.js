import {View } from 'react-native';
import styles from './src/styles/BaseStyle'
import Background from './src/styles/Background';
import TestArea from './src/TestArea'
import CustomButton from './src/components/CustomButton';
import SidePanel from './src/components/SidePanel';
export default function App() {

   //<TestArea/>
  return (
    <View 
        style={styles.baseTheme}
        >
        <Background/>
        <SidePanel>
          <CustomButton/>
        </SidePanel>
    </View>
  );
}



