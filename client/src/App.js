import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { FiSettings } from 'react-icons/fi';
import { TooltipComponent } from '@syncfusion/ej2-react-popups';
import { Navbar, Footer, Sidebar, ThemeSettings } from './components';
import {
  Dashboard,
  Login, 
  // Register, 
  PreWarmUpEmailAccountNamesList,
  PreWarmUpCPanelAccounts,
  PreWarmUpEmailAccounts,
  PreWarmUpDomains,
  PreWarmUpDefaultSettings,
  WarmupWarmUpSchedule,
  WarmupDomains,
  WarmupReport,
  WarmupDefaultSettings,
  ProductionContacts,
  ProductionEmailCopy,
  ProductionGroups,

} from './pages';
import './App.css';
import { useStateContext } from './contexts/ContextProvider';


const App = () => {
  const { setCurrentColor, setCurrentMode, 
          currentMode, activeMenu, currentColor, 
          themeSettings, setThemeSettings, loggedIn
  } = useStateContext();

  useEffect(() => {
    const currentThemeColor = localStorage.getItem('colorMode');
    const currentThemeMode = localStorage.getItem('themeMode');

    if (currentThemeColor && currentThemeMode) {
      setCurrentColor(currentThemeColor);
      setCurrentMode(currentThemeMode);
    }
  }, []);

  const renderRoutes = () => (
    <Routes>
      {/* dashboard  */}
      {/* <Route path="/" element={(<Dashboard />)} /> */}
      <Route path="/dashboard" element={(<Dashboard />)} />

      {/* Emails */}
      <Route path="/pre-warm-up-email-account-names-list" element={<PreWarmUpEmailAccountNamesList />} />
      <Route path="/pre-warm-up-c-panel-accounts" element={<PreWarmUpCPanelAccounts />} />
      <Route path="/pre-warm-up-email-accounts" element={<PreWarmUpEmailAccounts />} />
      <Route path="/pre-warm-up-domains" element={<PreWarmUpDomains />} />
      <Route path="/pre-warm-up-default-settings" element={<PreWarmUpDefaultSettings />} />
      <Route path="/warmup-warm-up-schedule" element={<WarmupWarmUpSchedule />} />
      <Route path="/warmup-domains" element={<WarmupDomains />} />
      <Route path="/warmup-reports" element={<WarmupReport />} />
      <Route path="/warmup-default-settings" element={<WarmupDefaultSettings />} />
      <Route path="/production-contacts" element={<ProductionContacts />} />
      <Route path="/production-email-copy" element={<ProductionEmailCopy />} />
      <Route path="/production-groups" element={<ProductionGroups />} />
    






      {/* <Route path="/emails/new-email" element={<NewEmail />} /> */}
      {/* <Route path="/emails/:emailID" element={<EmailDetails />} /> */}

      {/* Phones */}
      {/* <Route path="/phones" element={<Phones />} /> */}
      {/* <Route path="/phones/new-phone" element={<NewPhone />} /> */}
      {/* <Route path="/phones/:phoneID" element={<PhoneDetails />} /> */}

      {/* Offers */}
      {/* <Route path="/offers" element={<Offers />} /> */}
      {/* <Route path="/offers/new-offer" element={<NewOffer />} /> */}
      {/* <Route path="/offers/:offerID" element={<OfferDetails />} /> */}

      {/* authentication */}
      <Route path="/login" element={<Login />} />
      {/* <Route path="/register" element={<Register />} /> */}

      <Route path="*" element={<Navigate replace to="/dashboard" />} />
      
    </Routes>
  );

  return (
    <div className={currentMode === 'Dark' ? 'dark' : ''}>
      <BrowserRouter>
        <div className="flex relative dark:bg-main-dark-bg">
          {/* <div className="fixed right-4 bottom-4" style={{ zIndex: '1000' }}>
            <TooltipComponent
              content="Settings"
              position="Top"
            >
              <button
                type="button"
                onClick={() => setThemeSettings(true)}
                style={{ background: currentColor, borderRadius: '50%' }}
                className="text-3xl text-white p-3 hover:drop-shadow-xl hover:bg-light-gray"
              >
                <FiSettings />
              </button>

            </TooltipComponent>
          </div> */}
          { loggedIn && <>
            <div>
            {activeMenu ? (
              <div className="w-72 fixed sidebar dark:bg-secondary-dark-bg bg-white ">
                <Sidebar />
              </div>
            ) : (
              <div className="w-0 dark:bg-secondary-dark-bg">
                <Sidebar />
              </div>
            )}
            </div>
          </>}
          
          <div
            className={
              activeMenu
                ? 'dark:bg-main-dark-bg  bg-main-bg min-h-screen w-full ' + (!loggedIn ? '' : 'md:ml-72')
                : 'bg-main-bg dark:bg-main-dark-bg  w-full min-h-screen flex-2 '
            }
          >
            { loggedIn && <>
              <div className="fixed md:static bg-main-bg dark:bg-main-dark-bg navbar w-full ">
                <Navbar />
              </div>
            </>}
            <div style={{minHeight: "calc(100vh - 252px)"}}>
              {/* {themeSettings && (<ThemeSettings />)} */}
              
              {renderRoutes()}
            </div>
            <Footer />
          </div>
        </div>
      </BrowserRouter>
    </div>
  );
};

export default App;
