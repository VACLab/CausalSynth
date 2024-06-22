import React from 'react';
import { TextField } from '@mui/material';

const ReadOnlyTextField = ({ value, label, placeholder }) => {
  return (
    <TextField
      value={value}
      label={label}
      placeholder={placeholder}
      InputProps={{
        readOnly: true,
      }}
      variant="outlined"
      fullWidth
      margin="normal"
    />
  );
};

export default ReadOnlyTextField;
