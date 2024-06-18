import React from 'react';
import { LinearProgress, Box, Typography } from '@mui/material';
import {preWarmUpSteps} from '../data/buildData';

const ProgressBar = ({ domain }) => {
  

  const completedSteps = preWarmUpSteps.filter(step => domain[step.key]).length;
  const totalSteps = preWarmUpSteps.length;
  const progress = (completedSteps / totalSteps) * 100;

  const getProgressColor = () => {
    if (progress < 33) return '#ff6347'; // Red
    if (progress < 66) return '#ffa500'; // Orange
    if (progress < 90) return '#ffd700'; // Yellow
    return '#008000'; // Green
  };

  const nextStep = preWarmUpSteps.find(step => !domain[step.key]);

  return (
    <Box sx={{ width: '100%' }}>
      <LinearProgress 
        variant="determinate" 
        value={progress}
        sx={{ 
          height: 10, // Increase height for a bolder bar
          backgroundColor: '#e0e0e0',
          '& .MuiLinearProgress-bar': {
            backgroundColor: getProgressColor(),
          }
        }} 
      />
      <Typography variant="body1" color="textSecondary" sx={{ mt: 1, mb: 1 }}>
        {nextStep ? `Next Step: ${nextStep.label}` : 'Domain Setup Complete'}
      </Typography>
    </Box>
  );
};

export default ProgressBar;
