import React, { useEffect, useState } from "react";
import { useStateContext } from "../../../contexts/ContextProvider";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Snackbar,
  Typography,
} from "@mui/material";
import {
  CustomLoadingIndicator,
  CustomTooltipComponent,
} from "../../../components";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { themeColorsUsable } from "../../../data/buildData";
import { AiOutlineReload } from "react-icons/ai";

const InstantlyChanges = () => {
  const [loadingIndicatorActive, setLoadingIndicatorActive] = useState(false);

  const axiosPrivate = useAxiosPrivate();

  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("error");

  const [instantlyChanges, setInstantlyChanges] = useState(null);

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setShowSnackbar(false);
  };

  const getInstantlyChanges = async () => {
    setLoadingIndicatorActive(true);

    try {
      const response = await axiosPrivate.get(
        `/api/v1/warmup/reports/getInstantlyChanges`,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.success) {
        setInstantlyChanges(response.data.data);
      }
    } catch (error) {
      setSnackbarMessage(error?.response?.data?.message);
      setShowSnackbar(true);
      setSnackbarSeverity("error");
    } finally {
      setLoadingIndicatorActive(false);
    }
  };

  const handleResetValues = async (item) => {
    setLoadingIndicatorActive(true);
    try {
      const response = await axiosPrivate.post(
        `/api/v1/warmup/domains/update_Analytics`,
        {
          id: item.id,
          openRate: item.currentOpenRate,
          replyRate: item.currentReplyRate,
          dailyLimit: item.currentWarmupLimitDaily,
        },
        { headers: { "Content-Type": "application/json" } }
      );
    } catch (error) {
      setSnackbarMessage(error?.response?.data?.message);
      setShowSnackbar(true);
      setSnackbarSeverity("error");
    } finally {
      setLoadingIndicatorActive(false);
      getInstantlyChanges();
    }
  };

  useEffect(() => {
    getInstantlyChanges();
  }, []);

  return (
    <Box>
      {instantlyChanges ? (
        <>
          {Object.entries(instantlyChanges).length ? (
            Object.entries(instantlyChanges).map(([key, value]) => {
              return (
                <Box mt={"30px"} key={key}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "20px",
                    }}
                  >
                    <Typography variant="h5" mr={"10px"}>
                      {key}
                    </Typography>
                    <CustomTooltipComponent
                      icon={AiOutlineReload}
                      tooltipText="Reset values"
                      onClick={() => handleResetValues(value[0])}
                      currentColor={themeColorsUsable.red}
                    />
                  </Box>
                  <table id="groupDomainsTable">
                    <thead>
                      <tr>
                        <th>Account</th>
                        <th>Current Reply Rate</th>
                        <th>Changed Reply Rate</th>
                        <th>Current Open Rate</th>
                        <th>Changed Open Rate</th>
                        <th>Current Warmup Limit Daily</th>
                        <th>Changed Warmup Limit Daily</th>
                      </tr>
                    </thead>
                    <tbody>
                      {value.map((item, index) => {
                        return (
                          <tr key={item.id}>
                            <td>{item.account}</td>
                            <td>
                              {item.currentReplyRate ||
                              item.currentReplyRate === 0
                                ? item.currentReplyRate
                                : "-"}
                            </td>
                            <td>
                              {item.changedReplyRate ||
                              item.changedReplyRate === 0
                                ? item.changedReplyRate
                                : "-"}
                            </td>
                            <td>
                              {item.currentOpenRate ||
                              item.currentOpenRate === 0
                                ? item.currentOpenRate
                                : "-"}
                            </td>
                            <td>
                              {item.changedOpenRate ||
                              item.changedOpenRate === 0
                                ? item.changedOpenRate
                                : "-"}
                            </td>
                            <td>
                              {item.currentWarmupLimitDaily ||
                              item.currentWarmupLimitDaily === 0
                                ? item.currentWarmupLimitDaily
                                : "-"}
                            </td>
                            <td>
                              {item.changedWarmupLimitDaily ||
                              item.changedWarmupLimitDaily === 0
                                ? item.changedWarmupLimitDaily
                                : "-"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </Box>
              );
            })
          ) : !loadingIndicatorActive ? (
            <Box sx={{ textAlign: "center", marginTop: "50px" }}>
              There is no any instantly changes.
            </Box>
          ) : null}
        </>
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

export default InstantlyChanges;
