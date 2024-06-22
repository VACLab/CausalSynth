import React, { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import Papa from 'papaparse';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { Box } from '@mui/material';
import { AgChartsReact } from 'ag-charts-react';
import { Vega } from 'react-vega';
import { Handler } from 'vega-tooltip';
import ReactECharts from 'echarts-for-react';

const CsvViewer = ({
  fileUrl,
  isDataVisOpen,
  chartOptions,
  onChartOptionsChange,
  shouldRenderChart,
  chartType,
  eChartNodes,
  eChartEdges,
}) => {
  const [csvData, setCsvData] = useState([]);
  const [columnDefs, setColumnDefs] = useState([]);

  const isNumeric = (value) => {
    return !isNaN(value) && !isNaN(parseFloat(value));
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

  const parseRowData = (row) => {
    const parsedRow = {};
    for (let key in row) {
      const value = row[key];
      if (isNumeric(value)) {
        parsedRow[key] = parseFloat(value);
      } else {
        parsedRow[key] = value;
      }
    }
    return parsedRow;
  };

  useEffect(() => {
    if (fileUrl) {
      fetch(fileUrl)
        .then((response) => response.text())
        .then((data) => {
          Papa.parse(data, {
            header: true,
            complete: (results) => {
              const firstRow = results.data[0];
              const columns = Object.keys(firstRow).map((key) => {
                const value = firstRow[key];
                const isColumnNumeric = isNumeric(value);
                return {
                  headerName: key,
                  field: key,
                  filter: isColumnNumeric
                    ? 'agNumberColumnFilter'
                    : 'agTextColumnFilter',
                };
              });

              let parsedData = results.data.map(parseRowData);
              setColumnDefs(columns);
              setCsvData(parsedData.slice(0, -1));
              onChartOptionsChange(columns, parsedData.slice(0, -1)); // Pass parsed CSV data
            },
          });
        });
    }
  }, [fileUrl]);

  const renderChart = () => {
    if (chartType === 'histogram' && chartOptions) {
      return (
        <Vega
          tooltip={new Handler().call}
          spec={{
            ...chartOptions,
            data: { values: chartOptions.data },
          }}
          width={chartOptions.width || 700}
          height={chartOptions.height || 400}
        />
      );
    } else if (chartType === 'causal_graph') {
      const options = getEChartsOptions(eChartNodes, eChartEdges);

      return (
        <Box sx={{ display: 'flex', height: '100%', width: '100%', mt: -3 }}>
          <Box
            sx={{
              flex: 1,
              width: '100%',
              height: '500px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box sx={{ width: '100%', height: '100%' }}>
              <ReactECharts
                option={options}
                style={{ width: '100%', height: '100%' }}
              />
            </Box>
          </Box>
        </Box>
      );
    } else {
      return (
        <Box sx={{ display: 'flex', height: '100%', mt: -3 }}>
          <Box
            sx={{
              flex: 1,
              maxWidth: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box sx={{ width: '100%', height: '100%' }}>
              <AgChartsReact options={chartOptions} />{' '}
            </Box>{' '}
          </Box>{' '}
        </Box>
      );
    }
  };

  return (
    <Box
      sx={{
        width: isDataVisOpen ? '65%' : '100%',
        height: 'calc(100vh - 200px)',
        backgroundColor: 'white',
        padding: 2,
        transition: 'width 0.3s ease',
        position: 'relative',
      }}
    >
      {isDataVisOpen && shouldRenderChart ? (
        renderChart()
      ) : (
        <Box
          className="ag-theme-alpine"
          style={{ height: '100%', width: '100%' }}
        >
          <AgGridReact
            rowData={csvData}
            columnDefs={columnDefs}
            defaultColDef={{
              sortable: true,
              filter: true,
            }}
          />{' '}
        </Box>
      )}{' '}
    </Box>
  );
};

export default CsvViewer;
