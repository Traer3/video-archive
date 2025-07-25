import {Text, View } from 'react-native';
import styles from './src/styles/BaseStyle'
import Background from './src/styles/Background';
import CustomButton from './src/components/CustomButton';
import SidePanel from './src/components/SidePanel';
export default function App() {

   //<TestArea/>
  return (
    <View style={{flex:1,}}>
      
      <Background/>
     
      <View style={styles.baseTheme}>
        <SidePanel>
            <Text>HELP</Text>
            <CustomButton/>
        </SidePanel>
      </View>
      
      
    </View>
  );
}



