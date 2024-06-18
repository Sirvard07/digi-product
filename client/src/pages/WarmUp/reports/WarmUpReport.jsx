import React, { useEffect, useState } from "react";

import "../../Table.css";

import { CustomLoadingIndicator, Header } from "../../../components";

import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";

import { Alert, Box, Snackbar } from "@mui/material";
import { useStateContext } from "../../../contexts/ContextProvider";
import { useNavigate } from "react-router-dom";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import DomainsOverview from "./DomainsOverview";
import DomainsMaturity from "./DomainsMaturity";
import InstantlyChanges from "./InstantlyChanges";
import Disconnections from "./Disconnections";
import Reputations from "./Reputations";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const WarmupReport = () => {
  const { loggedIn, loadingIndicatorActive, setLoadingIndicatorActive } =
    useStateContext();
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();

  const [domainsArray, setDomainsArray] = useState([]);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("error");
  const [reportType, setReportType] = useState("overview");

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setShowSnackbar(false);
  };

  const getAllDomains = async () => {
    setLoadingIndicatorActive(true);

    try {
      const response = await axiosPrivate.get(`/api/v1/warmup/domains/getAll`, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.data.success) {
        setDomainsArray(response.data.data);
      }
    } catch (error) {
      setSnackbarMessage(error?.response?.data?.message);
      setShowSnackbar(true);
      setSnackbarSeverity("error");
    } finally {
      setLoadingIndicatorActive(false);
    }
  };

  useEffect(() => {
    if (loggedIn) {
      getAllDomains();
    } else {
      navigate("/login");
    }
  }, [loggedIn]);

  return (
    <Box className="m-2 p-2 md:p-10 bg-white rounded-3xl dark:text-gray-200 dark:bg-secondary-dark-bg">
      <Header category="Warm Up" title="Reports" />

      <Box mb={5} sx={{ display: "flex", justifyContent: "center" }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 150px)",
            gridGap: "20px",
            justifyItems: "center",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor:
                reportType === "overview"
                  ? "rgba(255, 99, 132, 0.2)"
                  : "transparent",
              border: "1px solid rgba(255, 99, 132, 1)",
              color: "rgba(255, 99, 132, 1)",
              height: "150px",
              padding: "20px",
              cursor: "pointer",
              textAlign: "center",
            }}
            onClick={() => setReportType("overview")}
          >
            Domains Overview
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor:
                reportType === "maturity"
                  ? "rgba(54, 162, 235, 0.2)"
                  : "transparent",
              border: "1px solid rgba(54, 162, 235, 1)",
              color: "rgba(54, 162, 235, 1)",
              height: "150px",
              padding: "20px",
              cursor: "pointer",
              textAlign: "center",
            }}
            onClick={() => setReportType("maturity")}
          >
            Domains Maturity
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor:
                reportType === "instantly"
                  ? "rgba(255, 159, 64, 0.2)"
                  : "transparent",
              border: "1px solid rgba(255, 159, 64, 1)",
              color: "rgba(255, 159, 64, 1)",
              height: "150px",
              padding: "20px",
              cursor: "pointer",
              textAlign: "center",
            }}
            onClick={() => setReportType("instantly")}
          >
            Instantly Changes
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor:
                reportType === "disconnections"
                  ? "rgba(75, 192, 192, 0.2)"
                  : "transparent",
              border: "1px solid rgba(75, 192, 192, 1)",
              color: "rgba(75, 192, 192, 1)",
              height: "150px",
              padding: "20px",
              cursor: "pointer",
              textAlign: "center",
            }}
            onClick={() => setReportType("disconnections")}
          >
            Disconnected Accounts
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor:
                reportType === "reputation"
                  ? "rgba(153, 102, 255, 0.2)"
                  : "transparent",
              border: "1px solid rgba(153, 102, 255, 1)",
              color: "rgba(153, 102, 255, 1)",
              height: "150px",
              padding: "20px",
              cursor: "pointer",
              textAlign: "center",
            }}
            onClick={() => setReportType("reputation")}
          >
            Reputation ( under 5% open rate)
          </Box>
        </Box>
      </Box>

      {reportType === "overview" ? (
        <DomainsOverview domainsArray={domainsArray} />
      ) : reportType === "maturity" ? (
        <DomainsMaturity domainsArray={domainsArray} />
      ) : reportType === "instantly" ? (
        <InstantlyChanges />
      ) : reportType === "disconnections" ? (
        <Disconnections />
      ) : reportType === "reputation" ? (
        <Reputations />
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

export default WarmupReport;
