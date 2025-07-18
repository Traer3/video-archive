import {View } from 'react-native';
import styles from './src/styles/BaseStyle'
import Background from './src/styles/Background';
export default function App() {


/// <TestArea/>
  return (
    <View 
        style={styles.baseTheme}
        >
         
        <Background/>
    </View>
  );
}



