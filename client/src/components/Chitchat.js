import React, { useState,useEffect } from 'react'
import { Button, ListGroup, Card, Row, Col, Form } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { useAuthDispatch } from '../context/auth'
import { gql, useQuery, useLazyQuery, useApolloClient,useMutation } from '@apollo/client'
import './Chitchat.css'
import Chat from './Chat'



const SEND_MESSAGE = gql`
  mutation sendMessage($to: String! $content: String!){
    sendMessage(to: $to content: $content){
      uuid from to content createdAt
    }
  }
`
const GET_USERS = gql`
  query getUsers{
    getUsers{
      username email createdAt
      latestMessage{
        uuid from to content createdAt
      }
    }
  }
`
const GET_MESSAGES = gql`
  query getMessages($from: String!){
    getMessages(from: $from){
      uuid from content to createdAt
    }
  }
`

export default function Chitchat() {

  const [userChat, setUserChat] = useState(null)  
  const client = useApolloClient()
  const dispatch = useAuthDispatch()
  const navigate = useNavigate()
  const [getMessages, { loading: messagesLoading, data: messagesData }] = useLazyQuery(GET_MESSAGES)

  useEffect(() => {
    if (userChat) {
      getMessages({ variables: { from: userChat } })
    }
  }, [userChat])

  

  const logout = () => {
    dispatch({
      type: 'LOGOUT'
    });
    client.clearStore()
    navigate('/login')
  }

  const { data, loading, error } = useQuery(GET_USERS, {
    onError: err => console.log(err)
  })
  
  const [sendMessage] = useMutation(SEND_MESSAGE, {
    onError: err => console.log(err),
    // Refetch the messages after sending a message
    refetchQueries: [
      {
        query: GET_MESSAGES,
        variables: { from: userChat },
      },
    ],
  });

  const [content, setContent] = useState('')
  const submitMsg = async e => {
    e.preventDefault();
    if (content.trim() === '' || !userChat) return;
    setContent('');
    
    // Send the message
    await sendMessage({ variables: { to: userChat, content: content } });
    
    // Update the messagesData with the new message
    if (messagesData) {
      const newMessage = {
      
        from: client.cache.data.data.ROOT_QUERY.getViewer,
        to: userChat,
        content,
        createdAt: new Date().toISOString(),
      };
      
      // Update messagesData with the new message
      client.cache.modify({
        id: client.cache.identify(messagesData.getMessages),
        fields: {
          getMessages(existingMessages = []) {
            const newMessages = [...existingMessages, newMessage];
            return newMessages;
          },
        },
      });
    }
  };


  let usersMarkup
  if (!data) usersMarkup = <h4 color='white'>loading...</h4>
  else if (data.getUsers.length === 0) usersMarkup = <h4 color='white'>Get some frnds</h4>
  else if (data.getUsers.length > 0) {
    usersMarkup = data.getUsers.map((user) => (
      
      <span className='float-left bg-white' 
      key={user.username}
      onClick={()=>setUserChat(user.username)} 
      >
          <ListGroup.Item style={{ fontSize: 20 }} className='custom-li' variant='dark'>
            {user.username}
            <br />
            <div style={{ fontSize: 10 }}>{user.latestMessage ? user.latestMessage.content : ""}</div>
          </ListGroup.Item>
      </span>
      
  ))
  }

  let messagesMarkup
  if (!messagesData) {
    messagesMarkup = <p>Select a friend</p>
  } else if (messagesData.getMessages.length > 0) {
    messagesMarkup = messagesData.getMessages.map(message => (
      <Chat key={message.uuid} message={message}>
        {message.content}
      </Chat>
    ))
  } else if (messagesData.getMessages.length === 0) {
    messagesMarkup = <p>No chats with this friend</p>}


  return (
    <>
      <Card className='carddd'>
        <Row className='m-3'>
          <Col>
            <Card.Title  xs={4}>Users</Card.Title>
          </Col>
          <Col xs={8} className='float-left'>
            <Card.Title>Messages</Card.Title>
            
          </Col>
        </Row>
        <Row>
          <Col variant='dark' xs={4}>
            <ListGroup className='custom-chat' variant='dark'>
              {usersMarkup}
            </ListGroup>
          </Col>
          <Col xs={8}>
          <span>
            {messagesMarkup ? (
              <ListGroup className="d-flex flex-column-reverse custom-chat">
                {messagesMarkup}
              </ListGroup>
            ) : (
              <p>messages</p>
            )}
          </span>
          <Form onSubmit={submitMsg}>
            <Form.Group className='d-flex  m-2'>
            <Form.Control className='rounded-pill' 
              type='text' 
              placeholder='Type a message' 
              value={content}
              style={{width: '90%' , height: '50px'}}
              onChange={e => setContent(e.target.value)}
            />
            <Button variant='primary' type='submit' className='rounded-pill custom-btn m-2'>Send</Button>
            </Form.Group>
          </Form> 
          </Col>
        </Row>
      </Card>

      <Button variant='primary' className='custom-btn' onClick={logout}>LOGOUT</Button>

    </>
  ) 
}

