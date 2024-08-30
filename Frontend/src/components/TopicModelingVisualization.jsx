import React, { useEffect, useRef } from 'react';

const TopicModelingVisualization = ({ visualizationData }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        
        // Clear the container before rendering
        container.innerHTML = visualizationData; // Set the raw HTML

        // Execute any scripts included in the HTML
        const scripts = container.getElementsByTagName('script');
        for (let script of scripts) {
            const newScript = document.createElement('script');
            newScript.type = 'text/javascript';
            if (script.src) {
                newScript.src = script.src;
                newScript.async = true;
                newScript.onload = () => {
                    console.log('Script loaded:', script.src);
                };
            } else {
                // If there are inline scripts, execute them
                newScript.text = script.innerHTML;
            }
            document.body.appendChild(newScript);
        }

        // Cleanup function to remove any added scripts
        return () => {
            for (let script of scripts) {
                if (script.src) {
                    const newScript = document.querySelector(`script[src="${script.src}"]`);
                    if (newScript) {
                        document.body.removeChild(newScript);
                    }
                }
            }
        };
    }, [visualizationData]);

    return (
        <div
            ref={containerRef}
           
        />
    );
};

export default TopicModelingVisualization;
