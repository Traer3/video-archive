import { useState } from 'react';
import { Button, Pressable, StyleSheet, Text, View } from 'react-native';

export default function App() {

  const [count , setCount] = useState(0);

  return (
    <View style={styles.container}>
      <View style={{
        position:'absolute',
        
      }}>
        <Text style={{color:'red'}}>Open up App.js to start working on your app!</Text>
        <Text style={{color:'red'}}>Open up App.js to start working on your app!</Text>
      </View>
      <Pressable
        style={styles.customButton}
        onPress={()=> setCount(count + 1)}
      >
        <Text style={styles.buttonText}>  +1 (Pressable)  {count}</Text>
      </Pressable>
      <Button 
        title=' +1 (Button)'
        onPress={()=> setCount(count + 1)}
      />
      <Text style={styles.counterText}>{count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterText:{
    fontSize:24,
    marginBottom: 20,
  },
  customButton:{
    backgroundColor:'#007AFF',
    padding:10,
    borderRadius:5,
    marginTop:10,
  },
  buttonText:{
    color:'white',
    fontSize:16,
    textAlign:'center',
  },
});
