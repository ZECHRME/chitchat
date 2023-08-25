import React from 'react'
import { Button, Container,Form } from 'react-bootstrap'


export default function Home() {
  return (
    <>
        <Container>
            <h1 style={{fontSize:'100px'}} className=" text-center mt-5">Welcome to ChitChat</h1>
            <br />
            <div className='d-flex justify-content-evenly'>
                
                <Button className=' custom-btn-2  ' href="/register">
                    Register <br />
                   
                    <Form.Text className="newtext-muted2">
                            If you are new here, please register first.
                         </Form.Text>   
                    
                </Button>

                <Button className='custom-btn-2 ' href="/login">
                    Login
                    <br />
                   
                    <Form.Text className="newtext-muted2">
                            If you are already registered, please login.
                         </Form.Text> 
                </Button>
            </div>
        </Container>
    </>
  )
}
