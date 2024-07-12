# CausalSynth

CausalSynth is an interactive web application designed for generating synthetic datasets based on user-defined causal relationships. The application provides a user-friendly graphical interface for defining causal graphs, specifying variable interrelationships, and visualizing the generated data.

## Motivation

The primary motivation behind CausalSynth is to address challenges in causal inference from observational data, such as the presence of confounding variables and the lack of controlled conditions. Observational data often lacks a ground truth causal model, making it difficult to evaluate visual causal inference tools effectively. CausalSynth provides a robust tool for generating synthetic datasets with known causal relationships, which can serve as ground truth datasets for evaluating visual causal inference technologies.

## Features

- **Graphical Interface**: Define acyclic causal graphs using a user-friendly graphical interface.
- **Variable Management**: Create and manage variables, including setting attributes and interrelationships.
- **Formula Definition**: Use Python-based formulas or predefined distribution parameters to define variable data generation.
- **Visualization Tools**: Built-in tools for visualizing generated datasets, including scatter plots, bubble plots, histograms, pie charts, and causal graphs.
- **JSON and CSV Export**: Export graph configurations as JSON files and generated data as CSV files for further analysis and reuse.

## Usage

### 1. Define Variables and Causal Relationships

Use the graphical interface to create variables and define causal relationships between them. Variables can be defined with specific attributes, including ranges, categorical values, and corresponding probability values.

### 2. Generate and Export Data

After defining the causal graph, specify the number of samples to be generated. The application will produce a JSON file documenting the graph configuration and a CSV file containing the generated data.

### 3. Visualize Data

Use the built-in visualization tools to inspect the generated data and validate the causal relationships. Visualizations include scatter plots, bubble plots, histograms, pie charts, and causal graphs.

## Example Usage

A typical workflow in CausalSynth involves defining variables and their relationships, generating synthetic data, and visualizing the results. For instance, you can define variables such as Distance, Price, and Flights, with dependencies among them, and generate data to analyze how these variables interact.

- Distance: Numerical, independent variable (range: 100 to 3000)
- Price: Numerical, dependent variable (formula: 100 + 20 _ math.log(Distance) + 10 _ np.random.random())
- Flights: Categorical variable depending on Distance and Price

After defining the graph, you can generate a CSV file containing the data and use the visualization tools to inspect the relationships.

## Installation

To run CausalSynth locally, follow these steps:

1. Clone and navigate to the repository:
   `git clone https://github.com/VACLab/CausalSynth.git`
   `cd CausalSynth`

2. Install dependencies:
   `npm install`

3. Start the development server:
   `npm start`

4. Open your browser and navigate to `http://localhost:3000`.

## Contribution

Contributions to CausalSynth are welcome! If you have any suggestions, bug reports, or feature requests, please create an issue or submit a pull request.

## Authors

- **Zhehao Wang** - [zhehaow24@gmail.com](mailto:zhehaow24@gmail.com)
- **Arran Zeyu Wang** - [zeyuwang@cs.unc.edu](mailto:zeyuwang@cs.unc.edu)
- **David Borland** - [borland@renci.org](mailto:borland@renci.org)
- **David Gotz** - [gotz@unc.edu](mailto:gotz@unc.edu)

## Acknowledgments

This research is made possible in part by NSF Award #2211845.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
