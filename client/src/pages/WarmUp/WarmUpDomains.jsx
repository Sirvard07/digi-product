import React, { useState } from "react";
import "../Table.css";
import "ka-table/style.css";

import {
  Header
} from "../../components";

import { Tab } from "@mui/material";
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import ListView from "./domainsTabs/ListView";
import GroupView from "./domainsTabs/GroupView";

const PreWarmUpDomains = () => {
  const [selectedTab, setSelectedTab] = useState('list-view');

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  return (
    <div className="m-2 p-2 md:p-10 bg-white rounded-3xl dark:text-gray-200 dark:bg-secondary-dark-bg">
      <Header category="Warm Up" title="Domains" />
        <TabContext value={selectedTab}>
          <TabList onChange={handleTabChange} centered>
            <Tab label="List View" value="list-view" />
            <Tab label="Group View" value="group-view" />
          </TabList>
          <TabPanel value="list-view">
            <ListView />
          </TabPanel>
          <TabPanel value="group-view">
            <GroupView />
          </TabPanel>
        </TabContext>
    </div>
  );
};

export default PreWarmUpDomains;
