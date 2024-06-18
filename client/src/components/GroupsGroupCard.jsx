import React from 'react';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { MdCancel, MdSave, MdAdd } from 'react-icons/md';
import CustomTooltipComponent from './CustomTooltipComponent'; // Import your custom tooltip component
import Header from './Header';
import { Card, CardHeader, List, ListItem, ListItemText } from '@mui/material';

const GroupsGroupCard = ({ 
  addGroupMode, 
  newGroupName, 
  currentColor, 
  selectedGroup, 
  groups, 
  handleChangeGroup, 
  setNewGroupName, 
  setAddGroupMode, 
  handleAddGroup, 
  groupDomains, 
  domainIds, 
  selectedGroupDomains, 
  toggleGroupDomainSelection 
}) => {
  return (

    <div style={{ display: 'flex', alignItems: 'center' }}>
      <Card sx={{
        padding: 4, 
        maxHeight: '90vh', // Set a maximum height
        overflowY: 'auto', // Enable vertical scrolling
        }}>
        <CardHeader title="Groups" />
        {addGroupMode ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <TextField
                label="New Group Name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                style={{ marginRight: '8px', width: '155px' }}
              />
              <CustomTooltipComponent
                icon={MdCancel}
                tooltipText="Cancel"
                onClick={() => setAddGroupMode(false)}
                style={{ marginRight: '8px' }}
                currentColor={currentColor}
              />
              <CustomTooltipComponent
                icon={MdSave}
                tooltipText="Save"
                onClick={handleAddGroup}
                currentColor={currentColor}
                disabled={!newGroupName}
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Select
                  value={selectedGroup || ''}
                  onChange={(e) => handleChangeGroup(e.target.value)}
                  style={{ marginRight: '8px', width: '200px' }}
                >
                  {groups.map((group) => (
                    <MenuItem key={group._id} value={group._id}>{group.name}</MenuItem>
                  ))}
                </Select>
                <CustomTooltipComponent
                  icon={MdAdd}
                  tooltipText="Add New Group"
                  onClick={() => setAddGroupMode(true)}
                  currentColor={currentColor}
                />
              </div>
              <div>
                <List>
                  {groupDomains.length < 1 ? (
                    <ListItem>
                      <ListItemText primary="No domains available" />
                    </ListItem>
                  ) : (
                    groupDomains.map((domain) => (
                      <ListItem 
                        key={domain}
                        button
                        selected={selectedGroupDomains.includes(domain)}
                        onClick={() => toggleGroupDomainSelection(domain)}>
                        <ListItemText primary={domain} />
                      </ListItem>
                    ))
                  )}
                </List>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default GroupsGroupCard;
