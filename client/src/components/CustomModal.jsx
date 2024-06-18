import React, { useState } from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import FormControlLabel from '@mui/material/FormControlLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import { useStateContext } from '../contexts/ContextProvider';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';


import { modalInitialStyle, themeColorsUsable } from '../data/buildData';
import { ListItemText } from '@mui/material';
const CustomModal = ({ open, handleClose, elements, confirmFunction, confirmText, additionalConfirmFunction, additionalConfirmText }) => {
    const { currentColor} = useStateContext();
    const [showPassword, setShowPassword] = useState({
        whmApiKey: false,
        cPanelApiKey: false,
        whmPassword: false,
        cPanelPassword: false,
        // Add other password fields as needed
    });
    const handleClickShowPassword = (field) => {
        setShowPassword({ ...showPassword, [field]: !showPassword[field] });
    };

    const renderElement = (element) => {
        switch (element.type) {
            case 'title':
                return (
                    <Typography {...element.props} variant="h6" component="h2">
                        {element.props.label}
                    </Typography>
                );
            case 'description':
                return (
                    <Typography {...element.props} sx={{ mt: 2 }}>
                        {element.props.label}
                    </Typography>
                );
            case 'inputField':
                return (
                    <FormControl sx={{ m: 1, width: "100%" }}>
                        <TextField
                            {...element.props}
                            required={element.props.required}
                            error={element.props.error} // Add this line
                            helperText={element.props.helperText} // Add this line
                        />
                    </FormControl>
                );
            case 'checkbox':
                return (
                    <FormControlLabel
                        control={<Checkbox {...element.props} />}
                        label={element.props.label}
                    />
                );
            case 'select':
                return (
                    <FormControl sx={{ m: 1, width: "100%" }}>
                        <InputLabel id={`${element.props.name}-label`}>{element.props.label}</InputLabel>
                        <Select
                            labelId={`${element.props.name}-label`}
                            {...element.props}
                        >
                            {element.options.map(option => element.props.multiple ? (
                                <MenuItem key={option.value} value={option.value}>
                                    <Checkbox checked={element.props.value.indexOf(option.value) > -1} />
                                    <ListItemText primary={option.label} />
                                </MenuItem>
                            ) : (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                );
            case 'file':
                return (
                    <FormControl sx={{ m: 1, width: "100%" }}>
                        <input type="file" {...element.props} value={element.value} />
                    </FormControl>
                );
            case 'passwordField':
                return (
                    <FormControl sx={{ m: 1, width: "100%" }}>
                        <TextField
                            {...element.props}
                            type={showPassword[element.props.name] ? 'text' : 'password'}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => handleClickShowPassword(element.props.name)}
                                            edge="end"
                                        >
                                            {showPassword[element.props.name] ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            required={element.props.required}
                            error={element.props.error}
                            helperText={element.props.helperText}
                        />
                    </FormControl>
                );
                case 'datepicker':
                    return (
                      <FormControl sx={{ m: 1, width: '100%' }}>
                        <DatePicker
                          label={element.props.label}
                          value={element.props.value}
                          onChange={(newValue) => {
                            element.props.onChange(newValue);
                          }}
                          renderInput={(params) => <TextField {...params} {...element.props.renderInput} />}
                        />
                      </FormControl>
                    );


            default:
                return null;
        }
    };

    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={{
                    ...modalInitialStyle,
                    maxHeight: '90vh', // Set a maximum height
                    overflowY: 'auto', // Enable vertical scrolling
                    padding: 4, // Add padding inside the box
                }} >
                {elements.map((element, index) => (
                    <div key={index}>{renderElement(element)}</div>
                ))}
                <Box className='flex-wrap mt-5' >
                    <div className='flex justify-between'>
                        <Button color='secondary' onClick={handleClose}>Cancel</Button>
                        <div>
                            <button
                                type="button"
                                onClick={confirmFunction}
                                style={{ backgroundColor: currentColor, color: "white", borderRadius: "10px" }}
                                className={`text p-3 hover:drop-shadow-xl hover:bg-light-gray`}
                            >
                                {confirmText || 'Confirm'}
                            </button>
                            {additionalConfirmFunction ? 
                                <button
                                    type="button"
                                    onClick={additionalConfirmFunction}
                                    style={{ backgroundColor: themeColorsUsable.green, color: "white", borderRadius: "10px" }}
                                    className={`text p-3 hover:drop-shadow-xl hover:bg-light-gray ml-2`}
                                >
                                    {additionalConfirmText || 'Confirm'}
                                </button> : null
                            }
                        </div>
                    </div>
                </Box>
            </Box>
        </Modal>
    );
};

export default CustomModal;
