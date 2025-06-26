import { supabase } from '@/lib/supabase';
import React, { useState } from 'react';
function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const handleSignup = async () => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
        });
        if (error)
            setMessage(error.message)
        else
            setMessage('Signup successful! Please verify your email')
    }
    return (
        <div>
            <h1>Signup</h1>
            <input type='email' value={email} placeholder='Enter your email'
                onChange={(e) => setEmail(e.target.value)} />
            <input type='password' value={password} placeholder='Enter your password'
                onChange={(e) => setPassword(e.target.value)} />
            <button onClick={handleSignup}>Sign Up</button>
            <p>{message}</p>
        </div>
    )
}

export default Signup;
