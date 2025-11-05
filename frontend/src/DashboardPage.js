// src/DashboardPage.js
import React, { useState } from 'react';
import FileUpload from './FileUpload';
import DataViewer from './DataViewer';

function DashboardPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerDataRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <>
      <FileUpload onUploadSuccess={triggerDataRefresh} />
      <hr />
      <DataViewer 
        refreshTrigger={refreshTrigger} 
        onDataChange={triggerDataRefresh}
      />
    </>
  );
}

export default DashboardPage;