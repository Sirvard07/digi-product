import {
  Alert,
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
} from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { CustomLoadingIndicator } from "../../../../components";
import { Calendar, Views, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import Year from "./YearView";

const mLocalizer = momentLocalizer(moment);
mLocalizer.formats.yearHeaderFormat = "YYYY";

const ColoredDateCellWrapper = ({ children }) =>
  React.cloneElement(React.Children.only(children), {
    style: {
      backgroundColor: "lightblue",
    },
  });
const CalendarView = () => {
  const axiosPrivate = useAxiosPrivate();

  const [calendarView, setCalendarView] = useState("month");
  const calendarHeight =
    calendarView === "year" ? { minHeight: "600px" } : { height: "600px" };
  const [loadingIndicatorActive, setLoadingIndicatorActive] = useState(false);
  const [events, setEvents] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [disconnectedAccounts, setDisconnectedAccounts] = useState([]);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("error");

  const { components, defaultDate, max, views } = useMemo(
    () => ({
      components: {
        timeSlotWrapper: ColoredDateCellWrapper,
      },
      defaultDate: new Date(),
      max: new Date(),
      views: Object.keys(Views)
        .filter((k) => k === "MONTH")
        .map((k) => Views[k]),
    }),
    []
  );

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setShowSnackbar(false);
  };

  const getDisconnectedAccounts = async () => {
    setLoadingIndicatorActive(true);

    try {
      const response = await axiosPrivate.get(
        `/api/v1/warmup/reports/getDisconnectedAccounts`,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data?.success && response.data?.data.length) {
        setDisconnectedAccounts(response.data?.data);
        setSelectedAccount(response.data?.data[0]._id);
        const generateEvent = response.data?.data[0].dates.map((d, index) => ({
          id: index + 1,
          title: `Disconnected (${d.count})`,
          start: new Date(d.date),
          end: new Date(d.date),
        }));
        setEvents(generateEvent);
      }
    } catch (error) {
      setSnackbarMessage(error?.response?.data?.message);
      setShowSnackbar(true);
      setSnackbarSeverity("error");
    } finally {
      setLoadingIndicatorActive(false);
    }
  };

  const handleSelectChange = (event) => {
    const acc = disconnectedAccounts.find((a) => a._id === event.target.value);
    const generateEvent = acc.dates.map((d, index) => ({
      id: index + 1,
      title: "Disconnected",
      start: new Date(d),
      end: new Date(d),
    }));
    setEvents(generateEvent);
    setSelectedAccount(event.target.value);
  };

  useEffect(() => {
    getDisconnectedAccounts();
  }, []);

  return (
    <Box>
      {disconnectedAccounts.length ? (
        <>
          <Box mb={5} sx={{ display: "flex", justifyContent: "flex-end" }}>
            <FormControl sx={{ width: "300px" }}>
              <InputLabel id="disconnected-accounts">
                Choose an account
              </InputLabel>
              <Select
                labelId="disconnected-accounts"
                id="account"
                value={selectedAccount}
                label="Choose an account"
                onChange={handleSelectChange}
              >
                {disconnectedAccounts.map((item) => {
                  return (
                    <MenuItem key={item._id} value={item._id}>
                      {item.account}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Box>
          <Box sx={calendarHeight}>
            <Calendar
              components={components}
              defaultDate={defaultDate}
              events={events}
              localizer={mLocalizer}
              max={max}
              showMultiDayTimes
              step={20}
              views={{
                month: true,
                year: Year,
              }}
              messages={{ year: "Year" }}
              onView={(val) => setCalendarView(val)}
            />
          </Box>
        </>
      ) : !loadingIndicatorActive ? (
        <Box sx={{ textAlign: "center", marginTop: "50px" }}>
          There is no any disconnected account.
        </Box>
      ) : null}
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        open={showSnackbar}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
      <CustomLoadingIndicator isActive={loadingIndicatorActive} />
    </Box>
  );
};

export default CalendarView;
