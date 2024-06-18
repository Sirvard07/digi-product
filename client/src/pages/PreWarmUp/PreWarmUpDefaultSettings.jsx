import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStateContext } from '../../contexts/ContextProvider';
import Pagination from '@mui/material/Pagination';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import { Header, SearchBar, CustomLoadingIndicator, CustomModal, CustomTooltipComponent, SubHeader } from '../../components';
import { MdAdd, MdCancel, MdEdit, MdList, MdRemove, MdSave } from 'react-icons/md';
import { AiFillDelete, AiFillEdit } from 'react-icons/ai';

import useAxiosPrivate from '../../hooks/useAxiosPrivate';

import { formatDate, themeColorsUsable } from '../../data/buildData';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
const PreWarmUpDefaultSettings = () => {

    // Default
    const { currentColor, loggedIn, loadingIndicatorActive, setLoadingIndicatorActive } = useStateContext();
    const axiosPrivate = useAxiosPrivate();
    const navigate = useNavigate();

    // Main Data
    const [initialNamecheapUsername, setInitialNamecheapUsername] = useState("");
    const [initialNamecheapApiKey, setInitialNamecheapApiKey] = useState("");
    const [initialInstantlyApiKey, setInitialInstantlyApiKey] = useState("");
    const [initialNumberOfEmailAccountsPerDomain, setInitialNumberOfEmailAccountsPerDomain] = useState(0);
    const [initialDefaultEmailAccountPassword, setInitialDefaultEmailAccountPassword] = useState("");
    const [initialMTAIpAddress, setInitialMTAIpAddress] = useState("");


    const [numberOfEmailAccountsPerDomain, setNumberOfEmailAccountsPerDomain] = useState(0);
    const [numberOfEmailAccountsPerDomainError, setNumberOfEmailAccountsPerDomainError] = useState("");
    const [defaultEmailAccountPassword, setDefaultEmailAccountPassword] = useState("");
    const [defaultEmailAccountPasswordError, setDefaultEmailAccountPasswordError] = useState("");
    const [namecheapUsername, setNamecheapUsername] = useState("");
    const [namecheapUsernameError, setNamecheapUsernameError] = useState("");
    const [namecheapApiKey, setNamecheapApiKey] = useState("");
    const [namecheapApiKeyError, setNamecheapApiKeyError] = useState("");
    const [instantlyApiKey, setInstantlyApiKey] = useState("");
    const [instantlyApiKeyError, setInstantlyApiKeyError] = useState("");
    const [MTAIpAddress, setMTAIpAddress] = useState("");
    const [MTAIpAddressError, setMTAIpAddressError] = useState("");

    const [showApiKey, setShowApiKey] = useState({
        namecheapApiKey: false,
        instantlyApiKey: false,
        defaultEmailAccountPassword: false
        // Add other password fields as needed
    });
    const handleClickShowApiKey = (field) => {
        setShowApiKey({ ...showApiKey, [field]: !showApiKey[field] });
    };

    const [isEditMode, setIsEditMode] = useState(false);

    // Function to toggle edit mode
    const toggleEditMode = () => {
        setIsEditMode(!isEditMode);
    };

    // Handle Cancel Changes
    const handleCancelChanges = () => {
        setNamecheapUsername(initialNamecheapUsername);
        setNamecheapApiKey(initialNamecheapApiKey);
        setInstantlyApiKey(initialInstantlyApiKey);
        setNumberOfEmailAccountsPerDomain(initialNumberOfEmailAccountsPerDomain);
        setDefaultEmailAccountPassword(initialDefaultEmailAccountPassword);
        setMTAIpAddress(initialMTAIpAddress);
        // Turn off edit mode
        setIsEditMode(false);
    };

    // START Edit Item
    const [openEditDefaultSettingsModal, setOpenEditDefaultSettingsModal] = useState(false);

    const handleOpenEditDefaultSettingsModal = () => {
        if (!isValidEditDefaultSettings()) {

            setLoadingIndicatorActive(false);
            // show error message for first name field
            return;
        }
        setOpenEditDefaultSettingsModal(true);
    }

    const handleCloseEditDefaultSettingsModal = () => {
        setOpenEditDefaultSettingsModal(false);
        handleCancelChanges();
    }

    const isValidEditDefaultSettings = () => {
        var isValid = true;

        // Trim to remove any leading/trailing whitespace
        if (namecheapUsername.trim().length === 0) {
            setNamecheapUsernameError("Namecheap Username is required.");
            isValid = false;
        }
        if (namecheapApiKey.trim().length === 0) {
            setNamecheapApiKeyError("Namecheap API Key is required.");
            isValid = false;
        }
        if (instantlyApiKey.trim().length === 0) {
            setInstantlyApiKeyError("Instantly API Key is required.");
            isValid = false;
        }
        if (defaultEmailAccountPassword.trim().length === 0) {
            setDefaultEmailAccountPasswordError("Default Email Account Password is required.");
            isValid = false;
        }
        if (MTAIpAddress.trim().length === 0) {
            setMTAIpAddressError("MTA IP Address is required.");
            isValid = false;
        }
        if (numberOfEmailAccountsPerDomain < 1) {
            setNumberOfEmailAccountsPerDomainError("Number of Email Accounts per Domain is required.");
            isValid = false;
        }

        if (!isValid) {
            return false;
        }
        // Reset error message if validation passes
        setNamecheapUsernameError("");
        setNamecheapApiKeyError("");
        setInstantlyApiKeyError("");
        setNumberOfEmailAccountsPerDomainError("");
        setDefaultEmailAccountPasswordError("");
        setMTAIpAddressError("");
        return true;
    };

    const editDefaultSettings = async () => {
        setLoadingIndicatorActive(true);
        if (!isValidEditDefaultSettings()) {

            setLoadingIndicatorActive(false);
            handleCloseEditDefaultSettingsModal();
            // show error message for first name field
            return;
        }

        try {
            const response = await axiosPrivate.post(`/api/v1/pre-warmup/default-settings/edit`, {
                namecheapUsername,
                namecheapApiKey,
                instantlyApiKey,
                numberOfEmailAccountsPerDomain,
                defaultEmailAccountPassword,
                MTAIpAddress
            },
                { headers: { 'Content-Type': 'application/json' } });
            if (response.data.success) {
                console.log("success");
                handleCloseEditDefaultSettingsModal();
                getDefaultSettings();
                
            } else {
                console.log("Failure");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingIndicatorActive(false);
        }
    }
    // END Edit Item


    // START Get Main Page Data
    const getDefaultSettings = async () => {
        setLoadingIndicatorActive(true);

        try {
            const response = await axiosPrivate.post(`/api/v1/pre-warmup/default-settings/get`, {}, { headers: { 'Content-Type': 'application/json' } });
            if (response.data.success) {
                let username = ""
                if (response.data.data.namecheapUsername != undefined){
                    username = response.data.data.namecheapUsername;
                }
                let nApiKey = ""
                if (response.data.data.namecheapApiKey != undefined){
                    nApiKey = response.data.data.namecheapApiKey;
                }
                let iApiKey = ""
                if (response.data.data.instantlyApiKey != undefined){
                    iApiKey = response.data.data.instantlyApiKey;
                }
                let numAccs = ""
                if (response.data.data.numberOfEmailAccountsPerDomain != undefined){
                    numAccs = response.data.data.numberOfEmailAccountsPerDomain;
                }
                let emAcPass = "";
                if (response.data.data.defaultEmailAccountPassword != undefined){
                    emAcPass = response.data.data.defaultEmailAccountPassword;
                }
                let ip = "";
                if (response.data.data.MTAIpAddress != undefined){
                    ip = response.data.data.MTAIpAddress;
                }
                setInitialNamecheapUsername(username);
                setInitialNamecheapApiKey(nApiKey);
                setInitialInstantlyApiKey(iApiKey);
                setInitialNumberOfEmailAccountsPerDomain(numAccs);
                setInitialDefaultEmailAccountPassword(emAcPass);
                setInitialMTAIpAddress(ip);
                setNamecheapUsername(username); // Set the editable state
                setNamecheapApiKey(nApiKey); // Set the editable state
                setInstantlyApiKey(iApiKey); // Set the editable state
                setNumberOfEmailAccountsPerDomain(numAccs); // Set the editable state        
                setDefaultEmailAccountPassword(emAcPass);
                setMTAIpAddress(ip);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingIndicatorActive(false);
        }
    };

    useEffect(() => {
        if (loggedIn) {
            getDefaultSettings();
        } else {
            navigate("/login");
        }
    }, [loggedIn]);
    // END Get Main Page Data

    // START Setup Modal Views Data
    const elementsEditDefaultSettingsModal = [
        {
            type: 'title',
            props: {
                label: "Edit Default Settings",
            }
        },
        {
            type: 'description',
            props: {
                label: "Are you sure you wish to edit the Pre-Warm Up Default Settings?",
            }
        },
    ];
    // END Setup Modal Views Data

    return (
        <div className="m-2 p-2 md:p-10 bg-white rounded-3xl dark:text-gray-200 dark:bg-secondary-dark-bg">
            <Header category="Pre-Warm Up" title="Default Settings" />
            <CustomLoadingIndicator isActive={loadingIndicatorActive} />

            <CustomModal
                open={openEditDefaultSettingsModal}
                handleClose={handleCloseEditDefaultSettingsModal}
                elements={elementsEditDefaultSettingsModal}
                confirmFunction={editDefaultSettings}
            />

            <div className='flex justify-end mb-10 -mt-24 mr-10 md:mr-20'>
                {/* Toggle Buttons */}
                {isEditMode ? (
                    <>
                        <CustomTooltipComponent
                            icon={MdCancel}
                            tooltipText="Cancel"
                            onClick={handleCancelChanges}
                            currentColor={currentColor}
                        />
                        &nbsp;
                        <CustomTooltipComponent
                            icon={MdSave}
                            tooltipText="Save Default Settings"
                            onClick={handleOpenEditDefaultSettingsModal}
                            currentColor={currentColor}
                        />
                    </>
                ) : (
                    <CustomTooltipComponent
                        icon={MdEdit}
                        tooltipText="Edit Default Settings"
                        onClick={toggleEditMode}
                        currentColor={currentColor}
                    />
                )}

            </div>

            <FormControl sx={{ m: 1, width: { xs: '100%', sm: '100%', md: '60%' }}}>
                <TextField
                    disabled={!isEditMode}
                    label="Namecheap Username"
                    value={namecheapUsername}
                    error={!!namecheapUsernameError} // Changed to boolean for error prop
                    helperText={namecheapUsernameError}
                    onChange={(e) => {
                        setNamecheapUsername(e.target.value);
                        if (namecheapUsernameError) setNamecheapUsernameError(""); // Reset error when user starts typing
                    }}
                />
                &nbsp;
                <TextField
                    disabled={!isEditMode}
                    label="Namecheap Api Key"
                    type={showApiKey["namecheapApiKey"] ? 'text' : 'password'}
                    value={namecheapApiKey}
                    error={!!namecheapApiKeyError} // Changed to boolean for error prop
                    helperText={namecheapApiKeyError}
                    onChange={(e) => {
                        setNamecheapApiKey(e.target.value);
                        if (namecheapApiKeyError) setNamecheapApiKeyError(""); // Reset error when user starts typing
                    }}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={() => handleClickShowApiKey("namecheapApiKey")}
                                    edge="end"
                                >
                                    {showApiKey['namecheapApiKey'] ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
                &nbsp;
                <TextField
                    disabled={!isEditMode}
                    label="Instantly Api Key"
                    type={showApiKey['instantlyApiKey'] ? 'text' : 'password'}
                    value={instantlyApiKey}
                    error={!!instantlyApiKeyError} // Changed to boolean for error prop
                    helperText={instantlyApiKeyError}
                    onChange={(e) => {
                        setInstantlyApiKey(e.target.value);
                        if (instantlyApiKeyError) setInstantlyApiKeyError(""); // Reset error when user starts typing
                    }}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={() => handleClickShowApiKey('instantlyApiKey')}
                                    edge="end"
                                >
                                    {showApiKey["instantlyApiKey"] ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
                &nbsp;
                <TextField
                    disabled={!isEditMode}
                    label="Number of Email Accounts per Domain"
                    value={numberOfEmailAccountsPerDomain}
                    error={!!numberOfEmailAccountsPerDomainError} // Changed to boolean for error prop
                    helperText={numberOfEmailAccountsPerDomainError}
                    onChange={(e) => {
                        setNumberOfEmailAccountsPerDomain(e.target.value);
                        if (numberOfEmailAccountsPerDomainError) setNumberOfEmailAccountsPerDomainError(""); // Reset error when user starts typing
                    }}
                />
                &nbsp;
                <TextField
                    disabled={!isEditMode}
                    label="Default Email Account Password"
                    type={showApiKey["defaultEmailAccountPassword"] ? 'text' : 'password'}
                    value={defaultEmailAccountPassword}
                    error={!!defaultEmailAccountPasswordError} // Changed to boolean for error prop
                    helperText={defaultEmailAccountPasswordError}
                    onChange={(e) => {
                        setDefaultEmailAccountPassword(e.target.value);
                        if (defaultEmailAccountPasswordError) setDefaultEmailAccountPasswordError(""); // Reset error when user starts typing
                    }}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={() => handleClickShowApiKey("defaultEmailAccountPassword")}
                                    edge="end"
                                >
                                    {showApiKey['defaultEmailAccountPassword'] ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
                &nbsp;
                <TextField
                    disabled={!isEditMode}
                    label="MTA IP Address"
                    value={MTAIpAddress}
                    error={!!MTAIpAddressError} // Changed to boolean for error prop
                    helperText={MTAIpAddressError}
                    onChange={(e) => {
                        setMTAIpAddress(e.target.value);
                        if (MTAIpAddressError) setMTAIpAddressError(""); // Reset error when user starts typing
                    }}
                />
            </FormControl>
        </div>
    );
};

export default PreWarmUpDefaultSettings;