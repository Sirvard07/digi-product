import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStateContext } from '../../contexts/ContextProvider';
import Pagination from '@mui/material/Pagination';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import { Header, SearchBar, CustomLoadingIndicator, CustomModal, CustomTooltipComponent, SubHeader } from '../../components';
import { MdAdd, MdCancel, MdEdit, MdList, MdRemove, MdSave } from 'react-icons/md';
import { AiFillDelete, AiFillEdit } from 'react-icons/ai';

import useAxiosPrivate from '../../hooks/useAxiosPrivate';

import { formatDate, themeColorsUsable } from '../../data/buildData';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const WarmUpDefaultSettings = () => {

    // Default
    const { currentColor, loggedIn, loadingIndicatorActive, setLoadingIndicatorActive } = useStateContext();
    const axiosPrivate = useAxiosPrivate();
    const navigate = useNavigate();

    // Main Data
    const [initialIncreasePerDay, setInitialIncreasePerDay] = useState(0);
    const [initialDailyWarmupLimit, setInitialDailyWarmupLimit] = useState(0);
    const [initialDisableSlowWarmup, setInitialDisableSlowWarmup] = useState(false);
    const [initialReplyRate, setInitialReplyRate] = useState(0);
    const [initialWeekdaysOnly, setInitialWeekdaysOnly] = useState(false);
    const [initialReadEmulation, setInitialReadEmulation] = useState(false);
    const [initialWarmCustomTrackingDomain, setInitialWarmCustomTrackingDomain] = useState(false);
    const [initialOpenRate, setInitialOpenRate] = useState(0);
    const [initialSpamProtection, setInitialSpamProtection] = useState(0);
    const [initialMarkImportant, setInitialMarkImportant] = useState(0);


    const [increasePerDay, setIncreasePerDay] = useState(0);
    const [increasePerDayError, setIncreasePerDayError] = useState("");
    const [dailyWarmupLimit, setDailyWarmupLimit] = useState(0);
    const [dailyWarmupLimitError, setDailyWarmupLimitError] = useState("");
    const [disableSlowWarmup, setDisableSlowWarmup] = useState(false);
    const [replyRate, setReplyRate] = useState(0);
    const [replyRateError, setReplyRateError] = useState("");
    const [weekdaysOnly, setWeekdaysOnly] = useState(false);
    const [readEmulation, setReadEmulation] = useState(false);
    const [warmCustomTrackingDomain, setWarmCustomTrackingDomain] = useState(false);
    const [openRate, setOpenRate] = useState(0);
    const [openRateError, setOpenRateError] = useState("");
    const [spamProtection, setSpamProtection] = useState(0);
    const [spamProtectionError, setSpamProtectionError] = useState("");
    const [markImportant, setMarkImportant] = useState(0);
    const [markImportantError, setMarkImportantError] = useState("");
    

    const [showApiKey, setShowApiKey] = useState({
        
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
        setIncreasePerDay(initialIncreasePerDay);
        setDailyWarmupLimit(initialDailyWarmupLimit);
        setDisableSlowWarmup(initialDisableSlowWarmup);
        setReplyRate(initialReplyRate);
        setWeekdaysOnly(initialWeekdaysOnly);
        setReadEmulation(initialReadEmulation);
        setWarmCustomTrackingDomain(initialWarmCustomTrackingDomain);
        setOpenRate(initialOpenRate);
        setSpamProtection(initialSpamProtection);
        setMarkImportant(initialMarkImportant);
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

        if (increasePerDay < 1) {
            setIncreasePerDayError("Increase Per Day is required.");
            isValid = false;
        }
        if (dailyWarmupLimit < 1 || dailyWarmupLimit > 200) {
            setDailyWarmupLimitError("Enter a number between 0 and 200.");
            isValid = false;
        }
        if (replyRate < 1) {
            setReplyRateError("Reply Rate is required.");
            isValid = false;
        }
        if (openRate <= 0 || openRate > 100) {
            setOpenRateError("Enter a number between 0 and 100.");
            isValid = false;
        }
        if (spamProtection <= 0 || spamProtection > 100) {
            setSpamProtectionError("Enter a number between 0 and 100.");
            isValid = false;
        }
        if (markImportant <=0 || markImportant > 100) {
            setMarkImportantError("Enter a number between 0 and 100..");
            isValid = false;
        }
        if (!isValid) {
            return false;
        }
        // Reset error message if validation passes
        setIncreasePerDayError("");
        setDailyWarmupLimitError("");
        setReplyRateError("");
        setOpenRateError("");
        setSpamProtectionError("");
        setMarkImportantError("");
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
            const response = await axiosPrivate.post(`/api/v1/warmup/default-settings/edit`, {
                increasePerDay,
                dailyWarmupLimit,
                disableSlowWarmup,
                replyRate,
                weekdaysOnly,
                readEmulation,
                warmCustomTrackingDomain,
                openRate,
                spamProtection,
                markImportant
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
            const response = await axiosPrivate.post(`/api/v1/warmup/default-settings/get`, {}, { headers: { 'Content-Type': 'application/json' } });
            if (response.data.success) {
                let incrDay = 0;
                if (response.data.data.increasePerDay != undefined){
                    incrDay = response.data.data.increasePerDay;
                }
                let dailyLimit = 0;
                if (response.data.data.dailyWarmupLimit != undefined){
                    dailyLimit = response.data.data.dailyWarmupLimit;
                }
                let disableSlow = false;
                if (response.data.data.disableSlowWarmup != undefined){
                    disableSlow = response.data.data.disableSlowWarmup;
                }
                let replyR = 0;
                if (response.data.data.replyRate != undefined){
                    replyR = response.data.data.replyRate;
                }
                let weekOnly = false;
                if (response.data.data.weekdaysOnly != undefined){
                    weekOnly = response.data.data.weekdaysOnly;
                }
                let readEmul = false;
                if (response.data.data.readEmulation != undefined){
                    readEmul = response.data.data.readEmulation;
                }
                let warmCustomDomain = false;
                if (response.data.data.warmCustomTrackingDomain != undefined){
                    warmCustomDomain = response.data.data.warmCustomTrackingDomain;
                }
                let openR = 0;
                if (response.data.data.openRate != undefined){
                    openR = response.data.data.openRate;
                }
                let spamProt = 0;
                if (response.data.data.spamProtection != undefined){
                    spamProt = response.data.data.spamProtection;
                }
                let markImp = 0;
                if (response.data.data.markImportant != undefined){
                    markImp = response.data.data.markImportant;
                }
                setInitialIncreasePerDay(incrDay);
                setInitialDailyWarmupLimit(dailyLimit);
                setInitialDisableSlowWarmup(disableSlow);
                setInitialReplyRate(replyR);
                setInitialWeekdaysOnly(weekOnly);
                setInitialReadEmulation(readEmul);
                setInitialWarmCustomTrackingDomain(warmCustomDomain);
                setInitialOpenRate(openR);
                setInitialSpamProtection(spamProt);
                setInitialMarkImportant(markImp);

                setIncreasePerDay(incrDay);
                setDailyWarmupLimit(dailyLimit);
                setDisableSlowWarmup(disableSlow);
                setReplyRate(replyR);
                setWeekdaysOnly(weekOnly);
                setReadEmulation(readEmul);
                setWarmCustomTrackingDomain(warmCustomDomain);
                setOpenRate(openR);
                setSpamProtection(spamProt);
                setMarkImportant(markImp);
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
                label: "Are you sure you wish to edit the Warm Up Default Settings?",
            }
        },
    ];
    // END Setup Modal Views Data

    return (
        <div className="m-2 p-2 md:p-10 bg-white rounded-3xl dark:text-gray-200 dark:bg-secondary-dark-bg">
            <Header category="Warm Up" title="Default Settings" />
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

            <FormControl sx={{ m: 1, width: { xs: '100%', sm: '100%', md: '60%' } }}>
                <TextField
                    disabled={!isEditMode}
                    label="Increase Per Day"
                    type="number"
                    value={increasePerDay}
                    error={!!increasePerDayError} // Changed to boolean for error prop
                    helperText={increasePerDayError}
                    onChange={(e) => {
                        setIncreasePerDay(e.target.value);
                        if (increasePerDayError) setIncreasePerDayError(""); // Reset error when user starts typing
                    }}
                />
                &nbsp;
                <TextField
                    disabled={!isEditMode}
                    label="Daily Warm Up Limit"
                    value={dailyWarmupLimit}
                    type="number"
                    error={!!dailyWarmupLimitError} // Changed to boolean for error prop
                    helperText={dailyWarmupLimitError}
                    onChange={(e) => {
                        setDailyWarmupLimit(e.target.value);
                        if (dailyWarmupLimitError) setDailyWarmupLimitError(""); // Reset error when user starts typing
                    }}
                />
                &nbsp;
                <FormControlLabel
                    control={
                        <Checkbox
                            disabled={!isEditMode}
                            checked={disableSlowWarmup}
                            onChange={(e) => {
                                setDisableSlowWarmup(e.target.checked);
                            }}
                        />
                    }
                    label="Disable Slow Warmup"
                />
                &nbsp;
                <TextField
                    disabled={!isEditMode}
                    label="Reply Rate"
                    value={replyRate}
                    type="number"
                    error={!!replyRateError} // Changed to boolean for error prop
                    helperText={replyRateError}
                    onChange={(e) => {
                        setReplyRate(e.target.value);
                        if (replyRateError) setReplyRateError(""); // Reset error when user starts typing
                    }}
                />
                &nbsp;
                <FormControlLabel
                    control={
                        <Checkbox
                            disabled={!isEditMode}
                            checked={weekdaysOnly}
                            onChange={(e) => {
                                setWeekdaysOnly(e.target.checked);
                            }}
                        />
                    }
                    label="Weekdays Only"
                />
                &nbsp;
                <FormControlLabel
                    control={
                        <Checkbox
                            disabled={!isEditMode}
                            checked={readEmulation}
                            onChange={(e) => {
                                setReadEmulation(e.target.checked);
                            }}
                        />
                    }
                    label="Read Emulation"
                />
                &nbsp;
                <FormControlLabel
                    control={
                        <Checkbox
                            disabled={!isEditMode}
                            checked={warmCustomTrackingDomain}
                            onChange={(e) => {
                                setWarmCustomTrackingDomain(e.target.checked);
                            }}
                        />
                    }
                    label="Warm Custom Tracking Domain"
                />
                &nbsp;
                <TextField
                    disabled={!isEditMode}
                    label="Open Rate"
                    value={openRate}
                    type="number"
                    error={!!openRateError} // Changed to boolean for error prop
                    helperText={openRateError}
                    onChange={(e) => {
                        setOpenRate(e.target.value);
                        if (openRateError) setOpenRateError(""); // Reset error when user starts typing
                    }}
                />
                &nbsp;
                <TextField
                    disabled={!isEditMode}
                    label="Spam Protection"
                    value={spamProtection}
                    type="number"
                    error={!!spamProtectionError} // Changed to boolean for error prop
                    helperText={spamProtectionError}
                    onChange={(e) => {
                        setSpamProtection(e.target.value);
                        if (spamProtectionError) setSpamProtectionError(""); // Reset error when user starts typing
                    }}
                />
                &nbsp;
                <TextField
                    disabled={!isEditMode}
                    label="Mark Important"
                    value={markImportant}
                    type="number"
                    error={!!markImportantError} // Changed to boolean for error prop
                    helperText={markImportantError}
                    onChange={(e) => {
                        setMarkImportant(e.target.value);
                        if (markImportantError) setMarkImportantError(""); // Reset error when user starts typing
                    }}
                />
                &nbsp;
            </FormControl>
        </div>
    );
};

export default WarmUpDefaultSettings;