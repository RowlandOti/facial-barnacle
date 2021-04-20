import './App.css';
import { messagingRef, storageRef } from './init-fcm'
import React, { useEffect, useState } from 'react'
import { ToastProvider } from 'react-toast-notifications'
import LoginPage from './pages/LoginPage'

function App() {
  const [clientToken, setClientToken] = useState(null)

  useEffect(() => {
    messagingRef.getToken({ vapidKey: 'BFSXKmI-qHU0VFkWKUYScibUGyfeeYzEQX28pt-ZZ-yMZYtWgdoSyxpx5XO07mGJBOqZVHL2rp4sLsxavO9v8P8' }).then((currentToken) => {
      if (currentToken) setClientToken(currentToken)
      else console.log('No registration token available. Request permission to generate one.')
    }).catch((err) => {
      console.log('An error occurred while retrieving token. ', err)
    })
  })

  return (
      <ToastProvider><LoginPage clientToken={clientToken} /></ToastProvider>
  )
}

export default App;
