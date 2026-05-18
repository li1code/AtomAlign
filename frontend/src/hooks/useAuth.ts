"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const { user, token, isAuthenticated, setAuth, logout } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken && !isAuthenticated) {
        try {
          const res = await api.get('/auth/me', {
            headers: { Authorization: `Bearer ${storedToken}` }
          });
          setAuth(res.data, storedToken);
        } catch (error) {
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [isAuthenticated, setAuth]);

  const loginRedirect = (role: string) => {
    switch(role) {
      case 'ADMIN':
        router.push('/dashboard/admin');
        break;
      case 'MANAGER':
        router.push('/dashboard/manager');
        break;
      default:
        router.push('/dashboard/employee');
    }
  };

  return { user, token, isAuthenticated, loading, setAuth, logout, loginRedirect };
}
