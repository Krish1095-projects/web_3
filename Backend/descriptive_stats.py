import pandas as pd
import re
import os

class DataProcessor:
    def __init__(self, file_name):
        self.file_name = file_name
        self.data = None
    
    def load_data(self):
        """Load data from CSV, Excel, or JSON file."""
        if self.file_name.endswith('.csv'):
            self.data = pd.read_csv(self.file_name)
        elif self.file_name.endswith('.xlsx'):
            self.data = pd.read_excel(self.file_name)
        elif self.file_name.endswith('.json'):
            self.data = pd.read_json(self.file_name)
        else:
            raise ValueError("Unsupported file format. Please provide a .csv, .xlsx, or .json file.")
    
    def get_label_distribution(self):
        """Return label or target distribution from the DataFrame."""
        if self.data is not None:
            # Check if 'label' or 'target' is present in the DataFrame columns
            if 'label' in self.data.columns:
                return self.data['label'].value_counts().to_dict()
            elif 'target' in self.data.columns:
                return self.data['target'].value_counts().to_dict()
            elif 'Unnamed: 0' in self.data.columns and self.data['Unnamed: 0'].nunique()<=10:
                return self.data['Unnamed: 0'].value_counts().to_dict()
            else:
                return {"error": "Neither 'label' nor 'target' column found in the dataset."}
        else:
            return {"error": "No data available."}
    def get_count(self):
        if self.data is not None:
            return {'total_entries': self.data.size}
    
    def get_data_types(self):
        """Return the data types of each column."""
        if self.data is not None:
            return self.data.dtypes.astype(str).to_dict()
        else:
            raise ValueError("Data not loaded. Please load the data first.")
    
    def get_missing_values(self):
        """Return the count of missing values in each column."""
        if self.data is not None:
            return self.data.isnull().sum().to_dict()
        else:
            raise ValueError("Data not loaded. Please load the data first.")

