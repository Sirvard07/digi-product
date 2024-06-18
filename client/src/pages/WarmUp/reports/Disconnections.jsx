import React, { useState } from "react";
import { Tab, Box } from "@mui/material";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import TableView from "./disconnectionsTabs/TableView";
import CalendarView from "./disconnectionsTabs/CalendarView";

const Disconnections = () => {
  const [selectedTab, setSelectedTab] = useState("table-view");

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  return (
    <Box>
      <TabContext value={selectedTab}>
        <TabList onChange={handleTabChange} centered>
          <Tab label="Table View" value="table-view" />
          <Tab label="Calendar View" value="calendar-view" />
        </TabList>
        <TabPanel value="table-view">
          <TableView />
        </TabPanel>
        <TabPanel value="calendar-view">
          <CalendarView />
        </TabPanel>
      </TabContext>
    </Box>
  );
};

export default Disconnections;
