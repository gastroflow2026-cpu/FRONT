"use client"
import { createContext, useState, ReactNode, useEffect } from "react";
import axios from "axios";

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
    loginUser: (values: LoginValues) => Promise<number>;
    loginUserGoogle: () => {};
    logoutUser: () => void;
    registerNewUser: (values: RegisterValues) => Promise<number>;
}

export const UsersContext = createContext<UsersContextType>({
    isLogged: "",
    loginUser: async (values) => 0,
    loginUserGoogle: async () => {},
    logoutUser: () => {},
    registerNewUser: async (values) => 0,
})

export const UsersProvider = ({ children }: { children: ReactNode }) => {

    const [isLogged, setIsLogged] = useState(() => {
    if (typeof window === "undefined") return null;
    return JSON.parse(localStorage.getItem("user") || "null");
    }); 

    const loginUser = async (values: LoginValues): Promise<number> => {
        const res = await axios.post("http://localhost:3000/auth/signin", values);
        if (!res.data.user) throw new Error("No se recibió el usuario");

        setIsLogged(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        return res.status;
    }

     const loginUserGoogle = async () => {
        window.location.href = 'http://localhost:3000/auth/google/login';
    }
    
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("token");

        if(token){
            localStorage.setItem("jwtToken", token);
        }
    }, [])
    
    const logoutUser = (): void => {
        localStorage.removeItem("user");
        setIsLogged(false);
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