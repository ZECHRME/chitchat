import React, { useState } from 'react'
import { Container, Button, Form } from 'react-bootstrap'
import { useNavigate,Link } from 'react-router-dom'
import { useAuthDispatch } from '../context/auth'
import { gql, useLazyQuery } from '@apollo/client';

const LOGIN_USER = gql`
  query login($username:String! $password:String!) {
    login(username:$username password:$password) {
      username 
      email 
      createdAt
      token
    }
  }
`;

export default function Login() {


    const navigate = useNavigate()
    const [errors,setErrors]=useState({})

    const dispatch = useAuthDispatch()


    const [loginUser, { loading }] = useLazyQuery(LOGIN_USER, {
        onCompleted(data){
            dispatch({
                type: 'LOGIN',
                payload: data.login
            })
            console.log(data)
            navigate('/chitchat')
        },
        onError: (err) => {
            if (err.graphQLErrors[0]) {
                console.log(err.graphQLErrors[0].extensions.errors)
                setErrors(err.graphQLErrors[0].extensions.errors)
            }
            else{
            
            }  
        }
        
    });


    const [varia, setVaria] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    })


    const submitLogin = (e) => {
        e.preventDefault()
        loginUser({
            variables: {
            
                username: varia.username,
                password: varia.password,
                
            }
        })
    }


    return (
        <>
            <Container>
                <h1>LOGIN</h1>
            </Container>


            <Container>
                <Form onSubmit={submitLogin}>
                    <Form.Group className="mb-3" controlId="username">
                        <Form.Label className={errors.username ? 'text-danger': 'text-success'}>
                            {errors.username ?? 'Username'}
                        </Form.Label>
                        <Form.Control type="text"
                            placeholder="Enter username"
                            value={varia.username}
                            onChange={e => setVaria({ ...varia, username: e.target.value })}
                            className={errors.username && 'is-invalid'}
                        />
                        <Form.Text className="newtext-muted">
                            This must be unique and not empty
                        </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="Password">
                        <Form.Label className={errors.password ? 'text-danger': 'text-success'}>
                            {errors.password ?? 'Password'}
                        </Form.Label>
                        <Form.Control type="password"
                            placeholder="Password"
                            value={varia.password}
                            onChange={e => setVaria({ ...varia, password: e.target.value })}
                            className={errors.password && 'is-invalid'}
                        />
                    </Form.Group>

                    <Button className='custom-btn' type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Loading' : 'Login'}
                    </Button>
                    <h6>Not registered? <Link to='/register'>Register</Link></h6>
                </Form>
            </Container>
        </>
    )
}

