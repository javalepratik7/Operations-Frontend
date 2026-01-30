import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import MainTable from './Components/MainTable'

function App() {
  const [count, setCount] = useState(0)

  return (
   <>
   <MainTable/>
   </>
  )
}

export default App
