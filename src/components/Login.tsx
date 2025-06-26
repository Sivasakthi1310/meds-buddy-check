import { supabase } from '@/lib/supabase';
import React, { useState } from 'react';
function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const handleLogin= async () => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error)
            setMessage(error.message)
        else
            setMessage('Login Successful')
    }
    return (
        <div>
            <h1>Login</h1>
            <input type='email' value={email} placeholder='Enter your email'
                onChange={(e) => setEmail(e.target.value)} />
            <input type='password' value={password} placeholder='Enter your password'
                onChange={(e) => setPassword(e.target.value)} />
            <button onClick={handleLogin}>Login</button>
            <p>{message}</p>
        </div>
    )
}

export default Login;
