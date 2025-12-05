import { useEffect, useState } from 'react'

import './App.css'
import axios from 'axios';
import Headers from './components/Headers';

function App() {
  const [user, setUser] = useState([])
  // const [count, setCount] = useState()

  const fetchData = async() => {
    const res = await axios.get('http://localhost:8000/users')
    setUser(res.data)
  }

  useEffect(()=>{
    fetchData()
  }, [])

  return (
    <>
    <Headers/>
      {
        user.map((item, index)=> {
          return <div key={index}>
          {item.email}</div>
        })
      }
    </>
  )
}

export default App
