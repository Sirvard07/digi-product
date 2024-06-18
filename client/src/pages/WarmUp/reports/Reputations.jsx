import { Alert, Box, Snackbar } from "@mui/material";
import React, { useEffect, useState } from "react";
import {
  CustomLoadingIndicator,
  CustomModal,
  CustomTooltipComponent,
} from "../../../components";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { AiOutlineRise } from "react-icons/ai";
import { themeColorsUsable } from "../../../data/buildData";

const Reputations = () => {
  const axiosPrivate = useAxiosPrivate();

  const [loadingIndicatorActive, setLoadingIndicatorActive] = useState(false);
  const [openIcreaseOpenRateModal, setOpenIcreaseOpenRateModal] =
    useState(false);
  const [account, setAccount] = useState(null);
  const [openRate, setOpenRate] = useState(0);
  const [reputations, setReputations] = useState([]);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("error");

  const elementsIcreaseOpenRateModal = [
    {
      type: "title",
      props: {
        label: "Increase open rate",
      },
    },
    {
      type: "inputField",
      props: {
        label: "Open rate",
        value: openRate,
        required: true,
        type: "number",
        max: 100,
        min: 0,
        onChange: (e) => {
          if (e.target.value.length > 1 && e.target.value[0] !== 0) {
            if (Number(e.target.value) >= 0 && Number(e.target.value) <= 100) {
              setOpenRate(e.target.value);
            }
          }
        },
      },
    },
  ];

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setShowSnackbar(false);
  };

  const getReputations = async () => {
    setLoadingIndicatorActive(true);

    try {
      const response = await axiosPrivate.get(
        `/api/v1/warmup/reports/getReputations`,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      setReputations(response.data.data);
    } catch (error) {
      setSnackbarMessage(error?.response?.data?.message);
      setShowSnackbar(true);
      setSnackbarSeverity("error");
    } finally {
      setLoadingIndicatorActive(false);
    }
  };

  useEffect(() => {
    getReputations();
  }, []);

  const handleOpenIcreaseOpenRateModal = (item) => {
    setOpenIcreaseOpenRateModal(true);
    setAccount(item.account);
    setOpenRate(item.openRate);
  };

  const handleCloseIcreaseOpenRateModal = () => {
    setOpenIcreaseOpenRateModal(false);
    setAccount(0);
    setOpenRate(null);
  };

  const handleIncreaseOpenRate = async () => {
    setLoadingIndicatorActive(true);

    try {
      const response = await axiosPrivate.post(
        `/api/v1/warmup/reports/updateAccountOpenRate`,
        {
          account,
          open_rate: openRate,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.success) {
        setLoadingIndicatorActive(false);
        setSnackbarMessage(response.data.message);
        setShowSnackbar(true);
        setSnackbarSeverity("success");
        handleCloseIcreaseOpenRateModal();
        getReputations();
      }
    } catch (error) {
      setSnackbarMessage(error?.response?.data?.message);
      setShowSnackbar(true);
      setSnackbarSeverity("error");
      setLoadingIndicatorActive(false);
    }
  };

  return (
    <Box>
      {reputations.length ? (
        <table id="groupDomainsTable">
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>Account</th>
              <th>Open rate</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reputations.map((item) => {
              return (
                <tr key={item.account}>
                  <td style={{ textAlign: "left" }}>{item.account}</td>
                  <td>{item.openRate}%</td>
                  <td>
                    <CustomTooltipComponent
                      icon={AiOutlineRise}
                      tooltipText="Increase"
                      onClick={() => handleOpenIcreaseOpenRateModal(item)}
                      currentColor={themeColorsUsable.green}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : !loadingIndicatorActive ? (
        <Box sx={{ textAlign: "center", marginTop: "50px" }}>
          There is no any reputation.
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
      <CustomModal
        open={openIcreaseOpenRateModal}
        handleClose={handleCloseIcreaseOpenRateModal}
        elements={elementsIcreaseOpenRateModal}
        confirmFunction={handleIncreaseOpenRate}
      />
    </Box>
  );
};

export default Reputations;
