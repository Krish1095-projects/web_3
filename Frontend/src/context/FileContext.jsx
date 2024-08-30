import React, { createContext, useContext, useState } from 'react';

// Create a context
const FileContext = createContext();

// Create a provider component
export const FileProvider = ({ children }) => {
    const [file, setFile] = useState(null);
    const [fileData, setFileData] = useState(null);
    const [filename, setFilename] = useState(null); // State for filename

    return (
        <FileContext.Provider value={{ file,setFile, fileData, setFileData, filename, setFilename }}>
            {children}
        </FileContext.Provider>
    );
};

// Custom hook for using the context
export const useFileContext = () => {
    return useContext(FileContext);
};
