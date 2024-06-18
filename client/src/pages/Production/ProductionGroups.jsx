import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStateContext } from '../../contexts/ContextProvider';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import '../Table.css';
import 'ka-table/style.css';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';

import { Header, CustomLoadingIndicator, CustomModal, CustomTooltipComponent, SubHeader, GroupsDomainCard, GroupsGroupCard, GroupsActionButtons } from '../../components';
import { MdAdd, MdList, MdRemove } from 'react-icons/md';
import { MdCancel, MdEdit, MdSave } from 'react-icons/md';
import { formatDate, themeColorsUsable } from '../../data/buildData';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';


const ProductionGroups = () => {

  // Default
  const { currentColor, loggedIn, loadingIndicatorActive, setLoadingIndicatorActive } = useStateContext();
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();

  // Main Data
  const [domains, setDomains] = useState([]);
  const [filteredDomains, setFilteredDomains] = useState([]);
  const [selectedDomains, setSelectedDomains] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [selectedGroupName, setSelectedGroupName] = useState("");
  const [selectedGroupDomains, setSelectedGroupDomains] = useState([]);

  const [newGroupName, setNewGroupName] = useState("");
  const [addGroupMode, setAddGroupMode] = useState(false);
  const [groupDomains, setGroupDomains] = useState([]);

  // Function to toggle domain selection
  const toggleDomainSelection = (domainId) => {
    console.log(domainId);
    // console.log(selectedDomains);

    setSelectedDomains(prevSelectedDomains => {
      const isSelected = prevSelectedDomains.includes(domainId);
      if (isSelected) {
        // If already selected, remove from selectedDomains
        return prevSelectedDomains.filter(id => id !== domainId);
      } else {
        // If not selected, add to selectedDomains
        return [...prevSelectedDomains, domainId];
      }
    });
  };


  const toggleGroupDomainSelection = (domainId) => {
    console.log(domainId);
    // console.log(selectedDomains);

    setSelectedGroupDomains(prevSelectedDomains => {
      const isSelected = prevSelectedDomains.includes(domainId);
      if (isSelected) {
        // If already selected, remove from selectedDomains
        return prevSelectedDomains.filter(id => id !== domainId);
      } else {
        // If not selected, add to selectedDomains
        return [...prevSelectedDomains, domainId];
      }
    });
  };

  // end MAIN DATA

  // Handle Cancel Changes
  //   const handleCancelChanges = () => {
  //     setWarmUpScheduleArray(initialWarmUpScheduleArray);
  //     // Turn off edit mode
  //     if (initialWarmUpScheduleArray.length > 0) {
  //       setIsEditMode(false);
  //     }
  //     else {
  //       setIsEditMode(false);
  //       setHasWarmupSchedule(false);
  //     }
  //   };


  

  // Handle adding all selected domains to the selected group
  const handleAddAll = () => {
    const selectedGroup = groups.find(group => group._id === selectedGroupId);

    if (selectedGroup) {
      const allDomainIds = domains.map(domain => domain._id);
      const updatedGroup = {
        ...selectedGroup,
        domainIds: allDomainIds
      };
      const groupIndex = groups.findIndex(group => group._id === selectedGroupId);
      const updatedGroups = [...groups];
      updatedGroups[groupIndex] = updatedGroup;
      const domainNames = allDomainIds.map(domainId => {
        const domain = domains.find(domain => domain._id === domainId);
        return domain ? domain.domainName : null;
      }).filter(Boolean);

      setGroupDomains(domainNames);


      setGroups(updatedGroups);
      setSelectedDomains([]);
      handleEditGroup();

    } else {
      console.error('Selected group not found');
    }
  };


  // Function to handle removing all domains from the selected group
  const handleRemoveAll = () => {
    // Find the selected group
    const selectedGroup = groups.find(group => group._id === selectedGroupId);

    if (selectedGroup) {
      const removedDomainIds = selectedGroup.domainIds;
      const updatedDomainIds = selectedGroup.domainIds.filter(domainId => !removedDomainIds.includes(domainId));

      const updatedGroup = {
        ...selectedGroup,
        domainIds: updatedDomainIds
      };

      const groupIndex = groups.findIndex(group => group._id === selectedGroupId);

      const updatedGroups = [...groups];
      updatedGroups[groupIndex] = updatedGroup;
      const domainNames = updatedDomainIds.map(domainId => {
        const domain = domains.find(domain => domain._id === domainId);
        return domain ? domain.domainName : null;
      }).filter(Boolean);
      setGroupDomains(domainNames);

      setGroups(updatedGroups);
      setSelectedGroupDomains([]);
      handleEditGroup();

    } else {
      console.error('Selected group not found');
    }
  };

  // Function to handle adding selected domains to the selected group
  const handleAddSelected = async () => {
    const selectedGroup = groups.find(group => group._id === selectedGroupId);

    if (selectedGroup) {
      const updatedDomainIds = [...selectedGroup.domainIds, ...selectedDomains];
      const uniqueDomainIds = Array.from(new Set(updatedDomainIds));

      // Update the selected group with the new domain IDs
      const updatedGroup = {
        ...selectedGroup,
        domainIds: uniqueDomainIds
      };

      console.log(updatedGroup)

      // Update the groups array with the modified group
      const updatedGroups = [...groups];
      const groupIndex = updatedGroups.findIndex(group => group._id === selectedGroupId);
      updatedGroups[groupIndex] = updatedGroup;

      // Update the state with the modified groups array
      setGroups(updatedGroups);

      // Clear the selected domains
      setSelectedDomains([]);

      // Update the group domains for display
      const domainNames = uniqueDomainIds.map(domainId => {
        const domain = domains.find(domain => domain._id === domainId);
        return domain ? domain.domainName : null;
      }).filter(Boolean);
      setGroupDomains(domainNames);

      // Perform backend update
      await handleEditGroup();
    } else {
      console.error('Selected group not found');
    }
  };


  // Function to handle removing selected domains from the selected group
  const handleRemoveSelected = () => {
    // Find the selected group
    const selectedGroup = groups.find(group => group._id === selectedGroupId);

    if (selectedGroup) {
      // Get the domainIds of the selected group
      const groupDomainIds = selectedGroup.domainIds;

      // Remove selected domains from the group's domainIds array
      const updatedDomainIds = groupDomainIds.filter(domainId => !selectedDomains.includes(domainId));

      // Update the selected group with the updated domainIds array
      const updatedGroup = {
        ...selectedGroup,
        domainIds: updatedDomainIds
      };

      // Find the index of the selected group in the groups array
      const groupIndex = groups.findIndex(group => group._id === selectedGroupId);

      // Update the groups array with the modified group
      const updatedGroups = [...groups];
      updatedGroups[groupIndex] = updatedGroup;

      // Update the state with the modified groups array
      setGroups(updatedGroups);

      // Clear the selected domains
      setSelectedDomains([]);
      handleEditGroup();

    } else {
      console.error('Selected group not found');
    }
  };


  //Handle group change
  const handleChangeGroup = (groupId) => {
    setSelectedGroupId(groupId);
    console.log("groupId: " + groupId);
    const selectedGroup = groups.find(group => group._id === groupId);
    if (selectedGroup) {
      const groupDomainid = selectedGroup.domainIds;
      // const selectedGroupName = selectedGroup.name;
      // console.log("selectedGroupName: " + selectedGroupName);
      setSelectedGroupName(selectedGroup.name);

      // Find the names of the domains with the provided IDs
      const domainNames = groupDomainid.map(domainId => {
        const domain = domains.find(domain => domain._id === domainId);
        return domain ? domain.domainName : null;
      }).filter(Boolean);

      // console.log(domainNames);

      setGroupDomains(domainNames);
      // setSelectedGroup(groupId);
    } else {
      console.log("Selected group not found");
    }
  };
  //end



  //Handle add new group
  const handleAddGroup = () => {
    let array = [...groups];
    const addNew = { name: newGroupName, description: "", domainIds: [] };
    array.push(addNew);
    setGroups(array);
    setNewGroupName('');
    addGroup();
    setAddGroupMode(false);
  }
  //end

  // START Get Main Page Data
  const getGroups = async () => {
    setLoadingIndicatorActive(true);
    try {
      const response = await axiosPrivate.post(`/api/v1/production/groups/get`, {}, { headers: { 'Content-Type': 'application/json' } });
      if (response.data.success) {
        let allGroupsInitial = response.data.data.allGroups;
        let allDomainsInitial = response.data.data.allDomains;
        const filteredDomains = allDomainsInitial.filter(domain => !domain.groupId);
        setDomains(allDomainsInitial);
        setFilteredDomains(filteredDomains)
        setGroups(allGroupsInitial);
        if (allGroupsInitial.length > 0) {
          if (selectedGroupId == ""){
            setAddGroupMode(false);
            setSelectedGroupId(allGroupsInitial[0]._id);
            setSelectedGroupName(allGroupsInitial[0].name);

            // Find the names of the domains with the provided IDs
            const domainNames = allGroupsInitial[0].domainIds.map(domainId => {
              const domain = allDomainsInitial.find(domain => domain._id === domainId);
              return domain ? domain.domainName : null;
            }).filter(Boolean);

            setGroupDomains(domainNames);
          } else {
            for (var i = 0; i < allGroupsInitial.length; i++){
              if (selectedGroupId == allGroupsInitial[i]._id){
                // Find the names of the domains with the provided IDs
                const domainNames = allGroupsInitial[i].domainIds.map(domainId => {
                  const domain = allDomainsInitial.find(domain => domain._id === domainId);
                  return domain ? domain.domainName : null;
                }).filter(Boolean);

                setGroupDomains(domainNames);
                break;
              }
            }
          }
        } else {
          setAddGroupMode(true);
          setSelectedGroupId("");
          setSelectedGroupName("");
          selectedGroupDomains([]);
        }
        
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingIndicatorActive(false);
    }
  };

  const handleEditGroup = async () => {
    try {
      const response = await axiosPrivate.post(`/api/v1/production/groups/edit-one`, {
        groupIdToEdit: selectedGroupId,
        domainIds: selectedDomains
      });
      if (response.data.success) {
        console.log("Group edited successfully:", response.data.data);
      } else {
        console.error("Failed to edit group:", response.data.message);
      }
    } catch (error) {
      console.error("Error editing group:", error);
    }
  };



  //START ADD NEW GROUP
  const addGroup = async () => {
    setLoadingIndicatorActive(true);
    try {
      const response = await axiosPrivate.post(`/api/v1/production/groups/add-one`, {
        name: newGroupName,
        description: "",
        domainIds: []
      },
        { headers: { 'Content-Type': 'application/json' } });
      if (response.data.success) {
        console.log("success");
        getGroups();
      } else {
        console.log("Failure");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingIndicatorActive(false);
    }
  }
  //end


  useEffect(() => {
    if (loggedIn) {
      getGroups();
    } else {
      navigate("/login");
    }
  }, [loggedIn]);

  return (
    <div className="m-2 p-2 md:p-10 bg-white rounded-3xl dark:text-gray-200 dark:bg-secondary-dark-bg">
      <Header category="Production" title="Groups" />
      <CustomLoadingIndicator isActive={loadingIndicatorActive} />


      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {/* Left component */}
        <div>
          <GroupsDomainCard
            domains={filteredDomains}
            selectedDomains={selectedDomains}
            toggleDomainSelection={toggleDomainSelection}
          />
        </div>

        {/* Action buttons (in the middle) */}
        <div>
          <GroupsActionButtons
            handleAddAll={handleAddAll}
            handleRemoveAll={handleRemoveAll}
            handleAddSelected={handleAddSelected}
            handleRemoveSelected={handleRemoveSelected}
          />
        </div>

        {/* Right component */}
        <div>
          {/* Your other content */}
          <GroupsGroupCard
            addGroupMode={addGroupMode}
            newGroupName={newGroupName}
            currentColor={currentColor}
            selectedGroup={selectedGroupId}
            groups={groups}
            handleChangeGroup={handleChangeGroup}
            setNewGroupName={setNewGroupName}
            setAddGroupMode={setAddGroupMode}
            handleAddGroup={handleAddGroup}
            groupDomains={groupDomains}
            selectedGroupDomains={selectedGroupDomains}
            toggleGroupDomainSelection={toggleGroupDomainSelection}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductionGroups;