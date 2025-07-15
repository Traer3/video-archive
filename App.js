import { View } from 'react-native';
import TestArea from './src/TestArea';
import styles from './src/styles/BaseStyle'
export default function App() {



  return (
    <View 
        style={styles.baseTheme}>
          <TestArea/>
    </View>
  );
}



