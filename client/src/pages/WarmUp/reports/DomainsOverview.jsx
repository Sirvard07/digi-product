import { Alert, Box, Chip, Divider, Modal, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";

const DomainsOverview = ({ domainsArray }) => {
  const [openDomainsListModal, setOpenDomainsListModal] = useState(false);
  const [selectedStage, setSelectedStage] = useState("");
  const [preWarmupDomains, setPreWarmupDomains] = useState([]);
  const [warmupDomains, setWarmupDomains] = useState([]);
  const [prodDomains, setProdDomains] = useState([]);

  const [pieData, setPieData] = useState(null);
  const [pieOptions, setPieOptions] = useState(null);

  const handleCloseDomainsListModal = () => {
    setOpenDomainsListModal(false);
  };

  useEffect(() => {
    const preWarmupDomainsTemp = domainsArray.filter(
      (domain) => !domain.setupComplete
    );
    const warmupDomainsTemp = domainsArray.filter(
      (domain) => domain.setupComplete
    );
    const prodDomainsTemp = domainsArray.filter(
      (domain) => domain.setupComplete && domain.inProd
    );

    setPreWarmupDomains(preWarmupDomainsTemp);
    setWarmupDomains(warmupDomainsTemp);
    setProdDomains(prodDomainsTemp);

    setPieData({
      labels: ["Pre-Warm Up", "Warm Up", "Production"],
      datasets: [
        {
          label: "Number of Domains",
          data: [
            preWarmupDomainsTemp.length,
            warmupDomainsTemp.length,
            prodDomainsTemp.length,
          ],
          backgroundColor: [
            "rgba(158, 158, 158, 0.2)",
            "rgba(227, 22, 22, 0.2)",
            "rgba(23, 178, 75, 0.2)",
          ],
          borderColor: [
            "rgba(158, 158, 158, 1)",
            "rgba(227, 22, 22, 1)",
            "rgba(23, 178, 75, 1)",
          ],
          borderWidth: 1,
        },
      ],
    });
  }, [domainsArray]);

  useEffect(() => {
    if (pieData) {
      setPieOptions({
        responsive: true,
        onClick: (e, el) => {
          if (el.length > 0) {
            const column = pieData?.labels[el[0].index];
            setOpenDomainsListModal(true);
            setSelectedStage(column);
          }
        },
        onHover: (event, activeElements) => {
          if (activeElements?.length > 0) {
            event.native.target.style.cursor = "pointer";
          } else {
            event.native.target.style.cursor = "auto";
          }
        },
      });
    }
  }, [pieData]);

  return (
    <Box>
      {pieData ? (
        <Box className="flex justify-center h-[500px] mt-5">
          <Pie data={pieData} options={pieOptions} />
        </Box>
      ) : null}
      <Modal open={openDomainsListModal} onClose={handleCloseDomainsListModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            minWidth: 400,
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
            marginLeft: "144px",
          }}
        >
          <Typography variant="h5" sx={{ marginBottom: "20px" }}>
            {`${
              selectedStage === "Pre-Warm Up"
                ? preWarmupDomains.length
                : selectedStage === "Warm Up"
                ? warmupDomains.length
                : selectedStage === "Production"
                ? prodDomains.length
                : 0
            } Domain (s) in ${selectedStage}`}
          </Typography>
          <table id="domainsTable">
            <thead>
              <tr>
                <th>Domain Name</th>
                <th style={{ textAlign: "center" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {selectedStage === "Pre-Warm Up" ? (
                <>
                  {preWarmupDomains.map((domain) => {
                    return (
                      <tr key={domain._id}>
                        <td>{domain.domainName}</td>
                        <td style={{ textAlign: "center" }}>
                          <Alert
                            severity="error"
                            icon={false}
                            className="justify-center"
                          >
                            -
                          </Alert>
                        </td>
                      </tr>
                    );
                  })}
                </>
              ) : selectedStage === "Warm Up" ? (
                <>
                  {warmupDomains.map((domain) => {
                    return (
                      <tr key={domain._id}>
                        <td>{domain.domainName}</td>
                        <td style={{ textAlign: "center" }}>
                          {domain.isLocked
                            ? "Freezed"
                            : domain.inRecoveryMode
                            ? "In Recovery"
                            : domain.inProd
                            ? "Also In Production"
                            : "Only In Warmup"}
                        </td>
                      </tr>
                    );
                  })}
                </>
              ) : selectedStage === "Production" ? (
                <>
                  {prodDomains.map((domain) => {
                    return (
                      <tr key={domain._id}>
                        <td>{domain.domainName}</td>
                        <td style={{ textAlign: "center" }}>
                          {domain.isLocked
                            ? "Freezed"
                            : domain.inRecoveryMode
                            ? "In Recovery"
                            : domain.inProd
                            ? "In Production"
                            : "Only In Warmup"}
                        </td>
                      </tr>
                    );
                  })}
                </>
              ) : null}
            </tbody>
          </table>
        </Box>
      </Modal>
    </Box>
  );
};

export default DomainsOverview;
