import React, { useState } from 'react'
import { Container, Button, Form } from 'react-bootstrap'
import './Register.css'
import { gql, useMutation } from '@apollo/client';
import { useNavigate,Link } from 'react-router-dom'

const REGISTER_USER = gql`
  mutation register($username:String! $email:String! $password:String! $confirmPassword:String!) {
    register(username:$username email:$email password:$password confirmPassword:$confirmPassword) {
      username 
      email 
      createdAt
    }
  }
`;

export default function Register() {

    const navigate = useNavigate()
    const [errors, setErrors] = useState({})


    const [registerUser, { loading }] = useMutation(REGISTER_USER, {
        update: (_, res) => {
            console.log(res)
            navigate('/login')
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

    const [variables, setvariables] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    })


    const submitReg = (e) => {
        e.preventDefault()
        registerUser({
            variables: {
                username: variables.username,
                email: variables.email,
                password: variables.password,
                confirmPassword: variables.confirmPassword,
            }
        })
    }


    return (
        <>
            <Container>
                <h1>Register</h1>
            </Container>


            <Container>
                <Form onSubmit={submitReg}>
                    <Form.Group className="mb-3">
                        <Form.Label className={errors.username ? 'text-danger' : 'text-success'}>
                            {errors.username ?? 'Username'}
                        </Form.Label>
                        <Form.Control type="text"
                            placeholder="Enter username"
                            value={variables.username}
                            onChange={e => setvariables({ ...variables, username: e.target.value })}
                            className={errors.username ? 'is-invalid' : ''}
                        />
                        <Form.Text className="newtext-muted">
                            This must be unique and not empty
                        </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label className={errors.email ? 'text-danger' : 'text-success'}>
                            {errors.email ?? 'Email'}
                        </Form.Label>
                        <Form.Control type="email"
                            placeholder="Enter email"
                            value={variables.email}
                            onChange={e => setvariables({ ...variables, email: e.target.value })}
                            className={errors.email ? 'is-invalid' : ''}
                        />
                        <Form.Text className="newtext-muted">
                            This must be unique and not empty
                        </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="Password">
                        <Form.Label className={errors.password ? 'text-danger' : 'text-success'}>
                            {errors.password ?? 'Password'}
                        </Form.Label>
                        <Form.Control type="password"
                            placeholder="Password"
                            value={variables.password}
                            onChange={e => setvariables({ ...variables, password: e.target.value })}
                            className={errors.password ? 'is-invalid' : ''}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="confirmPassword">
                        <Form.Label className={errors.confirmPassword ? 'text-danger' : 'text-success'}>
                            {errors.confirmPassword ?? 'Confirm Password'}
                        </Form.Label>
                        <Form.Control type="password"
                            placeholder="Confirm Password"
                            value={variables.confirmPassword}
                            onChange={e => setvariables({ ...variables, confirmPassword: e.target.value })}
                            className={errors.confirmPassword ? 'is-invalid' : ''}
                        />
                    </Form.Group>

                    <Button className='custom-btn' type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Loading' : 'Register'}
                    </Button>
                    <h6>Already registered? <Link to='/login'>Login</Link></h6>
                </Form>
            </Container>
        </>
    )
}
