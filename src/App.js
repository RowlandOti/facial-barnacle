import './App.css';
import { messagingRef, storageRef } from './init-fcm'
import React, { useEffect, useState } from 'react'
import LoginPage from './pages/LoginPage'

function App() {
  const [clientToken, setClientToken] = useState(null)

  useEffect(() => {
    messagingRef.getToken({ vapidKey: 'BGF-8_Onz9vIgH5mj2HKmPWLUcX3cV9DiZEvhjO59UYxBsImQvS3ayKb3Go9gA0GhMpoU-zfPfj2GAhisKb3OIk' }).then((currentToken) => {
      if (currentToken) setClientToken(currentToken)
      else console.log('No registration token available. Request permission to generate one.')
    }).catch((err) => {
      console.log('An error occurred while retrieving token. ', err)
    })
  })

  return (
    <LoginPage clientToken={clientToken} />
  )
}

export default App;
