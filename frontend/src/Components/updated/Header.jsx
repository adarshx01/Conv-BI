import React from 'react';
import { Search, Bell, HelpCircle } from 'lucide-react';

function Header({ onExport }) {
  return (
    <header className="header">
      <div className="header-left">
        <button className="ai-assist-button">
          AI-assist
          <span className="ai-dots">
            <span className="ai-dot"></span>
            <span className="ai-dot"></span>
            <span className="ai-dot"></span>
          </span>
        </button>
        <button className="header-button">Custom Report</button>
        <button className="header-button">Pre-built Reports</button>
        <button className="header-button advanced-query">Advanced Query Support</button>
        <button className="header-button" onClick={onExport}>
          Export <span className="fire-emoji">🔥</span>
        </button>
      </div>
      <div className="header-right">
        <Search className="header-icon" />
        <Bell className="header-icon" />
        <HelpCircle className="header-icon" />
      </div>
    </header>
  );
}

export default Header;

    