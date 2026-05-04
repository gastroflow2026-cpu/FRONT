"use client";
import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";
import axios from "axios";
import { getToken } from "@/helpers/getToken";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.trim();

const buildTableCandidates = (baseUrl: string, restaurantId: string) => [
    `${baseUrl}/restaurants/${restaurantId}/tables/availableTables`,
    `${baseUrl}/restaurants/${restaurantId}/tables/available`,
    `${baseUrl}/restaurants/${restaurantId}/tables`,
    `${baseUrl}/tables/restaurant/${restaurantId}`,
];

export type TableLayoutShape = "square" | "round" | "rectangle";

export interface Table {
    id: string;
    table_number: number;
    capacity: number;
    zone: string;
    status: string;
    is_active: boolean;
    layout_x?: number | null;
    layout_y?: number | null;
    layout_width?: number;
    layout_height?: number;
    layout_shape?: TableLayoutShape;
    layout_rotation?: number;
    is_visible?: boolean;
}

export interface CreateTablePayload {
    table_number: number;
    capacity: number;
    zone: string;
    is_active?: boolean;
    layout_x?: number | null;
    layout_y?: number | null;
    layout_width?: number;
    layout_height?: number;
    layout_shape?: TableLayoutShape;
    layout_rotation?: number;
    is_visible?: boolean;
}

export type UpdateTablePayload = Partial<CreateTablePayload>;

export interface UpdateTableLayoutItem {
    id: string;
    layout_x: number;
    layout_y: number;
    layout_width?: number;
    layout_height?: number;
    layout_shape?: TableLayoutShape;
    layout_rotation?: number;
    is_visible?: boolean;
}

interface TablesContextType {
    tables: Table[];
    loading: boolean;
    getTables: (restaurantId: string, date?: string, time?: string) => Promise<void>;
    createTable: (restaurantId: string, payload: CreateTablePayload) => Promise<Table | null>;
    updateTable: (restaurantId: string, tableId: string, payload: UpdateTablePayload) => Promise<Table | null>;
    saveTablesLayout: (restaurantId: string, tables: UpdateTableLayoutItem[]) => Promise<Table[]>;
}

export const TablesContext = createContext<TablesContextType>({
    tables: [],
    loading: false,
    getTables: async () => {},
    createTable: async () => null,
    updateTable: async () => null,
    saveTablesLayout: async () => [],
});

const TablesProvider = ({ children }: { children: ReactNode }) => {
    const [tables, setTables] = useState<Table[]>([]);
    const [loading, setLoading] = useState(false);

    const getAuthHeaders = useCallback(() => {
        const token = getToken();

        if (!token) return null;

        return { Authorization: `Bearer ${token}` };
    }, []);

    const getTables = useCallback(async (restaurantId: string, date?: string, time?: string) => {
        if (!API_URL || !restaurantId) {
            setTables([]);
            return;
        }

        setLoading(true);

        try {
            const token = getToken();
            const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
            const params = date || time ? { date, time } : undefined;
            const candidates = buildTableCandidates(API_URL, restaurantId);

            let loadedTables: Table[] = [];

            for (const endpoint of candidates) {
                try {
                    const response = await axios.get(endpoint, { headers, params });
                    const raw = response.data;

                    if (!raw) continue;

                    const parsed: Table[] = Array.isArray(raw) ? raw : [];
                    if (parsed.length === 0) continue;

                    loadedTables = parsed;
                    break;
                } catch (error: unknown) {
                    if (axios.isAxiosError(error)) {
                        const status = error.response?.status;
                        if (status === 404 || !status) continue;
                        throw error;
                    }
                    throw error;
                }
            }

            setTables(loadedTables);
        } catch (error: unknown) {
            const msg = axios.isAxiosError(error)
                ? `${error.response?.status} – ${error.response?.data?.message || error.message}`
                : String(error);
            console.warn(msg);
            setTables([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const createTable = useCallback(async (restaurantId: string, payload: CreateTablePayload) => {
        if (!API_URL || !restaurantId) return null;

        const headers = getAuthHeaders();
        if (!headers) return null;

        const response = await axios.post<Table>(
            `${API_URL}/restaurants/${restaurantId}/tables/newTable`,
            payload,
            { headers },
        );

        const createdTable = response.data;
        setTables((prev) => [...prev, createdTable]);

        return createdTable;
    }, [getAuthHeaders]);

    const updateTable = useCallback(async (
        restaurantId: string,
        tableId: string,
        payload: UpdateTablePayload,
    ) => {
        if (!API_URL || !restaurantId || !tableId) return null;

        const headers = getAuthHeaders();
        if (!headers) return null;

        const response = await axios.patch<Table>(
            `${API_URL}/restaurants/${restaurantId}/tables/${tableId}`,
            payload,
            { headers },
        );

        const updatedTable = response.data;
        setTables((prev) => prev.map((table) => table.id === updatedTable.id ? updatedTable : table));

        return updatedTable;
    }, [getAuthHeaders]);

    const saveTablesLayout = useCallback(async (restaurantId: string, layoutTables: UpdateTableLayoutItem[]) => {
        if (!API_URL || !restaurantId) return [];

        const headers = getAuthHeaders();
        if (!headers) return [];

        const response = await axios.patch<Table[]>(
            `${API_URL}/restaurants/${restaurantId}/tables/layout`,
            { tables: layoutTables },
            { headers },
        );

        const updatedTables = Array.isArray(response.data) ? response.data : [];
        const updatedTablesById = new Map(updatedTables.map((table) => [table.id, table]));

        setTables((prev) => prev.map((table) => updatedTablesById.get(table.id) ?? table));

        return updatedTables;
    }, [getAuthHeaders]);

    const value: TablesContextType = useMemo(() => ({
        tables,
        loading,
        getTables,
        createTable,
        updateTable,
        saveTablesLayout,
    }), [tables, loading, getTables, createTable, updateTable, saveTablesLayout]);

    return (
        <TablesContext.Provider value={value}>
            {children}
        </TablesContext.Provider>
    );
};

export const useTables = () => useContext(TablesContext);

export default TablesProvider;
