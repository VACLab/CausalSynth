import React, { useState, useRef, useEffect, useContext } from 'react';
import { Handle, Position } from 'reactflow';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import TextField from '@mui/material/TextField';
import EdgesContext from './EdgesContext';

import ReadOnlyTextField from './ReadOnlyTextField'; // Import the ReadOnlyTextField component

const ColorPickerNode = ({ id, data, onDelete, onUpdate }) => {
  const { edges } = useContext(EdgesContext);

  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [nodeName, setNodeName] = useState(data.label);
  const [variableType, setVariableType] = useState(data.type || 'categorical'); // Initialize from data.type
  const colorInputRef = useRef(null);
  const [additionalInputValue, setAdditionalInputValue] = useState('');
  const [status, setStatus] = useState('');
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    setIsClicked(true);
    // Set a timeout to remove the 'clicked' class after the animation
    setTimeout(() => {
      setIsClicked(false);
    }, 200); // The duration here should match the CSS transition time
  };
  useEffect(() => {
    const hasIncomingEdges = edges.some((edge) => edge.target === id);
    const newStatus = hasIncomingEdges ? 'Dependent' : 'Independent';
    if (newStatus !== status) {
      setStatus(newStatus);
      // Handle the change from Independent to Dependent
      if (newStatus === 'Dependent') {
        if (variableType === 'categorical') {
          onUpdate(id, { probabilities: undefined });
        } else if (variableType === 'numerical') {
          onUpdate(id, {
            discrete: undefined,
            rangeType: undefined,
            range: undefined,
          });
        }
      } else if (newStatus === 'Independent') {
        onUpdate(id, { formula: undefined });
      }
    }
    // Only update type if it's not already set
    if (onUpdate && !data.type) {
      onUpdate(id, { type: 'categorical' });
    }
  }, [id, edges, onUpdate, variableType, status]);
  const handleAdditionalInputChange = (event) => {
    setAdditionalInputValue(event.target.value);
    // Update logic for the additional field if necessary
  };

  const handleDelete = (event) => {
    // Use onDelete prop directly instead of data.onDelete
    event.stopPropagation(); // Prevent the node from being selected when the delete button is clicked

    if (onDelete) {
      onDelete(id);
    }
  };
  const independentColor = '#2979FF'; // A shade of blue
  const dependentColor = '#FF7043'; // A shade of orange

  const handleColorChange = (event) => {
    const newColor = event.target.value;
    setBgColor(newColor);
    if (onUpdate) {
      onUpdate(id, { color: newColor });
    }
  };

  const handleNameChange = (event) => {
    const newName = event.target.value;
    setNodeName(newName);
    if (onUpdate) {
      onUpdate(id, { label: newName });
    }
  };

  const renderStatusRow = () => (
    <div style={statusRowStyle}>
      <span style={statusLabelStyle}>Status</span>
      <span
        style={{
          ...statusTextStyle,
          color: status == 'Dependent' ? dependentColor : independentColor,
        }}
      >
        {status}
      </span>{' '}
      {/* or "Independent" */}
    </div>
  );

  const handleTypeChange = (event) => {
    const newType = event.target.value;
    setVariableType(newType);

    if (onUpdate) {
      let newData = { type: newType };

      if (status === 'Independent') {
        if (newType === 'categorical') {
          newData = {
            ...newData,
            formula: undefined,
            discrete: undefined,
            rangeType: undefined,
            range: undefined,
          };
        } else if (newType === 'numerical') {
          newData = {
            ...newData,
            categories: undefined,
            probabilities: undefined,
            discrete: false,
            rangeType: 'Range',
          };
        }
      } else if (status === 'Dependent') {
        if (newType === 'numerical') {
          newData = { ...newData, categories: undefined };
        }
      }

      onUpdate(id, newData);
    }
  };

  // Simulate a click on the native color input when the custom color indicator is clicked
  const handleColorIndicatorClick = (e) => {
    e.stopPropagation();
    colorInputRef.current.click();
  };
  const deleteButtonStyle = {
    boxShadow: '0px 3px 10px rgba(0, 0, 0, 0.2)', // Make sure the shadow is visible    minWidth: '35px', // Remove width and height since the Button component has its own padding
    borderRadius: '50%',
    margin: '0 0 0 auto', // This will push the button to the right side of a flex container
  };

  // Container for the color picker and delete button
  const colorAndDeleteContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between', // This will push the color picker to the left and the delete button to the right
    marginBottom: '8px', // Adjust to shift up
    marginLeft: '-2px', // Adjust to shift up
  };
  const statusRowStyle = {
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px',
    fontFamily: '"Arial", sans-serif',
    marginTop: '0px', // Adjust to shift up
    marginBottom: '4px', // Adjust to shift up
  };

  const statusLabelStyle = {
    fontWeight: '800',
    marginRight: '5px', // Space between "Status:" and the status text
    marginBottom: '8px',
  };

  const statusTextStyle = {
    fontWeight: '800',
    marginRight: '20px', // Space between "Status:" and the status text
    marginBottom: '8px',
  };

  const nodeStyle = {
    boxShadow: '0px 6px 15px rgba(0, 0, 0, 0.2)', // Increase the values for a deeper shadow
    backgroundColor: '#FFFFFF',
    padding: '10px', // Adjust padding to shift elements up
    borderRadius: '8px',
    border: '1px solid #333',
    fontFamily: '"Arial", sans-serif',
    fontWeight: '400',
    color: '#333',
    minWidth: '223px',
    maxWidth: '223px', // Adjust this value to set the maximum width of the node
    maxHeight: '324px', // Adjust this value to set the maximum height of the node
  };

  const labelStyle = {
    margin: '0 0 8px 0',
    fontSize: '14px',
    fontWeight: '500',
    textAlign: 'left',
    color: '#333',
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    marginBottom: '10px',
    boxSizing: 'border-box',
    border: '1px solid #ccc',
    borderRadius: '4px',
  };
  const nodeContentStyle = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
    paddingLeft: '11.5px', // Adjust this value to shift right
    paddingTop: '13px', // Adjust this value to shift down
  };

  const handleLabelStyle = {
    position: 'absolute',
    width: '83.5%',
    fontSize: '8px', // Set the font size to your preference
    textAlign: 'center',
    top: '-25px', // Adjust this to place the "Out" label correctly
    color: '#333',
    // transform: 'rotate(-90deg)', // Rotate 90 degrees counterclockwise
    left: '300px',
    fontWeight: 'bold',
    userSelect: 'none', // Prevents text selection
  };
  const leftLabelStyle = {
    ...handleLabelStyle,
    fontSize: '8.8px', // Set the font size to your preference

    left: '-90.5px', // Adjust this to position the "Out" label correctly
    top: '48.5%', // Vertically center the label
    // transform: 'translateY(-50%) rotate(-90deg)', // Center and rotate the label
  };

  const rightLabelStyle = {
    ...handleLabelStyle,
    left: '128px', // Adjust this to position the "In" label correctly
    top: '48.5%', // Vertically center the label
    // transform: 'translateY(-50%) rotate(-90deg)', // Center and rotate the label
  };
  const colorIndicatorStyle = {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    backgroundColor: bgColor, // Use bgColor for the background
    border: '2px solid #333', // Solid border with a contrasting color
    cursor: 'pointer',
    display: 'inline-block',
    marginLeft: '12px', // Increase the left margin to shift the color picker to the right
  };

  // Hide the default color picker input appearance
  const hiddenColorInputStyle = {
    opacity: 0, // make the input invisible but clickable
    position: 'absolute',
    zIndex: 100000000, // set a positive z-index so it's above other elements
    width: '20px', // increase the size a bit
    height: '20px',
    border: 'none',
    padding: '0',
    margin: '0',
  };

  const additionalRowStyle = {
    maxWidth: '200px', // Set your desired width here

    display: 'flex',
    flexDirection: 'column',
    marginBottom: '10px',
  };

  const additionalInputStyle = {
    ...inputStyle,
    marginTop: '5px',
  };

  // Render additional row based on variable type
  const renderAdditionalRow = () => {
    let label = 'Formula'; // Default label

    if (status == 'Independent') {
      if (variableType === 'numerical') {
        label = 'Range / Formula';
      } else if (variableType === 'categorical') {
        label = 'Categories';
      }
    }

    return (
      <div style={{ ...additionalRowStyle }}>
        <ReadOnlyTextField
          value=""
          label={label}
          placeholder="Define on the right"
        />
      </div>
    );
  };

  return (
    <div
      className={`nodeClass ${isClicked ? 'clicked' : ''}`}
      onClick={handleClick}
    >
      <div style={nodeStyle}>
        <div style={leftLabelStyle}>In</div>
        <Handle
          type="target"
          position={Position.Left}
          id={`${id}-right`}
          style={{
            zIndex: 100,
            borderRadius: 100,
            backgroundColor: '#e0f2f1',
            borderColor: 'black',
          }}
        />
        <div style={nodeContentStyle}>
          <TextField
            label="Name (single-word format)"
            variant="outlined"
            value={nodeName}
            onChange={handleNameChange}
            fullWidth
            margin="dense" // Adjust margin to shift up
            sx={{
              maxWidth: '200px', // Set your desired width here
              '& .MuiInputLabel-root': { fontWeight: 'bold' }, // Bold label
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: 'grey' }, // Custom border color
                '&:hover fieldset': { borderColor: 'grey' }, // Custom hover border color
                '&.Mui-focused fieldset': { borderColor: 'grey' }, // Custom focused border color
              },
              '& .MuiInputBase-root': {
                // Target the input base where the background is applied
                backgroundColor: 'white', // Set the background color to white
              },
            }}
          />
          <TextField
            select
            label="Type"
            value={variableType}
            onChange={handleTypeChange}
            SelectProps={{
              native: true,
            }}
            fullWidth
            margin="dense" // Adjust margin to shift up
            sx={{
              marginTop: '16px',
              maxWidth: '200px', // Set your desired width here
              '& .MuiInputBase-root': {
                // Target the input base where the background is applied
                backgroundColor: 'white', // Set the background color to white
              },
              '& .MuiInputLabel-root': { fontWeight: 'bold' }, // Bold label
            }}
          >
            <option value="categorical">Categorical</option>
            <option value="numerical">Numerical</option>
          </TextField>
          {renderAdditionalRow()}
          {renderStatusRow()}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '10px',
            }}
          >
            <div style={labelStyle}>Color</div>
            <div style={colorAndDeleteContainerStyle}>
              <div
                style={colorIndicatorStyle}
                onClick={(e) => {
                  handleColorIndicatorClick(e);
                }}
              ></div>
              <IconButton
                onClick={handleDelete}
                color="error"
                aria-label="delete"
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%', // Ensures the button is round
                  marginLeft: '87px', // Pushes the button to the right
                  color: 'white', // Color of the icon
                  backgroundColor: '#f44336', // Default red background
                  '&:hover': {
                    backgroundColor: '#d32f2f', // Darken the color slightly on hover
                  },
                  // If you want the ripple effect with a specific color (optional)
                  '& .MuiTouchRipple-child': {
                    backgroundColor: 'white', // Ripple color
                  },
                }}
              >
                <DeleteIcon
                  sx={{
                    fontSize: '1rem',
                  }}
                />
              </IconButton>
            </div>
          </div>{' '}
          <input
            ref={colorInputRef}
            type="color"
            value={bgColor}
            onChange={handleColorChange}
            style={hiddenColorInputStyle}
          />
        </div>
        <Handle
          type="source"
          position={Position.Right}
          style={{ zIndex: 100, borderRadius: 100 }}
        />
        <div style={rightLabelStyle}>Out</div>
      </div>
    </div>
  );
};

export default ColorPickerNode;
