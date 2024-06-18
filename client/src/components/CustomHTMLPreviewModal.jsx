import React from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useStateContext } from '../contexts/ContextProvider';

import { modalInitialStyle } from '../data/buildData';
const CustomHTMLPreviewModal = ({ open, handleClose, fullHTML }) => {
  const {currentColor} = useStateContext();

  const stripHTMLFromHTMLTags = (html) => {
    // remove starting html and/or doctype tags
    // remove ending html tag
    
    return html
  }
  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          ...modalInitialStyle,
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: 4,
          width: 800
        }}
      >
        {/* Render the HTML string as dangerously set inner HTML */}
        <div dangerouslySetInnerHTML={{ __html: stripHTMLFromHTMLTags(fullHTML) }} style={{ marginBottom: '20px', overflow: 'auto' }} /> 

        {/* Confirm/Close Button */}
        <button
            type="button"
            onClick={handleClose}
            style={{ backgroundColor: currentColor, color: "white", borderRadius: "10px" }}
            className={`text p-3 hover:drop-shadow-xl hover:bg-light-gray`}
        >
            Confirm
        </button>
      </Box>
    </Modal>
  );
};

export default CustomHTMLPreviewModal;
