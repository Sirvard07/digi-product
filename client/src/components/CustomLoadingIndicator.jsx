import React from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

const CustomLoadingIndicator = ({ isActive }) => {
    if (!isActive) return null;

    return (
        <Box sx={{
            display: "flex",
            justifyContent: 'center',
            alignItems: 'center',
            position: "fixed",
            height: "100%",
            width: "100%",
            top: 0,
            left: 0,
            backgroundColor: "rgba(255,255,255,0.5)",
            zIndex: 9999,
            paddingTop: "10px"
        }}>
            <CircularProgress />
        </Box>
    );
};

export default CustomLoadingIndicator;
