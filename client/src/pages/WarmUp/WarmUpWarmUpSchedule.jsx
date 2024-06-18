import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStateContext } from "../../contexts/ContextProvider";
// import Select from '@mui/material/Select';
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import "../Table.css";
import "ka-table/style.css";

import {
  Header,
  CustomLoadingIndicator,
  CustomModal,
  CustomTooltipComponent,
  SubHeader,
} from "../../components";
import { MdAdd, MdList, MdRemove } from "react-icons/md";
// import { AiFillDelete, AiFillEdit } from 'react-icons/ai';

// import { updateData } from 'ka-table/actionCreators';
// import { kaReducer, Table } from 'ka-table';
// import { DataType, EditingMode, SortingMode } from 'ka-table/enums';
import { MdCancel, MdEdit, MdSave } from "react-icons/md";
import { formatDate, themeColorsUsable } from "../../data/buildData";

import useAxiosPrivate from "../../hooks/useAxiosPrivate";

const WarmUpSchedule = () => {
  // Default
  const {
    currentColor,
    loggedIn,
    loadingIndicatorActive,
    setLoadingIndicatorActive,
  } = useStateContext();
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();

  // Main Data

  const [warmUpScheduleArray, setWarmUpScheduleArray] = useState([]);

  const [initialWarmUpScheduleArray, setInitialWarmUpScheduleArray] = useState(
    []
  );

  const [warmUpScheduleErrorArray, setWarmUpScheduleErrorArray] = useState([]);

  const [isEditMode, setIsEditMode] = useState(false);

  const [hasWarmupSchedule, setHasWarmupSchedule] = useState(false);

  // START Add New Day Field
  const handleAddWarmUpSchedule = () => {
    if (warmUpScheduleArray.length < 46) {
      setHasWarmupSchedule(true);
      setIsEditMode(true);
      let array = [...warmUpScheduleArray];
      let newDay = 0;
      if (warmUpScheduleArray.length) {
        newDay = warmUpScheduleArray[warmUpScheduleArray.length - 1].day + 1;
      }
      const addNew = { day: newDay, numberOfEmails: 0 };
      array.push(addNew);
      setWarmUpScheduleArray(array);
    }
  };
  // END

  //START Delete Last Warmup Schedule
  const handleDeleteWarmupSchedule = () => {
    let array = [...warmUpScheduleArray];
    array.pop();
    setWarmUpScheduleArray(array);
  };
  //END

  // Function to toggle edit mode
  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  // Handle Cancel Changes
  const handleCancelChanges = () => {
    setWarmUpScheduleArray(initialWarmUpScheduleArray);
    // Turn off edit mode
    if (initialWarmUpScheduleArray.length > 0) {
      setIsEditMode(false);
    } else {
      setIsEditMode(false);
      setHasWarmupSchedule(false);
    }
  };

  // START Edit Item
  const [openEditWarmUpScheduleModal, setOpenEditWarmUpScheduleModal] =
    useState(false);

  const handleOpenEditWarmUpScheduleModal = () => {
    if (!isValidEditWarmUpSchedule()) {
      setLoadingIndicatorActive(false);
      // show error message for first name field
      return;
    }
    setOpenEditWarmUpScheduleModal(true);
  };

  const handleCloseEditWarmUpScheduleModal = () => {
    setOpenEditWarmUpScheduleModal(false);
    handleCancelChanges();
  };

  const isValidEditWarmUpSchedule = () => {
    const errors = Array(warmUpScheduleArray.length).fill("");

    var isValid = true;
    // Trim to remove any leading/trailing whitespace
    for (let i = 0; i < warmUpScheduleArray.length; i++) {
      if (warmUpScheduleArray[i].numberOfEmails < 0) {
        console.log(warmUpScheduleArray[i].numberOfEmails);
        errors[i] = "Please enter a number between 0-200.";
        isValid = false;
        // break; // Stop checking on the first invalid variable
      }
      setWarmUpScheduleErrorArray(errors);
    }
    if (!isValid) {
      return false;
    }
    // Reset error message if validation passes
    // setWarmUpScheduleErrorArray(errors);
    return true;
  };

  const editWarmUpSchedule = async () => {
    setLoadingIndicatorActive(true);
    if (!isValidEditWarmUpSchedule()) {
      setLoadingIndicatorActive(false);
      handleCloseEditWarmUpScheduleModal();
      // show error message for first name field
      return;
    }
    console.log("tuka");
    console.log(warmUpScheduleArray);
    try {
      const response = await axiosPrivate.post(
        `/api/v1/warmup/warmup-schedule/edit`,
        {
          // warmUpScheduleArray,
          warmupSchedule: warmUpScheduleArray,
        },
        { headers: { "Content-Type": "application/json" } }
      );
      if (response.data.success) {
        console.log("success");
        handleCloseEditWarmUpScheduleModal();
        getWarmUpSchedule();
      } else {
        console.log("Failure");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingIndicatorActive(false);
    }
  };
  // END Edit Item

  // START Get Main Page Data
  const getWarmUpSchedule = async () => {
    setLoadingIndicatorActive(true);

    try {
      const response = await axiosPrivate.post(
        `/api/v1/warmup/warmup-schedule/get`,
        {},
        { headers: { "Content-Type": "application/json" } }
      );
      if (response.data.success) {
        setWarmUpScheduleArray(response.data.data);
        setInitialWarmUpScheduleArray(response.data.data);
        if (response.data.data.length > 0) {
          setHasWarmupSchedule(true);
        } else {
          setHasWarmupSchedule(false);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingIndicatorActive(false);
    }
  };

  useEffect(() => {
    if (loggedIn) {
      getWarmUpSchedule();
    } else {
      navigate("/login");
    }
  }, [loggedIn]);
  // END Get Main Page Data

  // START Setup Modal Views Data
  const elementsEditWarmUpScheduleModal = [
    {
      type: "title",
      props: {
        label: "Edit Warmup Schedule",
      },
    },
    {
      type: "description",
      props: {
        label: "Are you sure you wish to edit the Warmup Schedule?",
      },
    },
  ];
  // END Setup Modal Views Data

  const containerStyle = {
    display: "flex",
    flexWrap: "wrap",
    gap: "16px", // Adjust the gap between items
  };

  const itemStyle = {
    flex: "1 1 100%", // Default to full width for small screens
    // Media queries can't be used inline, so this is a limitation of inline styles
  };
  return (
    <div className="m-2 p-2 md:p-10 bg-white rounded-3xl dark:text-gray-200 dark:bg-secondary-dark-bg">
      <Header category="Warm Up" title="Warm Up Schedule" />

      <CustomLoadingIndicator isActive={loadingIndicatorActive} />
      <CustomModal
        open={openEditWarmUpScheduleModal}
        handleClose={handleCloseEditWarmUpScheduleModal}
        elements={elementsEditWarmUpScheduleModal}
        confirmFunction={editWarmUpSchedule}
      />

      <div className="flex justify-end mb-10 -mt-24 mr-10 md:mr-20">
        {/* Toggle Buttons */}
        {isEditMode ? (
          <>
            <CustomTooltipComponent
              icon={MdAdd}
              tooltipText="Add New Warmup Schedule"
              onClick={handleAddWarmUpSchedule}
              currentColor={currentColor}
            />
            &nbsp;
            <CustomTooltipComponent
              icon={MdRemove}
              tooltipText="Delete Last Warmup Schedule"
              onClick={handleDeleteWarmupSchedule}
              currentColor={themeColorsUsable.red}
            />
            &nbsp;
            <CustomTooltipComponent
              icon={MdCancel}
              tooltipText="Cancel"
              onClick={handleCancelChanges}
              currentColor={currentColor}
            />
            &nbsp;
            <CustomTooltipComponent
              icon={MdSave}
              tooltipText="Save Warmup Schedule"
              onClick={handleOpenEditWarmUpScheduleModal}
              currentColor={currentColor}
            />
          </>
        ) : (
          <>
            {hasWarmupSchedule ? (
              <CustomTooltipComponent
                icon={MdEdit}
                tooltipText="Edit Default Settings"
                onClick={toggleEditMode}
                currentColor={currentColor}
              />
            ) : (
              <CustomTooltipComponent
                icon={MdAdd}
                tooltipText="Add New Warmup Schedule"
                onClick={handleAddWarmUpSchedule}
                currentColor={currentColor}
              />
            )}
          </>
        )}
      </div>

      <div>
        <div style={containerStyle}>
          {warmUpScheduleArray.map((schedule, index) => (
            <Grid key={index} item xs={4} sm={4} md={4}>
              <div style={itemStyle}>
                <FormControl sx={{ m: 1, width: "100%" }}>
                  <TextField
                    // key={index}
                    fullWidth
                    disabled={!isEditMode}
                    label={`Day ${schedule.day}`}
                    value={schedule.numberOfEmails}
                    // type="number"
                    onChange={(e) => {
                      const updatedArray = [...warmUpScheduleArray];
                      updatedArray[index] = {
                        ...schedule,
                        numberOfEmails: parseInt(e.target.value, 10) || 0,
                      };
                      setWarmUpScheduleArray(updatedArray);
                      console.log(updatedArray);
                    }}
                    error={!!warmUpScheduleErrorArray[index]}
                    helperText={warmUpScheduleErrorArray[index]}
                  />
                </FormControl>
              </div>
            </Grid>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WarmUpSchedule;
