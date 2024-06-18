import React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';

const GroupsDomainCard = ({ availableDomains, domains, selectedDomains, toggleDomainSelection }) => {
    if (!domains || domains.length === 0) {
      return (
        <Card sx={{
          padding: 4, 
          maxHeight: '90vh', // Set a maximum height
          overflowY: 'auto', // Enable vertical scrolling
          }}>
          <CardHeader title="Domains" />
          <List>
            <ListItem>
              <ListItemText primary="No domains available" />
            </ListItem>
          </List>
        </Card>
      );
    }
  
    return (
      <Card sx={{
        padding: 4, 
        maxHeight: '90vh', // Set a maximum height
        overflowY: 'auto', // Enable vertical scrolling
        }}>
        <CardHeader title="Domains" />
        <List>
          {domains.map((domain) => (
            <ListItem
              key={domain._id}
              button
              selected={selectedDomains.includes(domain._id)}
              onClick={() => toggleDomainSelection(domain._id)}
            >
              <ListItemText primary={domain.domainName} />
            </ListItem>
          ))}
        </List>
      </Card>
    );
  };
  
  export default GroupsDomainCard;
  