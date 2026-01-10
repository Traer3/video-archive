import { Image, Pressable ,Text } from "react-native"
import YouTubeLogo from "../../assets/YTLogo.png"
import TikTokLogo from "../../assets/TTLogo.png"
import menuIcon from "../../assets/menuIcon.png"

const icons = {
    YTLogo : YouTubeLogo,
    TTLogo : TikTokLogo,
    MenuIcon : menuIcon,
}

export default function CustomButton({buttonName,buttonSetState, buttonState,iconsName}){
    //rgb(73,106,154) цвет кнокпи 
    // rgb(43,75,123) цвет рамки 
    // rgb(178,191,217) цвет текста 
    const specialFunction = async () =>{
        buttonSetState(!buttonState)
    }
    return(
        <Pressable
            onPress={()=>{
               specialFunction()
            }}
            style={{
                borderRadius:2,
                //borderWidth:1,
                //borderColor:'rgb(43,75,123)',
                backgroundColor:'rgb(73,106,154)',
                
                
                //overflow:'hidden'
            }}
        >
            {iconsName && 
            <Image 
                source={icons[iconsName]}
                style={{width:40, height:40}}
                resizeMode="contain"
            />}
        </Pressable>
    )
}