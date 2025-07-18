
import { Image, View } from 'react-native';
import BGImage from './img/background.png'

export default function Background () {
    return(
        <View 
            style={{
                position:'absolute',
                zIndex:-1,
                height:'100%',
                width:'100%',
                backgroundColor:'blue',
                
            }}
            > 
            <Image 
                style={{
                    height:'100%',
                    width:'100%',
                    zIndex:-2
                }}
                source={BGImage}
                resizeMode='stretch'
            />
            
        </View>
    );
};
