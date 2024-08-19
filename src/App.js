import React, { useState, useMemo, useEffect, useReducer } from 'react';
import ReactFlow, {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
} from 'reactflow';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import 'reactflow/dist/style.css';
import axios from 'axios';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CircularProgress from '@mui/material/CircularProgress';
import DatasetIcon from '@mui/icons-material/Dataset';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import { styled } from '@mui/system';
import CsvViewer from './components/CsvViewer';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import { MenuItem } from '@mui/material';
import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CodeIcon from '@mui/icons-material/Code';
import {
  Box,
  Button,
  Typography,
  Paper,
  TextField,
  FormControlLabel,
  Checkbox,
  FormGroup,
  FormControl,
  RadioGroup,
  Radio,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
  Tooltip,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import EdgesContext from './components/EdgesContext';
import VirtualKeyboard from './components/VirtualKeyboard';
import PopUp from './components/PopUp';
import ColorPickerNode from './components/ColorPickerNode';
import PythonEditor from './components/PythonEditor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-python';
import 'prismjs/themes/prism.css';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import './App.css';

const theme = createTheme({
  // Your custom theme goes here
});

const App = () => {
  const [isPopUpOpen, setPopUpOpen] = useState(false);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedIncoming, setSelectedIncoming] = useState([]);
  const [csvData, setCsvData] = useState([]);
  const [selectedOutgoing, setSelectedOutgoing] = useState([]);
  const [counter, setCounter] = useState(0);
  const [rangeStart, setRangeStart] = useState(''); // State to handle the start of the range
  const [rangeEnd, setRangeEnd] = useState(''); // State to handle the end of the range
  const [isDiscrete, setIsDiscrete] = useState(false); // State to handle discrete checkbox
  const [rangeType, setRangeType] = useState('Range'); // State to handle range type selection
  const [probabilities, setProbabilities] = useState(undefined); // State to handle probabilities input
  const [probabilityError, setProbabilityError] = useState(false); // State to handle error state
  const [categories, setCategories] = useState(undefined); // State to handle categories input
  const [categoryError, setCategoryError] = useState(false); // State to handle error state
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const [open, setOpen] = useState(false);
  const [nodeCode, setNodeCode] = useState('');
  const [numSamples, setNumSamples] = useState(100); // Default to 100 samples
  const [jsonModalOpen, setJsonModalOpen] = useState(false);
  const [latestJson, setLatestJson] = useState(null); // State to hold the latest JSON
  const [jsonInput, setJsonInput] = useState('');
  const [jsonDialogOpen, setJsonDialogOpen] = useState(false);
  const [jsonError, setJsonError] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [isCsvViewerOpen, setIsCsvViewerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDataVisOpen, setIsDataVisOpen] = useState(false);
  const [chartOptions, setChartOptions] = useState(null);
  const [columns, setColumns] = useState([]);
  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState('');
  const [chartType, setChartType] = useState('bubble'); // Default chart type
  const [bubbleSize, setBubbleSize] = useState(''); // State for bubble size
  const [colorKey, setColorKey] = useState(''); // State for color key
  const [shouldRenderChart, setShouldRenderChart] = useState(false); // Add this near other useState declarations
  const [echartsCode, setEchartsCode] = useState('');
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChartTypeChange = (event) => {
    setShouldRenderChart(false);
    setChartType(event.target.value);
    if (event.target.value === 'pie') {
      updateChartOptions(xAxis, null);
    } else {
      updateChartOptions(xAxis, yAxis);
    }
  };

  const handleChartOptionsChange = (columns, parsedCsvData) => {
    setColumns(columns);
    setCsvData(parsedCsvData); // Ensure csvData is set here
  };

  const handleXAxisChange = (event) => {
    setShouldRenderChart(false);
    setXAxis(event.target.value);
    if (csvData.length > 0) {
      updateChartOptions(event.target.value, yAxis);
    }
  };

  const handleYAxisChange = (event) => {
    setShouldRenderChart(false);
    setYAxis(event.target.value);
    if (csvData.length > 0) {
      updateChartOptions(xAxis, event.target.value);
    }
  };
  const handleBubbleSizeChange = (event) => {
    setShouldRenderChart(false);
    setBubbleSize(event.target.value);
    if (csvData.length > 0) {
      updateChartOptions(xAxis, yAxis, event.target.value);
    }
  };
  const handleColorkeyChange = (event) => {
    setShouldRenderChart(false);
    setColorKey(event.target.value);
    if (csvData.length > 0) {
      updateChartOptions(xAxis, yAxis, bubbleSize, event.target.value);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    const jsonStructure = transformNodesToJSON(nodes, edges, numSamples);
    setLatestJson(jsonStructure); // Save the generated JSON
    try {
      const response = await axios.post(
        'https://zhehaoww.pythonanywhere.com/generate-data',
        jsonStructure,
        {
          responseType: 'blob', // Important for downloading files
        }
      );

      const fileURL = window.URL.createObjectURL(new Blob([response.data]));
      setFileUrl(fileURL);
      setFileName(
        fileName === ''
          ? 'synthetic_data.csv'
          : fileName.endsWith('.csv')
          ? fileName
          : `${fileName + '.csv'}`
      );
    } catch (error) {
      let errorMessage = 'An unknown error occurred. Please try again.';

      if (error.response && error.response.data instanceof Blob) {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const errorData = JSON.parse(reader.result);
            const boldedError = `<strong>${
              errorData.error.endsWith('.')
                ? errorData.error
                : errorData.error + '.'
            }</strong> Please review your JSON configuration and also ensure a stable network connection.`;
            setErrorMessage(boldedError);
          } catch (e) {
            setErrorMessage(
              'Failed to parse error response. Please ensure stable network connection.'
            );
          }
          setErrorDialogOpen(true);
        };
        reader.readAsText(error.response.data);
      } else if (
        error.response &&
        error.response.data &&
        typeof error.response.data === 'string'
      ) {
        const errorData = { error: error.response.data };
        const boldedError = `<strong>${errorData.error}</strong> Please check your JSON configuration and ensure the backend is reachable.`;
        setErrorMessage(boldedError);
        setErrorDialogOpen(true);
      } else {
        const errorData = { error: 'Unknown error' };
        const boldedError = `<strong>${errorData.error}</strong> Please check your JSON configuration and ensure the backend is reachable.`;
        setErrorMessage(boldedError);
        setErrorDialogOpen(true);
      }
    } finally {
      setLoading(false);
    }
    setShouldRenderChart(false);
    setXAxis('');
    setYAxis('');
    setChartType('bubble');
    setBubbleSize('');
    setColorKey('');
  };

  const handleJsonModalOpen = () => {
    setJsonModalOpen(true);
  };

  const handleJsonModalClose = () => {
    setJsonModalOpen(false);
  };

  const handleJsonDialogOpen = () => {
    setJsonDialogOpen(true);
  };

  const handleJsonDialogClose = () => {
    setJsonDialogOpen(false);
    setJsonError('');
  };
  const openCodeModal = () => {
    const options = getEChartsOptions(eChartNodes, eChartEdges);
    setEchartsCode(`option = ${JSON.stringify(options, null, 2)}`);
    setIsCodeModalOpen(true);
  };

  const closeCodeModal = () => {
    setIsCodeModalOpen(false);
  };
  const handlePlotClick = () => {
    setShouldRenderChart(false); // Resetting state before rendering the chart
    if (csvData.length > 0) {
      updateChartOptions(xAxis ? xAxis : 'Null', yAxis, bubbleSize, colorKey);
      setShouldRenderChart(true); // Set to true after updating chart options
    }
  };

  const handleJsonGenerate = (jsonInput) => {
    try {
      const parsedJson = JSON.parse(jsonInput);
      const newNodes = jsonToNodes(parsedJson);
      const newEdges = jsonToEdges(parsedJson);
      const { n_samples } = parsedJson;

      // Clear the existing nodes and edges
      setNodes([]);
      setEdges([]);

      // Use a timeout to ensure React Flow updates correctly
      setTimeout(() => {
        // Set the new nodes and edges
        setNodes(newNodes);
        setEdges(newEdges);
        setNumSamples(n_samples); // Update numSamples state with n_samples from JSON

        setJsonError(null); // Clear any previous errors
      }, 0);
      setJsonDialogOpen(false);
    } catch (error) {
      setJsonError(error.message);
    }
  };

  const handleOpenPopUp = () => setPopUpOpen(true);
  const fontStyle = { fontFamily: 'Fira Code, monospace' };
  const boxStyle = {
    border: '1px solid rgba(0, 0, 0, 0.23)',
    borderRadius: '4px',
    padding: '8px',
    backgroundColor: '#fafafa',
  };
  const variableStyle = { color: '#6192D2', fontWeight: 'bold' }; // Blue color for variables and methods
  const commentStyle = { color: '#9575cd' }; // Blue color for variables and methods

  const handleClosePopUp = () => setPopUpOpen(false);

  const handleDeleteNode = (nodeId) => {
    setNodes((prevNodes) => prevNodes.filter((node) => node.id !== nodeId));
    setEdges((prevEdges) =>
      prevEdges.filter(
        (edge) => edge.source !== nodeId && edge.target !== nodeId
      )
    );

    if (selectedNode && selectedNode.id === nodeId) {
      setSelectedNode(null);
      setNodeCode('');
      setSelectedIncoming([]); // Clear incoming nodes
      setSelectedOutgoing([]); // Clear outgoing nodes
      forceUpdate(); // Force re-render if necessary
    }
    if (
      selectedEdge &&
      (selectedEdge.source === nodeId || selectedEdge.target === nodeId)
    ) {
      setSelectedEdge(null);
    }
  };
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const [eChartNodes, setEChartNodes] = useState([]);
  const [eChartEdges, setEChartEdges] = useState([]);
  const downloadFile = (url, fileName) => {
    setIsCsvViewerOpen(true); // Open the CsvViewer modal
  };
  const jsonToNodes = (jsonStructure) => {
    const nodes = [];
    // Determine layers for nodes based on dependencies
    const layers = {};
    const visited = {};

    const determineLayer = (variable) => {
      if (visited[variable]) return layers[variable];
      visited[variable] = true;

      const variableData = jsonStructure.variables[variable];
      if (
        !variableData.dependencies ||
        variableData.dependencies.length === 0
      ) {
        layers[variable] = 0; // Independent variable
      } else {
        const dependencyLayers = variableData.dependencies.map((dep) =>
          determineLayer(dep)
        );
        layers[variable] = Math.max(...dependencyLayers) + 1;
      }
      return layers[variable];
    };

    Object.keys(jsonStructure.variables).forEach((variable) => {
      determineLayer(variable);
    });

    // Group variables by layers
    const layerGroups = Object.entries(layers).reduce(
      (acc, [variable, layer]) => {
        if (!acc[layer]) acc[layer] = [];
        acc[layer].push(variable);
        return acc;
      },
      {}
    );

    // Position nodes based on layers
    let nodeIndex = 0;
    const baseSpacingX = 300; // Base spacing between nodes on the x-axis
    const baseSpacingY = 380; // Base spacing between nodes on the y-axis

    Object.keys(layerGroups).forEach((layer) => {
      const variables = layerGroups[layer];
      const currentX = layer * baseSpacingX;
      const totalHeight = variables.length * baseSpacingY;
      const layerCenterY = totalHeight / 2;

      variables.forEach((variable, index) => {
        const variableData = jsonStructure.variables[variable];
        // Distribute nodes evenly within the layer height
        const currentY = index * baseSpacingY - layerCenterY + baseSpacingY / 2;

        nodes.push({
          id: `node-${
            Object.keys(jsonStructure.variables).indexOf(variable) + 1
          }`,
          type: 'colorPicker',
          position: { x: currentX, y: currentY },
          data: {
            label: variable,
            type: variableData.type,
            formula: variableData.formula,
            categories: Array.isArray(variableData.categories)
              ? variableData.categories.join(', ')
              : variableData.categories,
            probabilities: variableData.probabilities,
            range: variableData.range,
            discrete: variableData.discrete,
            color: '#FFFFFF', // Default color to white
          },
        });

        nodeIndex++;
      });
    });

    // Set the counter to the number of nodes after JSON input
    setCounter(nodes.length);

    return nodes;
  };

  const jsonToEdges = (jsonStructure) => {
    const edges = [];
    const variables = jsonStructure.variables;
    Object.keys(variables).forEach((targetVariable) => {
      const targetData = variables[targetVariable];

      if (targetData.dependencies && targetData.dependencies.length > 0) {
        targetData.dependencies.forEach((sourceVariable) => {
          const sourceNode = Object.keys(variables).find(
            (variable) => variable === sourceVariable
          );
          const targetNode = Object.keys(variables).find(
            (variable) => variable === targetVariable
          );

          if (sourceNode && targetNode) {
            edges.push({
              id: `edge-${sourceNode}-${targetNode}`,
              source: `node-${
                Object.keys(variables).indexOf(sourceVariable) + 1
              }`,
              target: `node-${
                Object.keys(variables).indexOf(targetVariable) + 1
              }`,
              animated: true,
            });
          }
        });
      }
    });
    return edges;
  };

  const initialNodes = useMemo(
    () => [
      {
        id: 'node-1',
        type: 'colorPicker',
        position: { x: 250, y: 5 },
        data: { label: 'your_first_variable' },
      },
    ],
    []
  );
  const getIncomingAndOutgoingEdges = (nodeId, allEdges) => {
    const incoming = allEdges.filter((edge) => edge.target === nodeId);
    const outgoing = allEdges.filter((edge) => edge.source === nodeId);
    return { incoming, outgoing };
  };

  const handleNodeUpdate = (nodeId, newData) => {
    setNodes((prevNodes) =>
      prevNodes.map((node) => {
        if (node.id === nodeId) {
          // This merges existing node data with new data, ensuring all aspects of the node are updated.
          return { ...node, data: { ...node.data, ...newData } };
        }
        return node;
      })
    );
  };
  // Helper function to check if a value is numeric
  const isNumeric = (value) => {
    return !isNaN(value) && !isNaN(parseFloat(value));
  };

  // Function to filter columns based on their values in the first row of csvData
  const filterColumns = (columns, csvData, type) => {
    if (csvData.length === 0) return [];
    const firstRow = csvData[0];

    return columns.filter((col) => {
      const value = firstRow[col.field];
      if (type === 'categorical') {
        return typeof value === 'string';
      } else if (type === 'numerical') {
        return isNumeric(value);
      }
      return true;
    });
  };

  const Placeholder = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: theme.palette.text.secondary,
    textAlign: 'center',
  }));

  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const nodeVariables = selectedIncoming.map((edge) => {
    const sourceNode = nodes.find((node) => node.id === edge.source);
    if (sourceNode) {
      return {
        label: sourceNode.data.label,
        color: sourceNode.data.color || '#FFFFFF', // Default to black if no color is set
      };
    }
    return { label: '', color: '#FFFFFF' }; // Returns empty with default color if no source node is found
  });
  useEffect(() => {
    if (selectedNode) {
      const { incoming, outgoing } = getIncomingAndOutgoingEdges(
        selectedNode.id,
        edges
      );
      setSelectedIncoming(incoming);
      setSelectedOutgoing(outgoing);
      setCategories(JSON.stringify(selectedNode.data.categories || ''));
      setProbabilities(JSON.stringify(selectedNode.data.probabilities || ''));
      setRangeStart(
        selectedNode.data.range
          ? selectedNode.data.range[0] === 0 || selectedNode.data.range[0]
            ? selectedNode.data.range[0]
            : ''
          : ''
      );
      setRangeEnd(
        selectedNode.data.range
          ? selectedNode.data.range[1] === 0 || selectedNode.data.range[1]
            ? selectedNode.data.range[1]
            : ''
          : ''
      );
      setIsDiscrete(selectedNode.data.discrete || false);
      setRangeType(selectedNode.data.rangeType || 'Range');
    }
  }, [edges, selectedNode]);

  useEffect(() => {
    const { eChartNodes, eChartEdges } = transformNodesToECharts(nodes, edges);
    setEChartNodes(eChartNodes);
    setEChartEdges(eChartEdges);
  }, [nodes, edges]);

  const handleAddNode = () => {
    const newNode = {
      id: `node-${counter + 1}`,
      type: 'colorPicker',
      position: {
        x: 300 + 100 * Math.random(),
        y: 60 + 100 * Math.random(),
      },
      data: { label: `new_variable${counter == 0 ? '' : '_' + counter}` },
    };
    setCounter(counter + 1);

    setNodes([...nodes, newNode]);
  };

  const getDependencies = (nodeId, edges, nodes) => {
    return edges
      .filter((edge) => edge.target === nodeId)
      .map((edge) => {
        const sourceNode = nodes.find((node) => node.id === edge.source);
        return sourceNode ? sourceNode.data.label : '';
      });
  };

  const transformNodesToJSON = (nodes, edges, numSamples) => {
    const variables = nodes.reduce((acc, node) => {
      const dependencies = getDependencies(node.id, edges, nodes);

      const variableDetails = {
        type: node.data.type,
        dependencies,
      };

      if (node.data.formula) {
        variableDetails.formula = node.data.formula;
      }

      if (node.data.categories) {
        // Assuming node.data.categories is already an array, no need to parse from JSON
        variableDetails.categories = Array.isArray(node.data.categories)
          ? node.data.categories
          : node.data.categories.split(',').map((item) => item.trim());
      }

      if (node.data.probabilities) {
        // Assuming node.data.probabilities is already an array, no need to parse from JSON
        variableDetails.probabilities = Array.isArray(node.data.probabilities)
          ? node.data.probabilities.map(Number)
          : node.data.probabilities
              .split(',')
              .map((item) => parseFloat(item.trim()));
      }

      if (node.data.range) {
        // Convert range values to numbers
        variableDetails.range = node.data.range.map((value) =>
          parseFloat(value)
        );
      }

      if (node.data.discrete !== undefined) {
        variableDetails.discrete = node.data.discrete;
      }

      acc[node.data.label] = variableDetails;
      return acc;
    }, {});

    return {
      variables,
      n_samples:
        typeof numSamples === 'string' ? parseInt(numSamples, 10) : numSamples,
    };
  };
  const getTextColor = (backgroundColor) => {
    const color = backgroundColor.slice(1);
    const rgb = parseInt(color, 16); // convert rrggbb to decimal
    const red = (rgb >> 16) & 0xff; // extract red
    const green = (rgb >> 8) & 0xff; // extract green
    const blue = (rgb >> 0) & 0xff; // extract blue
    const brightness = 0.299 * red + 0.587 * green + 0.114 * blue; // per ITU-R BT.709
    return brightness > 156 ? '#000' : '#fff'; // change threshold as necessary
  };
  const transformNodesToECharts = (nodes, edges) => {
    const eChartNodes = nodes.map((node) => ({
      id: node.id,
      name: node.data.label,
      symbolSize: 80,
      x: node.position.x,
      y: node.position.y,
      itemStyle: {
        color:
          node.data.color == '#FFFFFF' || !node.data.color
            ? '#4359B9'
            : node.data.color,
      },
      label: {
        color: getTextColor(
          node.data.color == '#FFFFFF' || !node.data.color
            ? '#000000'
            : node.data.color
        ),
      },
    }));

    const eChartEdges = edges.map((edge) => ({
      source: edge.source,
      target: edge.target,
      label: {
        show: false,
      },
    }));

    return { eChartNodes, eChartEdges };
  };

  const handleRangeTypeChange = (event) => {
    setRangeType(event.target.value);
    if (event.target.value === 'Formula') {
      setRangeStart('');
      setIsDiscrete(false);
      setRangeEnd('');
    }
    if (event.target.value === 'Range') {
      setNodeCode(undefined);
    }

    setNodes((prevNodes) =>
      prevNodes.map((node) => {
        if (node.id === selectedNode.id) {
          // Assuming selectedNode is an object with an id property
          let newData = {};
          if (event.target.value === 'Range') {
            newData = {
              ...newData,
              formula: undefined,
              discrete: false,
              range: undefined,
            };
          } else if (event.target.value === 'Formula') {
            newData = { ...newData, discrete: undefined, range: undefined };
          }
          return {
            ...node,
            data: { ...node.data, ...newData, rangeType: event.target.value },
          };
        }
        return node;
      })
    );
  };

  const handleDiscreteChange = (event) => {
    setIsDiscrete(event.target.checked);
    updateNodeData('discrete', event.target.checked);
  };

  const handleRangeStartChange = (event) => {
    const value =
      event.target.value === '' ? '' : parseFloat(event.target.value);
    setRangeStart(value);
    updateRange([
      value === '' ? '' : value,
      rangeEnd === '' ? '' : parseFloat(rangeEnd),
    ]);
  };

  const handleRangeEndChange = (event) => {
    const value =
      event.target.value === '' ? '' : parseFloat(event.target.value);
    setRangeEnd(value);
    updateRange([
      rangeStart === '' ? '' : parseFloat(rangeStart),
      value === '' ? '' : value,
    ]);
  };

  const updateRange = (range) => {
    updateNodeData('range', range);
  };

  const updateNodeData = (key, value) => {
    setNodes((prevNodes) =>
      prevNodes.map((node) => {
        if (node.id === selectedNode.id) {
          return { ...node, data: { ...node.data, [key]: value } };
        }
        return node;
      })
    );
  };

  const nodeTypes = useMemo(
    () => ({
      colorPicker: (nodeProps) => (
        <ColorPickerNode
          {...nodeProps}
          onDelete={handleDeleteNode}
          onUpdate={handleNodeUpdate} // Correctly passing the onUpdate
        />
      ),
    }),
    []
  );

  const detectCycle = (edges, connection) => {
    // Convert list of edges into a map for easier access
    const graph = new Map();
    edges.forEach(({ source, target }) => {
      if (!graph.has(source)) {
        graph.set(source, []);
      }
      graph.get(source).push(target);
    });

    // Use DFS to detect cycles
    const hasCycleDFS = (node, visited, recStack) => {
      if (!visited.has(node)) {
        visited.add(node);
        recStack.add(node);

        const neighbors = graph.get(node) || [];
        for (let neighbor of neighbors) {
          if (
            !visited.has(neighbor) &&
            hasCycleDFS(neighbor, visited, recStack)
          ) {
            return true;
          } else if (recStack.has(neighbor)) {
            return true;
          }
        }
      }
      recStack.delete(node);
      return false;
    };

    // Add the new connection to the graph
    if (!graph.has(connection.source)) {
      graph.set(connection.source, []);
    }
    graph.get(connection.source).push(connection.target);

    // Check for cycles
    const visited = new Set();
    const recStack = new Set();
    for (let node of graph.keys()) {
      if (hasCycleDFS(node, visited, recStack)) {
        return true; // Cycle detected
      }
    }

    return false; // No cycle found
  };
  const onNodesChange = (changes) =>
    setNodes((nds) => applyNodeChanges(changes, nds));
  const onEdgesChange = (changes) =>
    setEdges((eds) => applyEdgeChanges(changes, eds));
  const onConnect = (params) => {
    if (detectCycle(edges, params)) {
      handleOpenPopUp();
    } else {
      setEdges((eds) =>
        addEdge(
          { ...params, data: { code: '' }, animated: true, zIndex: 10000 },
          eds
        )
      );
    }
  };

  const onEdgeClick = (event, edge) => {
    setSelectedEdge(edge);
    setSelectedNode('');
    setSelectedIncoming([]);
  };
  const onNodeClick = (event, node) => {
    setSelectedNode(node);
    setSelectedEdge('');

    setNodeCode(node.data?.formula || '');
    const incoming = edges.filter((e) => e.target === node.id);
    const outgoing = edges.filter((e) => e.source === node.id);
    setSelectedIncoming(incoming);
    setSelectedOutgoing(outgoing);
  };

  const getNodeLabel = (nodeId) => {
    const node = nodes.find((n) => n.id === nodeId);
    return node ? node.data.label : '';
  };

  const handleNodeCodeChange = (code) => {
    // Update the nodeCode if it's used by the Editor for displaying the formula
    setNodeCode(code);
    // Update the nodes array with the new code in the formula for the selected node
    setNodes((prevNodes) =>
      prevNodes.map((node) => {
        if (node.id === selectedNode.id) {
          // Assuming selectedNode is an object with an id property
          return { ...node, data: { ...node.data, formula: code } };
        }
        return node;
      })
    );
  };
  const handleArrangeNodes = () => {
    // Step 1: Store the current colors of the nodes by their IDs
    const nodeColors = nodes.reduce((acc, node) => {
      acc[node.id] = node.data.color;
      return acc;
    }, {});

    // Step 2: Transform nodes to JSON and regenerate them
    const currentNodes = transformNodesToJSON(nodes, edges, numSamples);
    handleJsonGenerate(JSON.stringify(currentNodes));

    // Step 3: Update the colors of the new nodes
    setTimeout(() => {
      setNodes((prevNodes) =>
        prevNodes.map((node) => ({
          ...node,
          data: {
            ...node.data,
            color: nodeColors[node.id] || node.data.color, // Preserve the color or default to existing
          },
        }))
      );
    }, 1);
  };
  const handleNodeProbabilityChange = (value) => {
    setNodes((prevNodes) =>
      prevNodes.map((node) => {
        if (node.id === selectedNode.id) {
          return { ...node, data: { ...node.data, probabilities: value } };
        }
        return node;
      })
    );
  };
  const handleNodeCategoriesChange = (value) => {
    setNodes((prevNodes) =>
      prevNodes.map((node) => {
        if (node.id === selectedNode.id) {
          return { ...node, data: { ...node.data, categories: value } };
        }
        return node;
      })
    );
  };

  const handleCategoryChange = (event) => {
    const value = event.target.value;
    setCategories(value);
    handleNodeCategoriesChange(value);
    validateCategories(value);
  };

  const validateCategories = (value) => {
    try {
      const parsed = JSON.parse(value);
      if (
        !Array.isArray(parsed) ||
        !parsed.every((item) => typeof item === 'string')
      ) {
        throw new Error('Categories should be an array of strings.');
      }
      // setCategoryError(false);
      // setCategoryErrorMessage('');
      updateNodeData('categories', parsed);

      const probParsed = JSON.parse(probabilities);
      if (probParsed.length !== parsed.length) {
        throw new Error(
          'Number of probabilities must match number of categories.'
        );
      }
    } catch (error) {}
  };

  const handleProbabilitiesChange = (event) => {
    const value = event.target.value;
    setProbabilities(value);
    handleNodeProbabilityChange(value);
    validateProbabilities(value);
  };
  const validateProbabilities = (value) => {
    try {
      const parsed = JSON.parse(value);
      if (!Array.isArray(parsed)) {
        throw new Error('Probabilities should be an array.');
      }
      const isValid =
        parsed.every((num) => typeof num === 'number' && num > 0) &&
        parsed.reduce((a, b) => a + b, 0) === 1;
      if (!isValid) {
        throw new Error(
          'Probabilities must be all positive numbers and add up to 1.'
        );
      }
      // setProbabilityError(false);
      // setProbabilityErrorMessage('');
      updateNodeData('probabilities', parsed);

      const catParsed = JSON.parse(categories);
      if (catParsed.length !== parsed.length) {
        throw new Error(
          'Number of probabilities must match number of categories.'
        );
      }
    } catch (error) {}
  };
  const handleOpenDataVis = async () => {
    const csvData = await fetchCsvData(fileUrl);
    const parsedData = parseCsvData(csvData);
    const options = generateChartOptions(parsedData);
    setChartOptions(options);
    setIsDataVisOpen(true);
  };

  const updateChartOptions = (x, y, sizeKey, colorKey) => {
    if (!x) return;

    const xAxisType =
      columns.find((col) => col.field === x)?.filter === 'agNumberColumnFilter'
        ? 'number'
        : 'category';
    const yAxisType = y
      ? columns.find((col) => col.field === y)?.filter ===
        'agNumberColumnFilter'
        ? 'number'
        : 'category'
      : null;
    if (chartType === 'causal_graph') {
      const echartsNodes = nodes.map((node) => ({
        name: node.data.label,
        x: node.position.x,
        y: node.position.y,
      }));

      const echartsLinks = edges.map((edge) => ({
        source: getNodeLabel(edge.source),
        target: getNodeLabel(edge.target),
        label: { show: true, formatter: '{c}' },
      }));

      const causalGraphOptions = {
        title: { text: 'Causal Graph' },
        tooltip: {},
        animationDurationUpdate: 1500,
        animationEasingUpdate: 'quinticInOut',
        series: [
          {
            type: 'graph',
            layout: 'none',
            symbolSize: 50,
            roam: true,
            label: { show: true },
            edgeSymbol: ['circle', 'arrow'],
            edgeSymbolSize: [4, 10],
            edgeLabel: { fontSize: 20 },
            data: echartsNodes,
            links: echartsLinks,
            lineStyle: { opacity: 0.9, width: 2, curveness: 0 },
          },
        ],
      };

      setChartOptions(causalGraphOptions);
      const echartsCodeString = `
    option = {
      title: { text: 'Causal Graph' },
      tooltip: {},
      animationDurationUpdate: 1500,
      animationEasingUpdate: 'quinticInOut',
      series: [{
        type: 'graph',
        layout: 'none',
        symbolSize: 50,
        roam: true,
        label: { show: true },
        edgeSymbol: ['circle', 'arrow'],
        edgeSymbolSize: [4, 10],
        edgeLabel: { fontSize: 20 },
        data: ${JSON.stringify(echartsNodes)},
        links: ${JSON.stringify(echartsLinks)},
        lineStyle: { opacity: 0.9, width: 2, curveness: 0 }
      }]
    };
    `;
      setEchartsCode(echartsCodeString);
    } else {
      if (chartType === 'pie') {
        const dataCounts = csvData.reduce((acc, row) => {
          acc[row[x]] = (acc[row[x]] || 0) + 1;
          return acc;
        }, {});

        const pieData = Object.entries(dataCounts).map(([label, value]) => ({
          label,
          value,
        }));

        setChartOptions({
          data: pieData,
          series: [
            {
              labelKey: 'label',
              angleKey: 'value',
              type: 'pie',
              tooltip: {
                renderer: (params) => {
                  return {
                    content: `${params.datum.label}: ${params.datum.value} samples`,
                  };
                },
              },
            },
          ],
          title: {
            text: `${x} Distribution`,
          },
        });
      } else if (chartType === 'histogram') {
        const histogramData = csvData.map((row) => ({
          x: parseFloat(row[x]), // Ensure x values are numbers
        }));

        setChartOptions({
          data: histogramData,
          mark: 'bar',
          encoding: {
            x: {
              field: 'x',
              bin: true,
              type: 'quantitative',
              axis: { title: x },
            },
            y: {
              aggregate: 'count',
              type: 'quantitative',
              axis: { title: 'Count' },
            },
            tooltip: [{ field: 'x', type: 'quantitative', title: x }],
          },
          title: {
            text: `${x} Distribution`,
            anchor: 'start',
            frame: 'group',
            dy: -20,
            dx: 300,
          },
        });
      } else if (chartType === 'bubble' || chartType === 'scatter') {
        let series = [];

        if (colorKey) {
          const categories = [...new Set(csvData.map((row) => row[colorKey]))];
          series = categories.map((category) => ({
            type: chartType,
            title: category,
            data: csvData
              .filter((row) => row[colorKey] === category)
              .map((row) => ({
                x: row[x],
                y: y ? row[y] : row[x],
                size: sizeKey ? row[sizeKey] : null,
              })),
            xKey: 'x',
            yKey: 'y',
            sizeKey:
              chartType === 'scatter'
                ? undefined
                : sizeKey
                ? 'size'
                : undefined,
            tooltip: {
              renderer: (params) => {
                return {
                  content: `${x}: ${params.datum.x}, ${
                    y ? y + ': ' + params.datum.y : ''
                  }${
                    chartType === 'bubble' && sizeKey
                      ? `, ${sizeKey}: ${params.datum.size}`
                      : ''
                  }`,
                };
              },
            },
          }));
        } else {
          series = [
            {
              type: chartType,
              data: csvData.map((row) => ({
                x: row[x],
                y: y ? row[y] : row[x],
                size: sizeKey ? row[sizeKey] : null,
              })),
              xKey: 'x',
              yKey: y ? 'y' : 'x',
              sizeKey: sizeKey ? 'size' : undefined,
              tooltip: {
                renderer: (params) => {
                  return {
                    content: `${x}: ${params.datum.x}, ${
                      y ? y + ': ' + params.datum.y : ''
                    }${
                      chartType === 'bubble' && sizeKey
                        ? `, ${sizeKey}: ${params.datum.size}`
                        : ''
                    }`,
                  };
                },
              },
            },
          ];
        }

        setChartOptions({
          series: series,
          title: {
            text: y
              ? `${x}, ${y}${
                  sizeKey && chartType === 'bubble' ? ', ' + sizeKey : ''
                }${colorKey ? ', ' + colorKey : ''}`
              : `${x} Distribution`,
            align: 'center',
          },
          axes: [
            {
              type: xAxisType,
              position: 'bottom',
              title: { text: x },
            },
            y
              ? {
                  type: yAxisType,
                  position: 'left',
                  title: { text: y },
                }
              : null,
          ].filter(Boolean), // Remove null axes
        });
      }
    }
  };

  const handleCloseDataVis = () => {
    setShouldRenderChart(false); // Resetting state to hide the chart
    setIsDataVisOpen(false);
  };
  const downloadEChartHTML = () => {
    const options = getEChartsOptions(eChartNodes, eChartEdges);
    const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>EChart</title>
    <script src="https://cdn.jsdelivr.net/npm/echarts/dist/echarts.min.js"></script>
  </head>
  <body>
    <div id="chart" style="width: 100%; height: 100vh;"></div>
    <script type="text/javascript">
      var chart = echarts.init(document.getElementById('chart'));
      var option = ${JSON.stringify(options, null, 2)};
      chart.setOption(option);
    </script>
  </body>
  </html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'causal_graph.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Function to fetch CSV data
  const fetchCsvData = async (url) => {
    const response = await fetch(url);
    const data = await response.text();
    return data;
  };

  // Function to parse CSV data
  const parseCsvData = (data) => {
    const lines = data.split('\n');
    const headers = lines[0].split(',');
    const rows = lines.slice(1).map((line) => line.split(','));
    return { headers, rows };
  };
  const getEChartsOptions = (eChartNodes, eChartEdges) => ({
    tooltip: {},
    animationDurationUpdate: 1500,
    animationEasingUpdate: 'quinticInOut',
    backgroundColor: '#424242',
    series: [
      {
        type: 'graph',
        layout: 'none',
        symbolSize: 80,
        roam: true,
        label: {
          show: true,
          fontWeight: 'bold',
        },
        edgeSymbol: ['circle', 'arrow'],
        edgeSymbolSize: [4, 10],
        data: eChartNodes,
        links: eChartEdges,
        lineStyle: {
          opacity: 0.9,
          width: 0.8,
          curveness: 0,
        },
      },
    ],
  });
  const viewEChartInEditor = () => {
    const options = getEChartsOptions(eChartNodes, eChartEdges);
    const editorUrl = `https://echarts.apache.org/examples/en/editor.html?option=${encodeURIComponent(
      JSON.stringify(options)
    )}`;
    window.open(editorUrl, '_blank');
  };

  // Function to generate chart options
  const generateChartOptions = (data) => {
    const { headers, rows } = data;
    // Generate scatter plot options using the first two columns as an example
    return {
      data: rows.map((row) => ({
        x: [],
        y: [],
      })),
      series: [
        {
          xKey: 'x',
          yKey: 'y',
          type: 'scatter',
        },
      ],
      title: {
        text: '',
      },
      axes: [
        {
          type: 'number',
          position: 'bottom',
        },
        {
          type: 'category',
          position: 'left',
        },
      ],
    };
  };
  return (
    <EdgesContext.Provider value={{ edges, setEdges }}>
      <ThemeProvider theme={theme}>
        <Box display="flex" height="100vh">
          <Box flex={1} padding={2} position={'relative'}>
            {nodes.length === 0 && (
              <Placeholder>
                <LightbulbIcon style={{ fontSize: 80, marginBottom: 16 }} />
                <Typography variant="h6" gutterBottom>
                  No nodes yet!
                </Typography>
                <Typography variant="body1">
                  Add nodes manually or import a JSON file to get started.
                </Typography>
              </Placeholder>
            )}
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              onEdgeClick={onEdgeClick}
              onNodeClick={onNodeClick}
            />
          </Box>
          <Box width={400} padding={2} marginRight={4}>
            <Box marginBottom={2} display="flex" alignItems="center">
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddNode}
              >
                Add Node
              </Button>
              <Tooltip title="Import JSON">
                <IconButton
                  onClick={handleJsonDialogOpen}
                  style={{ marginLeft: '10px' }}
                >
                  <AddCircleOutlineIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Arrange Nodes">
                <IconButton
                  onClick={handleArrangeNodes}
                  style={{ marginLeft: '0px' }}
                >
                  <SpaceDashboardIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <Paper elevation={3} style={{ padding: 16, marginBottom: 16 }}>
              <TextField
                label="Number of Samples"
                type="number"
                value={numSamples}
                onChange={(e) => setNumSamples(e.target.value)}
                fullWidth
                margin="normal"
              />
              <TextField
                label={`File Name`}
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                fullWidth
                margin="normal"
                variant="outlined"
              />
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                marginTop={2}
              >
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleGenerate}
                >
                  Generate
                </Button>
                <Box display="flex" alignItems="center">
                  {
                    <Tooltip title="View CSV">
                      <IconButton
                        onClick={() => downloadFile(fileUrl, fileName)}
                      >
                        {loading ? (
                          <CircularProgress size={19} />
                        ) : fileUrl ? (
                          <DatasetIcon />
                        ) : null}
                      </IconButton>
                    </Tooltip>
                  }
                  {latestJson && (
                    <Tooltip title="View Latest JSON">
                      <IconButton onClick={handleJsonModalOpen}>
                        <CodeIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </Box>
            </Paper>
            {selectedEdge && (
              <Paper
                elevation={3}
                style={{ padding: 16, marginBottom: 16 }}
                className={`fade-in ${selectedEdge ? 'show' : ''}`}
              >
                <Typography variant="h6" gutterBottom>
                  Selected Edge
                </Typography>
                <Typography>
                  <span style={{ color: '#2979FF', fontWeight: 'bold' }}>
                    Source
                  </span>{' '}
                  <span style={{ fontWeight: '500' }}>
                    {getNodeLabel(selectedEdge.source)}
                  </span>
                  {selectedEdge.source && (
                    <span style={{ fontWeight: '400' }}>
                      &nbsp;({' ' + selectedEdge.source + ' '})
                    </span>
                  )}
                </Typography>
                <Typography>
                  <span style={{ color: '#FF7043', fontWeight: 'bold' }}>
                    Target&nbsp;
                  </span>{' '}
                  <span style={{ fontWeight: '500' }}>
                    {getNodeLabel(selectedEdge.target)}
                  </span>
                  {selectedEdge.target && (
                    <span style={{ fontWeight: '400' }}>
                      &nbsp;({' ' + selectedEdge.target + ' '})
                    </span>
                  )}
                </Typography>
              </Paper>
            )}
            {selectedNode && (
              <Paper
                elevation={3}
                style={{ padding: 16, marginBottom: 16 }}
                className={`fade-in ${selectedNode ? 'show' : ''}`}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  style={{ color: 'black' }}
                >
                  {selectedNode
                    ? `${getNodeLabel(selectedNode.id)} (ID: ${
                        selectedNode.id
                      })`
                    : 'Node Details'}
                </Typography>
                <Typography component="div">
                  <strong style={{ color: '#2979FF' }}>Incoming Nodes:</strong>
                  <ul
                    style={{
                      paddingLeft: '20px',
                      listStyleType: 'disc',
                      marginTop: '7px',
                    }}
                  >
                    {selectedIncoming.map((edge, idx) => (
                      <li key={idx} style={{ marginTop: '2px' }}>
                        {getNodeLabel(edge.source)}
                        {edge.source && ` (ID: ${edge.source})`}
                      </li>
                    ))}
                  </ul>
                </Typography>
                <Typography component="div">
                  <strong style={{ color: '#FF7043' }}>Outgoing Nodes:</strong>
                  <ul
                    style={{
                      paddingLeft: '20px',
                      listStyleType: 'disc',
                      marginTop: '7px',
                    }}
                  >
                    {selectedOutgoing.map((edge, idx) => (
                      <li key={idx} style={{ marginTop: '2px' }}>
                        {getNodeLabel(edge.target)}
                        {edge.target && ` (ID: ${edge.target})`}
                      </li>
                    ))}
                  </ul>
                </Typography>
              </Paper>
            )}

            {selectedIncoming.length > 0 && (
              <>
                <Paper
                  elevation={3}
                  style={{ padding: 16, position: 'relative' }}
                >
                  {selectedNode.data.type === 'categorical' && (
                    <>
                      <Typography variant="h6" gutterBottom>
                        Categories
                      </Typography>
                      <TextField
                        placeholder={`e.g. Red, Green, Blue`}
                        fullWidth
                        margin="normal"
                        onChange={(event) => handleCategoryChange(event)}
                        sx={{ mt: 1 }} // Decrease margin-top
                        value={
                          categories ? categories.replace(/^"(.*)"$/, '$1') : ''
                        }
                        // error={categoryError}
                        // helperText={categoryError ? categoryErrorMessage : ''}
                      />
                    </>
                  )}
                  <Typography variant="h6" gutterBottom>
                    Formula (Python)
                  </Typography>

                  <PythonEditor
                    nodeVariables={nodeVariables}
                    nodeCode={nodeCode}
                    onValueChange={handleNodeCodeChange}
                  />
                  <Tooltip title="Help" placement="top">
                    <IconButton
                      color="default"
                      onClick={handleClickOpen}
                      style={{
                        position: 'absolute',
                        top:
                          selectedNode.data.type === 'categorical' ? 125 : 14,
                        right: 7,
                        color: 'gray',
                      }}
                    >
                      <InfoIcon />
                    </IconButton>
                  </Tooltip>
                  <Dialog open={open} onClose={handleClose}>
                    <DialogTitle>Help</DialogTitle>
                    <DialogContent>
                      <Typography
                        variant="subtitle1"
                        gutterBottom
                        style={{ marginTop: '1px', fontWeight: 'bold' }}
                      >
                        You may only incorporate{' '}
                        <strong style={{ color: '#66bb6a' }}>
                          variable names{' '}
                        </strong>
                        into the node's formula that are{' '}
                        <strong style={{ color: '#66bb6a' }}>
                          incoming variables{' '}
                        </strong>
                        of the current node, namely the variables that show up
                        under the{' '}
                        <strong style={{ color: '#66bb6a' }}>
                          Incoming Variables
                        </strong>{' '}
                        section of the virtual keyboard.
                      </Typography>
                      <Divider
                        style={{ marginBottom: '16px', marginTop: '16px' }}
                      />
                      <Typography
                        variant="subtitle1"
                        gutterBottom
                        style={{ fontWeight: 'bold' }}
                      >
                        Sample formula for{' '}
                        <strong style={{ color: '#6192D2' }}>income</strong>, a{' '}
                        <strong style={{ color: '#66bb6a' }}>
                          numerical variable
                        </strong>
                        :
                      </Typography>
                      <Box style={boxStyle}>
                        <Typography variant="body1" style={fontStyle}>
                          30000 + 1500 * <span style={variableStyle}>age</span>{' '}
                          - (5000 if <span style={variableStyle}>gender</span>{' '}
                          == '<span style={variableStyle}>female</span>' else 0)
                        </Typography>
                      </Box>
                      <Typography
                        variant="subtitle1"
                        gutterBottom
                        style={{ marginTop: '16px', fontWeight: 'bold' }}
                      >
                        When defining the formula for a{' '}
                        <strong style={{ color: '#66bb6a' }}>
                          categorical variable
                        </strong>
                        , you use numbers to denote the{' '}
                        <strong style={{ color: '#66bb6a' }}>
                          categorical values&nbsp;
                        </strong>
                        assigned to it , exemplified by this sample formula for{' '}
                        <strong style={{ color: '#6192D2' }}>
                          stress_level
                        </strong>
                        :
                      </Typography>
                      <Box style={boxStyle}>
                        <Typography variant="body1" style={fontStyle}>
                          2 if <span style={variableStyle}>age</span> &gt; 40
                          and{' '}
                          <span style={variableStyle}>household_income</span>{' '}
                          &lt; 50000 else 0 if{' '}
                          <span style={variableStyle}>age</span> &lt;= 40 and{' '}
                          <span style={variableStyle}>household_income</span>{' '}
                          &gt;= 50000 else 1{' '}
                          <span style={commentStyle}>
                            #for categories ["Low", "Medium", "High"]
                          </span>
                        </Typography>
                      </Box>
                      <Typography
                        variant="subtitle1"
                        gutterBottom
                        style={{ marginTop: '16px', fontWeight: 'bold' }}
                      >
                        You can use{' '}
                        <strong style={{ color: '#66bb6a' }}>
                          numpy methods
                        </strong>{' '}
                        incorporating variables as arguments, exemplified by
                        this sample formula for{' '}
                        <strong style={{ color: '#6192D2' }}>
                          annual_savings
                        </strong>
                        , a{' '}
                        <strong style={{ color: '#66bb6a' }}>
                          numerical variable
                        </strong>
                        :
                      </Typography>
                      <Box style={boxStyle}>
                        <Typography variant="body1" style={fontStyle}>
                          <span style={variableStyle}>np.random.normal</span>
                          (1500 * <span style={variableStyle}>age</span> +{' '}
                          <span style={variableStyle}>household_income</span>,
                          10)
                        </Typography>
                      </Box>
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={handleClose} color="primary">
                        Close
                      </Button>
                    </DialogActions>
                  </Dialog>
                </Paper>
                <VirtualKeyboard
                  variables={nodeVariables}
                  formula={nodeCode}
                  setFormula={handleNodeCodeChange}
                />
              </>
            )}
            {selectedNode && selectedIncoming.length === 0 && (
              <div className="fade-in">
                <Paper elevation={3} style={{ padding: 16, marginBottom: 20 }}>
                  {selectedNode.data.type === 'categorical' ? (
                    <>
                      <Typography variant="h6" gutterBottom>
                        Categories
                      </Typography>
                      <TextField
                        placeholder={`e.g. Red, Green, Blue`}
                        fullWidth
                        margin="normal"
                        onChange={handleCategoryChange}
                        sx={{ mt: 1 }} // Decrease margin-top
                        value={
                          categories
                            ? categories.replace(/^"(.*)"$/, '$1')
                            : undefined
                        }
                      />
                      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                        Probabilities (Optional)
                      </Typography>
                      <TextField
                        helperText="Must be the same length as # of categories and and adds up to 1."
                        placeholder="e.g. [0.9, 0.09, 0.01]"
                        fullWidth
                        margin="normal"
                        onChange={handleProbabilitiesChange}
                        value={
                          probabilities
                            ? probabilities.replace(/^"(.*)"$/, '$1')
                            : undefined
                        }
                        error={probabilityError}
                        // helperText={
                        //   probabilityError ? probabilityErrorMessage : ''
                        // }
                        sx={{ mt: 1, borderRadius: '8px' }} // Decrease margin-top and add borderRadius
                      />
                    </>
                  ) : (
                    <>
                      <Typography variant="h6" gutterBottom>
                        Type
                      </Typography>
                      <FormControl
                        component="fieldset"
                        margin="normal"
                        sx={{ mt: 0 }}
                      >
                        <RadioGroup
                          row
                          value={rangeType}
                          onChange={handleRangeTypeChange}
                        >
                          <FormControlLabel
                            value="Range"
                            control={<Radio />}
                            label="Range"
                          />
                          <FormControlLabel
                            value="Formula"
                            control={<Radio />}
                            label="Formula"
                          />
                        </RadioGroup>
                      </FormControl>
                      {rangeType === 'Range' && (
                        <Typography variant="h6" gutterBottom sx={{ mt: 0 }}>
                          Range (Uniform Distribution)
                        </Typography>
                      )}
                      {rangeType === 'Formula' ? (
                        <Box position="relative">
                          <Typography variant="h6" gutterBottom>
                            Formula (Python)
                          </Typography>
                          <PythonEditor
                            nodeVariables={nodeVariables}
                            nodeCode={nodeCode}
                            onValueChange={handleNodeCodeChange}
                          />
                          <Tooltip title="Help" placement="top">
                            <IconButton
                              color="default"
                              onClick={handleClickOpen}
                              style={{
                                position: 'absolute',
                                top: -3,
                                right: -10,
                                color: 'gray',
                              }}
                            >
                              <InfoIcon />
                            </IconButton>
                          </Tooltip>
                          <Dialog open={open} onClose={handleClose}>
                            <DialogTitle>Help</DialogTitle>
                            <DialogContent>
                              <Typography
                                variant="subtitle1"
                                gutterBottom
                                style={{ marginTop: '1px', fontWeight: 'bold' }}
                              >
                                You may only incorporate{' '}
                                <strong style={{ color: '#66bb6a' }}>
                                  variable names{' '}
                                </strong>
                                into the node's formula that are{' '}
                                <strong style={{ color: '#66bb6a' }}>
                                  incoming variables{' '}
                                </strong>
                                of the current node, namely the variables that
                                show up under the{' '}
                                <strong style={{ color: '#66bb6a' }}>
                                  Incoming Variables
                                </strong>{' '}
                                section of the virtual keyboard.
                              </Typography>
                              <Divider
                                style={{
                                  marginBottom: '16px',
                                  marginTop: '16px',
                                }}
                              />
                              <Typography
                                variant="subtitle1"
                                gutterBottom
                                style={{ fontWeight: 'bold' }}
                              >
                                Sample formula for{' '}
                                <strong style={{ color: '#6192D2' }}>
                                  income
                                </strong>
                                , a{' '}
                                <strong style={{ color: '#66bb6a' }}>
                                  numerical variable
                                </strong>
                                :
                              </Typography>
                              <Box style={boxStyle}>
                                <Typography variant="body1" style={fontStyle}>
                                  30000 + 1500 *{' '}
                                  <span style={variableStyle}>age</span> - (5000
                                  if <span style={variableStyle}>gender</span>{' '}
                                  == '<span style={variableStyle}>female</span>'
                                  else 0)
                                </Typography>
                              </Box>
                              <Typography
                                variant="subtitle1"
                                gutterBottom
                                style={{
                                  marginTop: '16px',
                                  fontWeight: 'bold',
                                }}
                              >
                                You use numbers to denote{' '}
                                <strong style={{ color: '#66bb6a' }}>
                                  categorical values
                                </strong>{' '}
                                assigned to a{' '}
                                <strong style={{ color: '#66bb6a' }}>
                                  categorical variable
                                </strong>
                                , exemplified by this sample formula for{' '}
                                <strong style={{ color: '#6192D2' }}>
                                  stress_level
                                </strong>
                                :
                              </Typography>
                              <Box style={boxStyle}>
                                <Typography variant="body1" style={fontStyle}>
                                  2 if <span style={variableStyle}>age</span>{' '}
                                  &gt; 40 and{' '}
                                  <span style={variableStyle}>
                                    household_income
                                  </span>{' '}
                                  &lt; 50000 else 0 if{' '}
                                  <span style={variableStyle}>age</span> &lt;=
                                  40 and{' '}
                                  <span style={variableStyle}>
                                    household_income
                                  </span>{' '}
                                  &gt;= 50000 else 1{' '}
                                  <span style={commentStyle}>
                                    #for categories ["Low", "Medium", "High"]
                                  </span>
                                </Typography>
                              </Box>
                              <Typography
                                variant="subtitle1"
                                gutterBottom
                                style={{
                                  marginTop: '16px',
                                  fontWeight: 'bold',
                                }}
                              >
                                You can use{' '}
                                <strong style={{ color: '#66bb6a' }}>
                                  numpy methods
                                </strong>{' '}
                                incorporating variables as arguments,
                                exemplified by this sample formula for{' '}
                                <strong style={{ color: '#6192D2' }}>
                                  annual_savings
                                </strong>
                                , a{' '}
                                <strong style={{ color: '#66bb6a' }}>
                                  numerical variable
                                </strong>
                                :
                              </Typography>
                              <Box style={boxStyle}>
                                <Typography variant="body1" style={fontStyle}>
                                  <span style={variableStyle}>
                                    np.random.normal
                                  </span>
                                  (1500 * <span style={variableStyle}>age</span>{' '}
                                  +{' '}
                                  <span style={variableStyle}>
                                    household_income
                                  </span>
                                  , 10)
                                </Typography>
                              </Box>
                            </DialogContent>
                            <DialogActions>
                              <Button onClick={handleClose} color="primary">
                                Close
                              </Button>
                            </DialogActions>
                          </Dialog>
                        </Box>
                      ) : (
                        <>
                          <Box display="flex" alignItems="center">
                            <TextField
                              placeholder="e.g. 0"
                              fullWidth
                              margin="normal"
                              onChange={handleRangeStartChange}
                              value={rangeStart}
                              sx={{ borderRadius: '12px', mt: 1 }}
                            />
                            <Typography
                              variant="h6"
                              margin="normal"
                              padding="0 8px"
                              sx={{ mt: 0 }}
                            >
                              -
                            </Typography>
                            <TextField
                              placeholder="e.g. 100"
                              fullWidth
                              margin="normal"
                              onChange={handleRangeEndChange}
                              value={rangeEnd}
                              sx={{ borderRadius: '12px', mt: 0 }}
                            />
                          </Box>
                          <FormGroup sx={{ mt: 0.6 }}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={isDiscrete}
                                  onChange={handleDiscreteChange}
                                  sx={{ borderRadius: '8px' }}
                                />
                              }
                              label="Discrete"
                            />
                          </FormGroup>
                        </>
                      )}
                    </>
                  )}
                </Paper>
                {rangeType === 'Formula' ? (
                  <VirtualKeyboard
                    variables={nodeVariables}
                    formula={nodeCode}
                    setFormula={handleNodeCodeChange}
                  />
                ) : null}
              </div>
            )}
          </Box>
        </Box>
        <PopUp
          title="Cycle Detected"
          isOpen={isPopUpOpen}
          onClose={handleClosePopUp}
        >
          <Typography>
            A cycle will be created by adding this edge. Please revise your
            action.
          </Typography>
        </PopUp>
        <Dialog
          open={jsonModalOpen}
          onClose={handleJsonModalClose}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>Latest Generated JSON</DialogTitle>
          <DialogContent>
            <SyntaxHighlighter language="json" style={dracula}>
              {latestJson
                ? JSON.stringify(latestJson, null, 2)
                : 'No JSON generated yet.'}
            </SyntaxHighlighter>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleJsonModalClose} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={isCsvViewerOpen}
          onClose={() => {
            setIsCsvViewerOpen(false);
          }}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle
            sx={{
              marginTop: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {isDataVisOpen ? 'Charting' : 'CSV Viewer'}
              <IconButton
                onClick={isDataVisOpen ? handleCloseDataVis : handleOpenDataVis}
                sx={{
                  marginLeft: 1, // Adjust the margin as needed
                }}
              >
                {isDataVisOpen ? <DatasetIcon /> : <AutoGraphIcon />}
              </IconButton>
            </Box>
            <IconButton
              onClick={() => {
                const link = document.createElement('a');
                link.href = fileUrl;
                link.setAttribute('download', fileName);
                document.body.appendChild(link);
                link.click();
                link.remove();
              }}
              sx={{ marginLeft: 2 }} // Adjust the margin as needed
            >
              <Tooltip title="Download CSV">
                <FileDownloadIcon />
              </Tooltip>
            </IconButton>
          </DialogTitle>
          <DialogContent
            style={{ padding: 0, display: 'flex', alignItems: 'flex-start' }}
          >
            {isDataVisOpen && (
              <Box width="30%" p={2} ml={1} mt={-3}>
                {' '}
                {/* Added ml={4} to shift the panel */}
                <h3>Options</h3>
                <TextField
                  value={chartType}
                  onChange={handleChartTypeChange}
                  select
                  label="Chart Type"
                  fullWidth
                  margin="normal"
                >
                  <MenuItem value="bubble">Bubble</MenuItem>
                  <MenuItem value="scatter">Scatter</MenuItem>

                  <MenuItem value="histogram">Histogram</MenuItem>
                  <MenuItem value="pie">Pie</MenuItem>
                  <MenuItem value="causal_graph">Causal Graph</MenuItem>
                </TextField>
                {chartType !== 'causal_graph' && (
                  <>
                    <TextField
                      value={xAxis}
                      onChange={handleXAxisChange}
                      select
                      label={
                        chartType === 'pie' || chartType === 'histogram'
                          ? 'Variable'
                          : 'X-Axis'
                      }
                      fullWidth
                      margin="normal"
                    >
                      {filterColumns(
                        columns,
                        csvData,
                        chartType === 'pie'
                          ? 'categorical'
                          : chartType === 'histogram'
                          ? 'numerical'
                          : 'Null'
                      ).map((col, index) => (
                        <MenuItem key={index} value={col.field}>
                          {col.headerName}
                        </MenuItem>
                      ))}
                    </TextField>

                    {chartType !== 'pie' && chartType !== 'histogram' && (
                      <TextField
                        value={yAxis}
                        onChange={handleYAxisChange}
                        select
                        label="Y-Axis"
                        fullWidth
                        margin="normal"
                      >
                        {columns.map((col, index) => (
                          <MenuItem key={index} value={col.field}>
                            {col.headerName}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                    {chartType === 'bubble' && (
                      <TextField
                        value={bubbleSize}
                        onChange={handleBubbleSizeChange}
                        select
                        label="Bubble Size"
                        fullWidth
                        margin="normal"
                      >
                        <MenuItem value=""></MenuItem>
                        {filterColumns(columns, csvData, 'numerical').map(
                          (col, index) => (
                            <MenuItem key={index} value={col.field}>
                              {col.headerName}
                            </MenuItem>
                          )
                        )}
                      </TextField>
                    )}
                    {(chartType === 'bubble' || chartType === 'scatter') && (
                      <TextField
                        value={colorKey}
                        onChange={handleColorkeyChange}
                        select
                        label="Color (Optional)"
                        fullWidth
                        margin="normal"
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        {filterColumns(columns, csvData, 'categorical').map(
                          (col, index) => (
                            <MenuItem key={index} value={col.field}>
                              {col.headerName}
                            </MenuItem>
                          )
                        )}
                      </TextField>
                    )}
                  </>
                )}
                {chartType === 'causal_graph' && (
                  <Typography variant="body2" color="#9e9e9e" sx={{ mb: 2 }}>
                    The generated causal graph's nodes have positions and colors
                    that mirror those of the nodes in the app. Click "Arrange
                    Nodes" first if you wish to have the app format the nodes.
                  </Typography>
                )}
                <Box
                  display="flex"
                  justifyContent="space-between"
                  marginTop={2}
                >
                  <Box>
                    {chartType === 'causal_graph' && shouldRenderChart && (
                      <>
                        <Tooltip title="View Source Code in Editor">
                          <IconButton onClick={openCodeModal}>
                            <CodeIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Download Causal Graph HTML">
                          <IconButton onClick={downloadEChartHTML}>
                            <FileDownloadIcon />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </Box>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handlePlotClick}
                  >
                    Plot
                  </Button>
                </Box>
              </Box>
            )}
            <CsvViewer
              fileUrl={fileUrl}
              isDataVisOpen={isDataVisOpen}
              chartOptions={chartOptions}
              onChartOptionsChange={handleChartOptionsChange}
              shouldRenderChart={shouldRenderChart}
              chartType={chartType}
              eChartNodes={eChartNodes}
              eChartEdges={eChartEdges}
            />

            {chartType === 'causal_graph' && (
              // <Box p={2} mt={-2} ml={4} width="50%">
              //   <h3>eCharts Code</h3>
              //   <CodeMirror
              //     value={echartsCode}
              //     options={{
              //       mode: 'javascript',
              //       theme: 'dracula',
              //       lineNumbers: true,
              //     }}
              //   />
              // </Box>
              <></>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsCsvViewerOpen(false)} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={jsonDialogOpen}
          onClose={handleJsonDialogClose}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>Import JSON Structure</DialogTitle>
          <DialogContent dividers>
            {jsonError && <Typography color="error">{jsonError}</Typography>}
            <CodeMirror
              value={jsonInput}
              height="200px"
              extensions={[json()]}
              onChange={(value) => setJsonInput(value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleJsonDialogClose} color="primary">
              Cancel
            </Button>
            <Button
              onClick={() => handleJsonGenerate(jsonInput)}
              color="primary"
            >
              Generate
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={errorDialogOpen}
          onClose={() => setErrorDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ backgroundColor: '#ef5350', color: 'white' }}>
            Error
          </DialogTitle>
          <DialogContent dividers>
            <Typography
              sx={{ mt: 0 }}
              dangerouslySetInnerHTML={{ __html: errorMessage }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setErrorDialogOpen(false)} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={isCodeModalOpen}
          onClose={closeCodeModal}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>Causal Graph JSON</DialogTitle>
          <DialogContent>
            <SyntaxHighlighter language="json" style={dracula}>
              {echartsCode || 'No JSON generated yet.'}
            </SyntaxHighlighter>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeCodeModal} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </ThemeProvider>
    </EdgesContext.Provider>
  );
};

export default App;
