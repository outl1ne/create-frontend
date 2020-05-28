import React from 'react';
import AppDataContext from './AppDataContext';

export default function useAppData() {
  return React.useContext(AppDataContext);
}
