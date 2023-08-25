import React from 'react'
import { useAuthState } from '../context/auth'
import './Chat.css'

export default function Chat({message}) {
  
    const { user } = useAuthState();
    const sent = message.from === user.username;

    return (
    <>
     <div >
     {!sent ?
        <div className="d-flex my-1">   
            <div key={message.uuid} className="rounded-pill custom-chat-others">
                {message.content}
            </div>
        </div>
            :
        <div className="d-flex my-1 justify-content-end">
            <div key={message.uuid} className="rounded-pill custom-chat-mine ">
                {message.content}
            </div>
        </div>
    }
    </div>
    </>  
  )
}
