"use client";

import { useCallback, useContext, useEffect, useState } from "react";
import { UsersContext } from "@/context/UsersContext";
import { CreateTablePayload, Table, UpdateTablePayload, UpdateTableLayoutItem, useTables } from "@/context/TablesContext";
import { TableForm } from "./TableForm";
import { TableLayoutEditor } from "./TableLayoutEditor";
import styles from "./TablesLayout.module.css";

export function TablesLayout() {
  const { isLogged } = useContext(UsersContext);
  const restaurantId = isLogged?.restaurant_id ?? null;
  const { tables, loading, getTables, createTable, updateTable, saveTablesLayout } = useTables();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!restaurantId) return;
    void getTables(restaurantId);
  }, [getTables, restaurantId]);

  const handleCreate = useCallback(async (payload: CreateTablePayload) => {
    if (!restaurantId) return;

    const createdTable = await createTable(restaurantId, payload);
    if (createdTable) {
      setMessage("Mesa creada. Ubicala en la grilla para que pueda aparecer al comensal.");
      setIsFormOpen(false);
    }
  }, [createTable, restaurantId]);

  const handleUpdate = useCallback(async (tableId: string, payload: UpdateTablePayload) => {
    if (!restaurantId) return;

    const updatedTable = await updateTable(restaurantId, tableId, payload);
    if (updatedTable) {
      setMessage("Mesa actualizada.");
      setEditingTable(null);
      setIsFormOpen(false);
    }
  }, [restaurantId, updateTable]);

  const handleSaveLayout = useCallback(async (layoutTables: UpdateTableLayoutItem[]) => {
    if (!restaurantId) return;

    await saveTablesLayout(restaurantId, layoutTables);
    setMessage("Layout guardado.");
  }, [restaurantId, saveTablesLayout]);

  if (!restaurantId) {
    return (
      <section className={styles.container}>
        <h2>Layout de mesas</h2>
        <p className={styles.emptyText}>No hay restaurante asociado a esta sesion.</p>
      </section>
    );
  }

  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <div>
          <h2>Layout de mesas</h2>
          <p>Configura la distribucion visual del restaurante.</p>
        </div>
        <button
          type="button"
          className={styles.primaryButton}
          onClick={() => {
            setEditingTable(null);
            setIsFormOpen(true);
            setMessage("");
          }}
        >
          Crear mesa
        </button>
      </header>

      {message && <p className={styles.feedback}>{message}</p>}

      {isFormOpen && (
        <TableForm
          table={editingTable}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingTable(null);
          }}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
        />
      )}

      {loading ? (
        <div className={styles.loading}>Cargando mesas...</div>
      ) : (
        <TableLayoutEditor
          tables={tables}
          onEditTable={(table) => {
            setEditingTable(table);
            setIsFormOpen(true);
            setMessage("");
          }}
          onSaveLayout={handleSaveLayout}
        />
      )}
    </section>
  );
}
