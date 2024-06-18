import { Box, Chip, Divider, LinearProgress, Typography } from "@mui/material";
import React from "react";
import { AiOutlineCheck, AiOutlineMinus } from "react-icons/ai";

const LinearProgressWithLabel = (props) => {
  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Box sx={{ width: "100%", mr: 1 }}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="text.secondary">{`${Math.round(
          props.value
        )}%`}</Typography>
      </Box>
    </Box>
  );
};

const DomainsMaturity = ({ domainsArray }) => {
  return (
    <Box>
      <Box mt={"30px"}>
        <table id="groupDomainsTable">
          <thead>
            <tr>
              <th>Domain Name</th>
              <th>cPanel Account</th>
              <th>IP Address</th>
              <th>Number Of Email Accounts</th>
              <th>Current Warmup Day</th>
              <th>First Warmup Done</th>
              <th>Warm up start date</th>
              <th>Warmup Age</th>
              <th>Status</th>
              <th>Maturity</th>
            </tr>
          </thead>
          <tbody>
            {domainsArray.map((domain) => {
              const currentDate = new Date();

              const dateConnectedToInstantly = new Date(
                domain.dateConnectedToInstantly
              );
              const warmupDiffTime = Math.abs(
                currentDate - dateConnectedToInstantly
              );
              const warmupDiffDays = Math.round(
                warmupDiffTime / (1000 * 60 * 60 * 24)
              );

              let progress = 0,
                progressBackgroundColor,
                progressBackgroundColorFilled;
              if (domain.inProd) {
                progress = 100;
              } else {
                let val = domain.inRecoveryMode
                  ? 45 - Number(domain.recoveryModeDayLimit)
                  : warmupDiffDays;
                progress = Math.round((val / 45) * 100);
                if (progress > 100) {
                  progress = 100;
                }
              }

              if (progress <= 30) {
                progressBackgroundColor = "#FF5C8E50";
                progressBackgroundColorFilled = "#FF5C8E";
              } else if (progress <= 60) {
                progressBackgroundColor = "#ffa50050";
                progressBackgroundColorFilled = "#ffa500";
              } else if (progress > 60) {
                progressBackgroundColor = "#1cab1c50";
                progressBackgroundColorFilled = "#1cab1c";
              }

              return (
                <tr
                  key={domain._id}
                  style={{
                    backgroundColor: domain.inProd
                      ? "#1cab1c50"
                      : "transparent",
                  }}
                >
                  <td>{domain.domainName}</td>
                  <td>{domain.cPanelAccountName}</td>
                  <td>{domain.ipAddress}</td>
                  <td>{domain.numberOfEmailAccounts}</td>
                  <td>{domain.currentWarmupDay}</td>
                  <td
                    className="flex justify-center items-center"
                    style={{ height: "74px" }}
                  >
                    {warmupDiffDays > 45 ? (
                      <AiOutlineCheck color="#1cab1c" fontSize={"28px"} />
                    ) : (
                      <AiOutlineMinus color="#03c9d7" fontSize={"28px"} />
                    )}
                  </td>
                  <td>
                    {domain.dateConnectedToInstantly?.split("T")[0] || "-"}
                  </td>
                  <td>{`${warmupDiffDays} days`}</td>
                  <td>
                    {domain.isLocked
                      ? "Freezed"
                      : domain.inRecoveryMode
                      ? "In Recovery"
                      : domain.inProd
                      ? "In Production"
                      : "Only In Warmup"}
                  </td>
                  <td style={{ width: "200px" }}>
                    <LinearProgressWithLabel
                      value={progress}
                      sx={{
                        backgroundColor: progressBackgroundColor,
                        "& .MuiLinearProgress-bar": {
                          backgroundColor: progressBackgroundColorFilled,
                        },
                      }}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Box>
    </Box>
  );
};

export default DomainsMaturity;
