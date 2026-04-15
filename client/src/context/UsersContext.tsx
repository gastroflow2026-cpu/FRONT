"use client"
import { createContext, useState, ReactNode, useEffect } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { log } from "console";

interface LoginValues {
    email: string;
    password: string;
}

interface RegisterValues {
    email: string;
    password: string;
    confirmPassword: string; 
    first_name: string;
    last_name:string;

}

interface UsersContextType {
    isLogged: any;
    loginUser: (values: LoginValues) => {};
    loginUserGoogle: () => {};
    logoutUser: () => void;
    registerNewUser: (values: RegisterValues) => Promise<number>;
}

export const UsersContext = createContext<UsersContextType>({
    isLogged: "",
    loginUser: async (values) => {},
    loginUserGoogle: async () => {},
    logoutUser: () => {},
    registerNewUser: async (values) => 0,
})

export const UsersProvider = ({ children }: { children: ReactNode }) => {
    const [isLogged, setIsLogged] = useState(() => {
    if (typeof window === "undefined") return null;
    const name = localStorage.getItem("name");
    return name ? { name } : null;;
    }); 

    const loginUser = async (values: LoginValues): Promise<number> => {
        const res = await axios.post("http://localhost:3000/auth/signin", values);
        if (!res.data.user) throw new Error("No se recibió el usuario");

        const token = res.data.token;
        const user = res.data.user;
        localStorage.setItem("token", JSON.stringify(token));
        localStorage.setItem("name", user.name);
        setIsLogged(user.name);
        return res.status;
    }

    const loginUserGoogle = async () => {
        window.location.href = 'http://localhost:3000/auth/google/login';
    }
    
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');

        if (token) {
        const payload = JSON.parse(decodeURIComponent(
        atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
));
        localStorage.setItem('token', token);
        localStorage.setItem('name', payload.name); 
        setIsLogged({ name: payload.name });
        }
    }, []);

    const logoutUser = (): void => {
        localStorage.removeItem("token");
        localStorage.removeItem("name");

       const url = new URL(window.location.href);
        url.searchParams.delete("token");
        window.history.replaceState({}, '', url);
        
        setIsLogged(null);
    }

    const registerNewUser = async (values: RegisterValues): Promise<number> => {
            const res = await axios.post("http://localhost:3000/auth/signup", values);
            return res.status;
    }

    const value: UsersContextType = {
        isLogged,
        loginUser,
        loginUserGoogle,
        logoutUser,
        registerNewUser,
    }

    return (
        <UsersContext.Provider value={value}>
            {children}
        </UsersContext.Provider>
    )
}