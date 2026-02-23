import { useEffect } from 'react'

const Title = () => {
    useEffect(()=>{
        document.title = "Tokladkrabang"
    }, [])
return null;
}

export default Title