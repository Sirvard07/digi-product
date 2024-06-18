import React, { createContext, useContext, useState } from 'react';


const StateContext = createContext();

const getLocalStorageData = () => {
    localStorage.getItem("userName");
    localStorage.getItem("accessToken");
    localStorage.getItem("userEmail");
    localStorage.getItem("userID");
    localStorage.getItem("userRole");
    localStorage.getItem("userLastLogin");
    localStorage.getItem('themeMode');
    localStorage.getItem('colorMode');
    localStorage.getItem('loggedIn');
}


const initialState = {
  userProfile: false,
  notification: false,
  loggedIn: parseInt(localStorage.getItem('userLoggedIn')) || false,
  userRole: localStorage.getItem("userRole") || 0,
  userEmail: localStorage.getItem('userEmail') || "",
  userName: localStorage.getItem('userName') || "",
  userID: localStorage.getItem('userID') || "",
  themeMode: localStorage.getItem('themeMode') || 'Light',
  colorMode: localStorage.getItem('colorMode') || '#03C9D7',
  accessToken: localStorage.getItem('accessToken') || "",
  loadingIndicatorActive: false
};

export const ContextProvider = ({ children }) => {
  const [screenSize, setScreenSize] = useState(undefined);
  const [currentColor, setCurrentColor] = useState('#03C9D7');
  const [currentMode, setCurrentMode] = useState('Light');
  const [themeSettings, setThemeSettings] = useState(false);
  const [activeMenu, setActiveMenu] = useState(true);
  const [isClicked, setIsClicked] = useState(initialState);
  const [loadingIndicatorActive, setLoadingIndicatorActive] = useState(initialState);
  
  const [loggedIn, setLoggedIn] = useState(() => {
    // getting stored value
    const value = localStorage.getItem("userLoggedIn");
    return value || false;
  });
  
  const [auth, setAuth] = useState(() => {
    // getting stored value
    const value = localStorage.getItem("accessToken");
    return value || "";
  });

  const [userEmail, setUserEmail] = useState(() => {
    const value = localStorage.getItem('userEmail');
    return value || "";
  })

  const [userID, setUserID] = useState(() => {
    const value = localStorage.getItem('userID');
    return value || "";
  })
  const [userRole, setUserRole] = useState(() => {
    const value = localStorage.getItem('userRole');
    return value || 0;
  })

  const [userName, setUserName] = useState(() => {
    const value = localStorage.getItem('userName');
    return value || "";
  })

  const setMode = (e) => {
    setCurrentMode(e.target.value);
    localStorage.setItem('themeMode', e.target.value);
  };

  const setColor = (color) => {
    setCurrentColor(color);
    localStorage.setItem('colorMode', color);
  };

  const setLocalStorageDataLogin = (data) => {
    localStorage.setItem("userName", data.name);
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("userEmail", data.email);
    localStorage.setItem("userID", data.userId);
    localStorage.setItem("userLastLogin", data.lastLogin);
    localStorage.setItem("userRole", data.role);
    localStorage.setItem('userLoggedIn', true);    
  }
  const reactQuillAllModules = {
    toolbar: [
      [],
      [{ size: [] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [
        {
          color: [],
        },
      ],
      [
        { list: "ordered" },
        { list: "bullet" },
        { indent: "-1" },
        { indent: "+1" },
      ],
      ["link"],
      ["clean"],
    ],
    clipboard: {
      // toggle to add extra line breaks when pasting HTML:
      matchVisual: false,
    },
  };

  const reactQuillAllFormats = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "color",
  ];

  const signOutUser = () => {
    localStorage.removeItem("userName");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userID");
    localStorage.removeItem("userLastLogin");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userLoggedIn");

    setLoggedIn(false)
    setUserRole(0);
    setAuth("");
    setUserEmail("");
    setUserID("");
  }

  const handleClick = (clicked) => setIsClicked({ ...initialState, [clicked]: true });

  return (
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    <StateContext.Provider value={{ 
      currentColor, 
      currentMode, 
      activeMenu, 
      screenSize, 
      setScreenSize, 
      handleClick, 
      isClicked, 
      initialState, 
      setIsClicked, 
      setActiveMenu, 
      setCurrentColor, 
      setCurrentMode, 
      setMode, 
      setColor, 
      themeSettings, 
      setThemeSettings, 
      userRole, 
      setUserRole, 
      loggedIn, 
      setLoggedIn,
      auth,
      setAuth,
      setLocalStorageDataLogin,
      signOutUser,
      userEmail,
      setUserEmail,
      userID,
      setUserID,
      userName,
      setUserName,
      loadingIndicatorActive,
      setLoadingIndicatorActive,
      reactQuillAllFormats,
      reactQuillAllModules
    }}>
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);
