import React, { createContext, useState, useContext, useEffect } from 'react';
import * as authApi from '../api/auth.api';
import ClientAuthContext from './ClientAuthContext';

const SellerAuthContext = createContext();

// Login for the "seller" role only. A user becomes a seller by applying
// through /become-seller and being approved by an admin (see
// admin.controller.js -> approveSeller) — there is no seller signup here.
// Staff accounts (admin/superadmin) have their own AdminAuthContext.
//
// SellerAuthProvider is mounted INSIDE ClientAuthProvider (see App.tsx), so
// on initial load it reuses the user ClientAuthContext already fetched from
// GET /users/current-user instead of firing a second, identical request.
// If mounted standalone, it gracefully fetches current-user directly.

export const SellerAuthProvider = ({ children }) => {
  const clientAuth = useContext(ClientAuthContext);
  const clientUser = clientAuth ? clientAuth.user : null;
  const clientLoading = clientAuth ? clientAuth.isLoading : false;
  const [isSellerAuthenticated, setIsSellerAuthenticated] = useState(false);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (clientAuth) {
      if (clientLoading) return;
      if (clientUser?.role === 'seller') {
        setSeller(clientUser);
        setIsSellerAuthenticated(true);
      } else {
        setSeller(null);
        setIsSellerAuthenticated(false);
      }
      setLoading(false);
    } else {
      authApi.getCurrentUser()
        .then((res) => {
          const user = res?.data;
          if (user?.role === 'seller') {
            setSeller(user);
            setIsSellerAuthenticated(true);
          } else {
            setSeller(null);
            setIsSellerAuthenticated(false);
          }
        })
        .catch(() => {
          setSeller(null);
          setIsSellerAuthenticated(false);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [clientUser, clientLoading, clientAuth]);

  const sellerLogin = async (email, password) => {
    try {
      const isEmail = email.includes('@');
      const res = await authApi.loginUser({
        email: isEmail ? email : undefined,
        userName: isEmail ? undefined : email,
        password,
      });

      const loggedInUser = res.data.user;
      if (loggedInUser.role !== 'seller') {
        return {
          success: false,
          error:
            loggedInUser.role === 'user'
              ? "This account isn't an approved seller yet. Apply from your account menu, or check your application status."
              : 'This account does not have seller access.',
        };
      }

      setSeller(loggedInUser);
      setIsSellerAuthenticated(true);
      return { success: true, seller: loggedInUser };
    } catch (err) {
      return { success: false, error: err.message || 'Login failed. Please try again.' };
    }
  };

  const sellerLogout = async () => {
    try {
      await authApi.logoutUser();
    } catch {
      // clear local state regardless
    }
    setSeller(null);
    setIsSellerAuthenticated(false);
  };

  const value = {
    isSellerAuthenticated,
    seller,
    loading,
    sellerLogin,
    sellerLogout,
  };

  return (
    <SellerAuthContext.Provider value={value}>
      {!loading && children}
    </SellerAuthContext.Provider>
  );
};

export const useSellerAuth = () => {
  const context = useContext(SellerAuthContext);
  if (!context) {
    throw new Error('useSellerAuth must be used within SellerAuthProvider');
  }
  return context;
};

export default SellerAuthContext;
