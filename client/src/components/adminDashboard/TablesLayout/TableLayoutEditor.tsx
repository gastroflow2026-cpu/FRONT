"use client";

import { useEffect, useMemo, useState } from "react";
import { Table, UpdateTableLayoutItem } from "@/context/TablesContext";
import styles from "./TablesLayout.module.css";

const COLUMNS = 6;
const ROWS = 5;

type DraftTable = Table & {
  layout_x?: number | null;
  layout_y?: number | null;
};

interface TableLayoutEditorProps {
  tables: Table[];
  onEditTable: (table: Table) => void;
  onSaveLayout: (tables: UpdateTableLayoutItem[]) => Promise<void>;
}

const hasPosition = (table: DraftTable) =>
  typeof table.layout_x === "number" && typeof table.layout_y === "number";

const getCellKey = (x: number, y: number) => `${x}-${y}`;

export function TableLayoutEditor({ tables, onEditTable, onSaveLayout }: TableLayoutEditorProps) {
  const [draftTables, setDraftTables] = useState<DraftTable[]>(tables);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setDraftTables(tables);
    setSelectedTableId(null);
  }, [tables]);

  const positionedTables = useMemo(
    () => draftTables.filter((table) => hasPosition(table)),
    [draftTables],
  );

  const unpositionedTables = useMemo(
    () => draftTables.filter((table) => !hasPosition(table)),
    [draftTables],
  );

  const tablesByCell = useMemo(() => {
    const map = new Map<string, DraftTable>();

    positionedTables.forEach((table) => {
      if (typeof table.layout_x === "number" && typeof table.layout_y === "number") {
        const key = getCellKey(table.layout_x, table.layout_y);
        if (!map.has(key)) {
          map.set(key, table);
        }
      }
    });

    return map;
  }, [positionedTables]);

  const selectedTable = selectedTableId
    ? draftTables.find((table) => table.id === selectedTableId) ?? null
    : null;

  const moveSelectedTable = (x: number, y: number) => {
    if (!selectedTable) return;

    const occupiedTable = tablesByCell.get(getCellKey(x, y));
    if (occupiedTable && occupiedTable.id !== selectedTable.id) {
      setFeedback("Esa celda ya tiene una mesa.");
      return;
    }

    setDraftTables((prev) =>
      prev.map((table) =>
        table.id === selectedTable.id
          ? {
              ...table,
              layout_x: x,
              layout_y: y,
              layout_width: table.layout_width ?? 1,
              layout_height: table.layout_height ?? 1,
              layout_shape: table.layout_shape ?? "square",
              layout_rotation: table.layout_rotation ?? 0,
              is_visible: table.is_visible ?? true,
            }
          : table,
      ),
    );
    setFeedback(`Mesa ${selectedTable.table_number} ubicada en la grilla.`);
  };

  const handleCellClick = (x: number, y: number) => {
    const table = tablesByCell.get(getCellKey(x, y));

    if (table) {
      setSelectedTableId(table.id);
      setFeedback(`Mesa ${table.table_number} seleccionada.`);
      return;
    }

    moveSelectedTable(x, y);
  };

  const handleSave = async () => {
    const layoutTables = draftTables
      .filter((table) => hasPosition(table))
      .map<UpdateTableLayoutItem>((table) => ({
        id: table.id,
        layout_x: table.layout_x as number,
        layout_y: table.layout_y as number,
        layout_width: table.layout_width ?? 1,
        layout_height: table.layout_height ?? 1,
        layout_shape: table.layout_shape ?? "square",
        layout_rotation: table.layout_rotation ?? 0,
        is_visible: table.is_visible ?? true,
      }));

    setIsSaving(true);
    setFeedback("");

    try {
      await onSaveLayout(layoutTables);
      setFeedback("Layout guardado correctamente.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "No se pudo guardar el layout.");
    } finally {
      setIsSaving(false);
    }
  };

  const cells = Array.from({ length: COLUMNS * ROWS }, (_, index) => ({
    x: index % COLUMNS,
    y: Math.floor(index / COLUMNS),
  }));

  return (
    <section className={styles.editorShell}>
      <div className={styles.editorMain}>
        <div className={styles.legend}>
          <span><i className={styles.visibleDot} /> visible</span>
          <span><i className={styles.hiddenDot} /> oculta al comensal</span>
          <span><i className={styles.inactiveDot} /> inactiva</span>
        </div>

        <div className={styles.gridBoard}>
          {cells.map(({ x, y }) => {
            const table = tablesByCell.get(getCellKey(x, y));
            const isSelected = table?.id === selectedTableId;
            const isHidden = table?.is_visible === false;
            const isInactive = table?.is_active === false;

            return (
              <button
                key={getCellKey(x, y)}
                type="button"
                className={`${styles.cell} ${table ? styles.cellFilled : ""} ${isSelected ? styles.cellSelected : ""} ${isHidden ? styles.cellHidden : ""} ${isInactive ? styles.cellInactive : ""}`}
                onClick={() => handleCellClick(x, y)}
              >
                {table ? (
                  <>
                    <strong>Mesa {table.table_number}</strong>
                    <span>{table.capacity} pers.</span>
                    {isHidden && <small>Oculta al comensal</small>}
                    {isInactive && <small>Inactiva</small>}
                  </>
                ) : (
                  <span className={styles.cellEmpty}>+</span>
                )}
              </button>
            );
          })}
        </div>

        <div className={styles.editorFooter}>
          <p>Las mesas sin ubicar no apareceran para el comensal.</p>
          <button type="button" className={styles.primaryButton} onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Guardando..." : "Guardar layout"}
          </button>
        </div>

        {feedback && <p className={styles.feedback}>{feedback}</p>}
      </div>

      <aside className={styles.sidePanel}>
        <h3>Mesas sin ubicar</h3>
        {unpositionedTables.length === 0 ? (
          <p className={styles.emptyText}>Todas las mesas activas tienen posicion.</p>
        ) : (
          <div className={styles.unplacedList}>
            {unpositionedTables.map((table) => (
              <button
                key={table.id}
                type="button"
                className={`${styles.unplacedButton} ${selectedTableId === table.id ? styles.unplacedSelected : ""}`}
                onClick={() => {
                  setSelectedTableId(table.id);
                  setFeedback(`Mesa ${table.table_number} seleccionada. Ahora elegi una celda vacia.`);
                }}
              >
                <strong>Mesa {table.table_number}</strong>
                <span>{table.zone} · {table.capacity} pers.</span>
              </button>
            ))}
          </div>
        )}

        <h3>Mesas ubicadas</h3>
        <div className={styles.unplacedList}>
          {positionedTables.map((table) => (
            <button
              key={table.id}
              type="button"
              className={styles.unplacedButton}
              onClick={() => onEditTable(table)}
            >
              <strong>Mesa {table.table_number}</strong>
              <span>Editar datos</span>
            </button>
          ))}
        </div>
      </aside>
    </section>
  );
}
