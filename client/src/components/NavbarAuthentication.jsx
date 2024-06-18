import React, { useEffect } from 'react';

import { useStateContext } from '../contexts/ContextProvider';
import { useNavigate } from 'react-router-dom';

const NavButton = ({ title, customFunc, icon, color, dotColor }) => (
    <button
      type="button"
      onClick={() => customFunc()}
      style={{ color }}
      className="relative text-xl rounded-full p-3 hover:bg-light-gray"
    >
        {title}
    </button>
);

const Navbar = () => {

  const { currentColor, setScreenSize } = useStateContext();
  const navigate = useNavigate();
  const goToLogin = () => {
    navigate('/login');
  }

  // const goToRegister = () => {
  //   navigate('/register');
  // }
  
  useEffect(() => {
    const handleResize = () => setScreenSize(window.innerWidth);

    window.addEventListener('resize', handleResize);

    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex justify-between p-2 md:ml-6 md:mr-6 relative">
      <div className="flex">
        <img src='https://digiclicks.ky/wp-content/uploads/2021/12/DigiClicksLogoBlack.png' alt="DigiClicks Logo"/>
        <NavButton title="Login" customFunc={() => goToLogin()} color={currentColor} />
        {/* <NavButton title="Register" customFunc={() => goToRegister()} color={currentColor} /> */}
      </div>
    </div>
  );
};

export default Navbar;
