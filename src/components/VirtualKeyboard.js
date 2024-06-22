import React from 'react';
import { Button, Typography, Box, Paper } from '@mui/material';

function VirtualKeyboard({ variables, formula, setFormula }) {
  // Function to add variable, operator, or method to the current formula
  const addToFormula = (value) => {
    setFormula(formula + value);
  };

  // Function to clear the formula
  const handleClear = () => {
    setFormula('');
  };

  const formatNumpyMethod = (method) => {
    const regex = /\(([^)]+)\)/;
    const parts = method.split(regex);
    return (
      <>
        {parts[0]}(<em>{parts[1]}</em>)
      </>
    );
  };

  // Helper function to determine text color based on background color
  const getTextColor = (backgroundColor) => {
    const color = backgroundColor.slice(1);
    const rgb = parseInt(color, 16); // convert rrggbb to decimal
    const red = (rgb >> 16) & 0xff; // extract red
    const green = (rgb >> 8) & 0xff; // extract green
    const blue = (rgb >> 0) & 0xff; // extract blue
    const brightness = 0.299 * red + 0.587 * green + 0.114 * blue; // per ITU-R BT.709
    return brightness > 156 ? '#000' : '#fff'; // change threshold as necessary
  };

  return (
    <Paper
      elevation={3}
      sx={{
        padding: '16px',
        marginTop: '18px',
        marginBottom: '20px',
        backgroundColor: 'white',
        maxWidth: '100%',
        width: 'auto',
        fontFamily: 'Cascadia Code, monospace',
      }}
    >
      <Box className="variables-section" sx={{ marginBottom: '10px' }}>
        {variables && variables.length > 0 ? (
          <>
            <Typography variant="h6" component="div" gutterBottom>
              Incoming Variables
            </Typography>
            {variables.map((variable, index) => (
              <Button
                key={index}
                variant="contained"
                onClick={() => addToFormula(`${variable.label} `)}
                sx={{
                  margin: '5px',
                  borderRadius: '20px',
                  textTransform: 'none',
                  minWidth: '80px',
                  minHeight: '40px',
                  backgroundColor: variable.color,
                  color: getTextColor(variable.color),
                  fontFamily: 'Cascadia Code, monospace',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: variable.color,
                  },
                }}
              >
                {variable.label || 'empty_variable_name'}
              </Button>
            ))}
          </>
        ) : (
          <Typography variant="h6" component="div" gutterBottom>
            No incoming variables
          </Typography>
        )}
      </Box>

      <Box className="numpy-methods-section" sx={{ marginBottom: '10px' }}>
        <Typography variant="h6" component="div" gutterBottom>
          Numpy Methods
        </Typography>
        {[
          { method: 'np.clip(term, min, max)', color: '#f57c00' },
          { method: 'np.random.normal(mean, std)', color: '#f57c00' },
          { method: 'np.random.uniform(low, high)', color: '#f57c00' },
        ].map((method, index) => (
          <Button
            key={index}
            variant="contained"
            onClick={() =>
              addToFormula(
                `${
                  method.method === 'np.clip(term, min, max)'
                    ? 'np.clip(0, 0, 0)'
                    : method.method === 'np.random.normal(mean, std)'
                    ? 'np.random.normal(0, 0)'
                    : 'np.random.uniform(0, 0)'
                } `
              )
            }
            sx={{
              margin: '5px',
              borderRadius: '20px',
              textTransform: 'none',
              minWidth: '80px',
              minHeight: '40px',
              backgroundColor: method.color,
              color: getTextColor(method.color),
              fontFamily: 'Cascadia Code, monospace',
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: method.color,
              },
            }}
          >
            <span style={{ fontWeight: 'bold' }}>
              {formatNumpyMethod(method.method)}
            </span>
          </Button>
        ))}
      </Box>

      <Box className="operators-section" sx={{ marginBottom: '10px' }}>
        <Typography variant="h6" component="div" gutterBottom>
          Operators
        </Typography>
        {[
          '+',
          '-',
          '*',
          '/',
          '()',
          '==',
          '<',
          '>',
          '<=',
          '>=',
          'if',
          'and',
          'or',
          'else',
          'int()',
        ].map((operator, index) => (
          <Button
            key={index}
            variant="contained"
            onClick={() => addToFormula(`${operator} `)}
            sx={{
              margin: '5px',
              borderRadius:
                operator === 'else' ||
                operator === 'and' ||
                operator === 'or' ||
                operator === '==' ||
                operator === '<=' ||
                operator === '>=' ||
                operator === 'int()' ||
                operator === 'if'
                  ? '20px'
                  : '50%',
              textTransform: 'none',
              minWidth:
                operator === 'else' || operator === 'and'
                  ? '64px'
                  : operator === 'or' ||
                    operator === '==' ||
                    operator === '<=' ||
                    operator === '>=' ||
                    operator === 'int()'
                  ? '43px'
                  : '40px',
              minHeight: '40px',
              backgroundColor: '#6699CC',
              color: '#fff',
              '&:hover': {
                backgroundColor: '#2979FF',
              },
            }}
          >
            <Typography
              component="span"
              sx={{
                position: 'relative',
                fontFamily: 'Cascadia Code, monospace',
                fontSize: 15,
                fontWeight: 'bold',
                ...(operator === '*' && { top: '0px' }),
              }}
            >
              {operator}
            </Typography>
          </Button>
        ))}
      </Box>
      <Box className="controls">
        <Button
          variant="outlined"
          onClick={handleClear}
          sx={{ margin: '5px', fontFamily: 'Cascadia Code, monospace' }}
        >
          Clear
        </Button>
      </Box>
    </Paper>
  );
}

export default VirtualKeyboard;
