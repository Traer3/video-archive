
import { Image} from 'react-native';
import { BlurView } from 'expo-blur';
import BGImage from './img/background.png'

export default function Background () {
    return(
            <BlurView
                intensity={90}
                tint="dark"
                style={{
                    width:'100%',
                    height:'100%',
                }}
            >
                <Image 
                    style={{
                        position:'absolute',
                        height:'100%',
                        width:'100%',
                        zIndex:-1
                    }}
                    source={BGImage}
                    resizeMode='stretch'
                />
            </BlurView>
    );
};
