"use client";
import { createContext, ReactNode, useContext, useState } from "react";
import axios from "axios";

export interface Table {
    id: string;
    table_number: number;
    capacity: number;
    zone: string;
    status: string;
    is_active: boolean;
}

interface TablesContextType {
    tables: Table[];
    loading: boolean;
    getTables: (restaurantId: string) => Promise<void>;
}

export const TablesContext = createContext<TablesContextType>({
    tables: [],
    loading: false,
    getTables: async () => {},
});

const TablesProvider = ({ children }: { children: ReactNode }) => {
    const [tables, setTables] = useState<Table[]>([]);
    const [loading, setLoading] = useState(false);

    const getTables = async (restaurantId: string) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `http://localhost:3000/restaurants/11111111-1111-1111-1111-111111111111/tables/availableTables`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setTables(response.data);
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Error al obtener las mesas');
        } finally {
            setLoading(false);
        }
    };

    const value: TablesContextType = {
        tables,
        loading,
        getTables,
    };

    return (
        <TablesContext.Provider value={value}>
            {children}
        </TablesContext.Provider>
    );
};

export const useTables = () => useContext(TablesContext);

export default TablesProvider;