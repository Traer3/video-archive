import {View } from 'react-native';
import styles from './src/styles/BaseStyle'
import Background from './src/styles/Background';
import TestArea from './src/TestArea'
export default function App() {

  return (
    <View 
        style={styles.baseTheme}
        >
        <Background/>
        <TestArea>

        </TestArea>
    </View>
  );
}



