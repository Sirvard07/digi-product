import React, { useEffect, useState } from 'react'

import axios from '../../api/axios';

import { Header } from '../../components';

import { useNavigate } from 'react-router-dom';

import { useStateContext } from '../../contexts/ContextProvider';

import { NavbarAuthentication } from '../../components';

import { TextBoxComponent } from '@syncfusion/ej2-react-inputs';


const Login = () => {
    const { setLocalStorageDataLogin, loggedIn, setLoggedIn, activeMenu, currentColor, setAuth, setUserName, setUserID, setUserEmail, setUserRole } = useStateContext();
    const [ email, setEmail ] = useState("");
    const [ password, setPassword ] = useState("");

    const navigate = useNavigate();

    const handleLogin = async () => {

        try {
            const loginResponse = await axios.post('/api/v1/authentication/login',
                { email, password },
                { headers: { 
                    'Content-Type': 'application/json' 
                } 
            });

            console.log(loginResponse.data)
            const accessToken = loginResponse.data.user.accessToken;
            setAuth(accessToken);
            setLoggedIn(true);
            setUserName(loginResponse.data.user.name);
            setUserID(loginResponse.data.user.userId);
            setUserEmail(loginResponse.data.user.email);
            setUserRole(loginResponse.data.user.role)
            setLocalStorageDataLogin(loginResponse.data.user);
            navigate("/dashboard");
        } catch(err){
            if (!err?.response){
                
            } else if (err.response?.status === 400){

            } else if (err.response?.status === 401){

            } else if (err.response?.status === 500){

            } else {

            }
        }
    }

    useEffect(() => {
        if (loggedIn){
            navigate('/dashboard');
        }
    }, [loggedIn, navigate]);

  return (
    <div className="flex relative dark:bg-main-dark-bg">
    <div className={
        activeMenu
            ? 'dark:bg-main-dark-bg  bg-main-bg min-h-screen w-full  '
            : 'bg-main-bg dark:bg-main-dark-bg  w-full min-h-screen flex-2 '
        }
    >
        <div className="fixed md:static bg-main-bg dark:bg-main-dark-bg navbar w-full ">
        <NavbarAuthentication />
        </div>
        <div className="m-2 p-2 md:p-10 bg-white rounded-3xl dark:text-gray-200 dark:bg-secondary-dark-bg">
            <Header category="Authentication" title="Log in!" />

            <div className='flex items-center justify-center'>
                <div className="w-2/3 md:w-1/3">
                    <div className="mb-5">
                        <TextBoxComponent value={email} input={e => {setEmail(e.value)}} type="email" placeholder="Email" cssClass="e-outline" floatLabelType="Auto" />
                    </div>
                    <div className="mb-5">
                        <TextBoxComponent value={password} input={e => {setPassword(e.value)}} type="password" placeholder="Password" cssClass="e-outline" floatLabelType="Auto" />
                    </div>
                    <div className='flex justify-center'>
                    <button
                        type="button"
                        onClick={() => handleLogin()}
                        style={{ backgroundColor: currentColor, borderRadius: "10px" }}
                        className="text-2xl text-white hover:drop-shadow-xl p-3 hover:bg-gray"
                        >
                        Log in!
                    </button>
                    </div>
                </div>
            </div>
        </div>
    </div>     
    </div>
    
  )
}

export default Login