
import React from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

const GroupsActionButtons = ({ handleAddAll, handleRemoveAll, handleAddSelected, handleRemoveSelected }) => {
  return (
    <Stack direction="column" spacing={2}>
      <Button onClick={handleAddAll}>Add All</Button>
      <Button onClick={handleRemoveAll}>Remove All</Button>
      <Button onClick={handleAddSelected}>Add Selected</Button>
      <Button onClick={handleRemoveSelected}>Remove Selected</Button>
    </Stack>
  );
};

export default GroupsActionButtons;