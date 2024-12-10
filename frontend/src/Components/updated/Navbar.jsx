import React from 'react';

function Navbar({ onExport }) {
  return (
    <div className="navbar justify-between">
      <div className="navbar-brand ">Custom Report Builder</div>
      <div className="navbar-menu ">
        <button onClick={() => {}}>Custom Report</button>
        <button onClick={() => {}}>Pre-built Reports</button>
        <button onClick={() => {}}>Advanced Query</button>
        <button onClick={onExport}>Export</button>
      </div>
    </div>
  );
}

export default Navbar;

