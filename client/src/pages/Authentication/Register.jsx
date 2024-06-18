import React, { useEffect, useState } from 'react'

import axios from 'axios';

import { Header } from '../../components';

import { useNavigate } from 'react-router-dom';

import { useStateContext } from '../../contexts/ContextProvider';

import { NavbarAuthentication } from '../../components';

import { TextBoxComponent } from '@syncfusion/ej2-react-inputs';

const Register = () => {
    const { loggedIn, activeMenu, currentColor} = useStateContext();
    const [ name, setName ] = useState("");
    const [ email, setEmail ] = useState("");
    const [ password, setPassword ] = useState("");


    const navigate = useNavigate();

    const handleRegister = async () => {
        const registerResponse = await axios.post('/api/v1/authentication/register',
            { name, email, password },
            { headers: { 'Content-Type': 'application/json' } }
        )
        
        console.log(registerResponse.data)
        navigate("/login");
        
    }

    useEffect(() => {
        if (loggedIn){
            navigate('/');
        }
    }, []);

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
      <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
          <Header category="Authentication" title="Register!" />

          <div className='flex items-center justify-center'>
                <div className="w-1/3">
                    <div className="mb-5">
                        <TextBoxComponent value={name} input={e => {setName(e.value)}} type="text" placeholder="Name" cssClass="e-outline" floatLabelType="Auto" />
                    </div>
                    <div className="mb-5">
                        <TextBoxComponent value={email} input={e => {setEmail(e.value)}} type="email" placeholder="Email" cssClass="e-outline" floatLabelType="Auto" />
                    </div>
                    <div className="mb-5">
                        <TextBoxComponent value={password} input={e => {setPassword(e.value)}} type="password" placeholder="Password" cssClass="e-outline" floatLabelType="Auto" />
                    </div>
                    <div className='flex justify-center'>
                    <button
                        type="button"
                        onClick={() => handleRegister()}
                        style={{ backgroundColor: currentColor, borderRadius: "10px" }}
                        className="text-2xl text-white hover:drop-shadow-xl p-3 hover:bg-gray"
                        >
                        Register!
                    </button>
                    </div>
                </div>
            </div>
      </div>
  </div>     
  </div>
  
)
}

export default Register