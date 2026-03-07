import { useEffect } from 'react'
import icon from "../../src/assets/logo/logo_tokladkrabang.png"

const Title = () => {
    useEffect(()=>{
        document.title = "Tokladkrabang"
        
        const link = document.createElement("link");
        link.rel = "icon";
        link.href = icon;
        document.head.appendChild(link);
    }, [])
return null;
}

export default Title