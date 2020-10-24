import React from 'react';
import './Sidebar.css';

type Props = {
  children: React.ReactNode[];
};

const Sidebar = ({ children }: Props) => {
  return <div className="sidebar">{children}</div>;
};

export default Sidebar;
