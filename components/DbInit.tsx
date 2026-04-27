'use client';
import { useEffect } from 'react';

export default function DbInit() {
  useEffect(() => {
    fetch('/api/init').catch(console.error);
  }, []);
  return null;
}
