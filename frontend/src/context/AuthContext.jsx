import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';

const AuthContext = createContext({});
const API_URL = API_BASE_URL;

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchUser(token);
        } else {
            setLoading(false);
        }
    }, []);

    const fetchUser = async (token) => {
        try {
            const response = await axios.get(`${API_URL}/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(response.data);
        } catch (error) {
            localStorage.removeItem('token');
        } finally {
            setLoading(false);
        }
    };

    const login = async (mobile, password) => {
        const response = await axios.post(`${API_URL}/login`, {
            mobile_number: mobile,
            password: password
        });
        localStorage.setItem('token', response.data.access_token);
        await fetchUser(response.data.access_token);
        return response.data;
    };

    const signup = async (mobile, password) => {
        const response = await axios.post(`${API_URL}/signup`, {
            mobile_number: mobile,
            password: password
        });
        return response.data;
    };

    const updateProfile = async (firstName, lastName) => {
        const token = localStorage.getItem('token');
        const response = await axios.put(`${API_URL}/profile`, {
            first_name: firstName,
            last_name: lastName
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
        return response.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, updateProfile, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
