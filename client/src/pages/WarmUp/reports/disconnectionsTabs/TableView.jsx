import React, { useEffect, useState } from "react";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { Alert, Box, Snackbar } from "@mui/material";
import {
  CustomLoadingIndicator,
  CustomTooltipComponent,
} from "../../../../components";
import { AiFillCaretRight, AiOutlineCloudDownload } from "react-icons/ai";
import { themeColorsUsable } from "../../../../data/buildData";

const TableView = () => {
  const axiosPrivate = useAxiosPrivate();

  const [loadingIndicatorActive, setLoadingIndicatorActive] = useState(false);
  const [disconnectedAccounts, setDisconnectedAccounts] = useState([]);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("error");

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

      if (response.data.success) {
        setDisconnectedAccounts(response.data.data);
      }
    } catch (error) {
      setSnackbarMessage(error?.response?.data?.message);
      setShowSnackbar(true);
      setSnackbarSeverity("error");
    } finally {
      setLoadingIndicatorActive(false);
    }
  };

  const handleResume = async (account) => {
    setLoadingIndicatorActive(true);

    try {
      const response = await axiosPrivate.post(
        `/api/v1/warmup/reports/updateAccountStatus`,
        {
          account,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.success) {
        setSnackbarMessage(response.data.message);
        setShowSnackbar(true);
        setSnackbarSeverity("success");
      }
    } catch (error) {
      setSnackbarMessage(error?.response?.data?.message);
      setShowSnackbar(true);
      setSnackbarSeverity("error");
    } finally {
      setLoadingIndicatorActive(false);
      getDisconnectedAccounts();
    }
  };

  const handlePullFromInstantly = async () => {
    setLoadingIndicatorActive(true);

    try {
      await axiosPrivate.get(`/api/v1/warmup/reports/pullFromInstantly`, {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      setSnackbarMessage(error?.response?.data?.message);
      setShowSnackbar(true);
      setSnackbarSeverity("error");
    } finally {
      setLoadingIndicatorActive(false);
      getDisconnectedAccounts();
    }
  };

  useEffect(() => {
    getDisconnectedAccounts();
  }, []);

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "30px",
        }}
      >
        <CustomTooltipComponent
          icon={AiOutlineCloudDownload}
          tooltipText="Pull from Instantly"
          onClick={() => handlePullFromInstantly()}
          currentColor={themeColorsUsable.red}
        />
      </Box>
      {disconnectedAccounts.length ? (
        <table id="groupDomainsTable">
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>Account</th>
              <th>Status</th>
              <th>Monthly Disconnected</th>
              <th>Yearly Disconnected</th>
              {/* <th>Actions</th> */}
            </tr>
          </thead>
          <tbody>
            {disconnectedAccounts.map((item) => {
              const currentYear = new Date().getFullYear();
              const currentMonth = new Date().getMonth() + 1;
              let yearlyDisconnected = 0;
              let monthlyDisconnected = 0;
              item.dates.forEach((d) => {
                if (currentYear === new Date(d.date).getFullYear()) {
                  yearlyDisconnected += d.count;
                }
                if (
                  currentYear === new Date(d.date).getFullYear() &&
                  currentMonth === new Date(d.date).getMonth() + 1
                ) {
                  monthlyDisconnected += d.count;
                }
              });
              return (
                <tr key={item._id}>
                  <td style={{ textAlign: "left" }}>{item.account}</td>
                  <td>{item.status}</td>
                  <td>{monthlyDisconnected}</td>
                  <td>{yearlyDisconnected}</td>
                  {/* <td>
                    {item.status !== "active" ? (
                      <CustomTooltipComponent
                        icon={AiFillCaretRight}
                        tooltipText="Resume"
                        onClick={() => handleResume(item.account)}
                        currentColor={themeColorsUsable.green}
                      />
                    ) : (
                      "-"
                    )}
                  </td> */}
                </tr>
              );
            })}
          </tbody>
        </table>
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

export default TableView;
