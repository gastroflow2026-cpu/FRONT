"use client";

import { useEffect, useMemo, useState } from "react";
import { Bath, ChefHat, DoorOpen } from "lucide-react";
import { Table, UpdateTableLayoutItem } from "@/context/TablesContext";
import type {
  RestaurantLayoutMarker,
  RestaurantLayoutMarkerType,
} from "./TablesLayout";
import styles from "./TablesLayout.module.css";

const COLUMNS = 6;
const ROWS = 5;

type DraftTable = Table & {
  layout_x?: number | null;
  layout_y?: number | null;
};

interface TableLayoutEditorProps {
  tables: Table[];
  markers: RestaurantLayoutMarker[];
  onEditTable: (table: Table) => void;
  onSaveLayout: (
    tables: UpdateTableLayoutItem[],
    markers: RestaurantLayoutMarker[],
  ) => Promise<void>;
}

const MARKER_OPTIONS: {
  type: RestaurantLayoutMarkerType;
  label: string;
  icon: typeof DoorOpen;
}[] = [
  { type: "entrance", label: "Entrada", icon: DoorOpen },
  { type: "bathroom", label: "Baños", icon: Bath },
  { type: "kitchen", label: "Cocina", icon: ChefHat },
];

const hasPosition = (table: DraftTable) =>
  typeof table.layout_x === "number" && typeof table.layout_y === "number";

const getCellKey = (x: number, y: number) => `${x}-${y}`;

const getMarkerLabel = (type: RestaurantLayoutMarkerType) => {
  if (type === "entrance") return "Entrada";
  if (type === "bathroom") return "Baños";
  return "Cocina";
};

const getMarkerIcon = (type: RestaurantLayoutMarkerType) => {
  if (type === "entrance") return DoorOpen;
  if (type === "bathroom") return Bath;
  return ChefHat;
};

const getMarkerId = (type: RestaurantLayoutMarkerType) => `${type}-1`;

const buildPerimeterSlots = () => {
  const top = Array.from({ length: COLUMNS }, (_, index) => ({
    key: `top-${index}`,
    label: `Superior ${index + 1}`,
    layout_x: index + 1,
    layout_y: 0,
  }));

  const bottom = Array.from({ length: COLUMNS }, (_, index) => ({
    key: `bottom-${index}`,
    label: `Inferior ${index + 1}`,
    layout_x: index + 1,
    layout_y: ROWS + 1,
  }));

  const left = Array.from({ length: ROWS }, (_, index) => ({
    key: `left-${index}`,
    label: `Izquierda ${index + 1}`,
    layout_x: 0,
    layout_y: index + 1,
  }));

  const right = Array.from({ length: ROWS }, (_, index) => ({
    key: `right-${index}`,
    label: `Derecha ${index + 1}`,
    layout_x: COLUMNS + 1,
    layout_y: index + 1,
  }));

  return { top, bottom, left, right };
};

export function TableLayoutEditor({
  tables,
  markers,
  onEditTable,
  onSaveLayout,
}: TableLayoutEditorProps) {
  const [draftTables, setDraftTables] = useState<DraftTable[]>(tables);
  const [draftMarkers, setDraftMarkers] =
    useState<RestaurantLayoutMarker[]>(markers);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [selectedMarkerType, setSelectedMarkerType] =
    useState<RestaurantLayoutMarkerType | null>(null);
  const [feedback, setFeedback] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setDraftTables(tables);
    setSelectedTableId(null);
  }, [tables]);

  useEffect(() => {
    setDraftMarkers(markers);
    setSelectedMarkerType(null);
  }, [markers]);

  const positionedTables = useMemo(
    () => draftTables.filter((table) => hasPosition(table)),
    [draftTables],
  );

  const unpositionedTables = useMemo(
    () => draftTables.filter((table) => !hasPosition(table)),
    [draftTables],
  );

  const perimeterSlots = useMemo(() => buildPerimeterSlots(), []);

  const tablesByCell = useMemo(() => {
    const map = new Map<string, DraftTable>();

    positionedTables.forEach((table) => {
      if (
        typeof table.layout_x === "number" &&
        typeof table.layout_y === "number"
      ) {
        const key = getCellKey(table.layout_x, table.layout_y);

        if (!map.has(key)) {
          map.set(key, table);
        }
      }
    });

    return map;
  }, [positionedTables]);

  const markersByCell = useMemo(() => {
    const map = new Map<string, RestaurantLayoutMarker>();

    draftMarkers.forEach((marker) => {
      const key = getCellKey(marker.layout_x, marker.layout_y);

      if (!map.has(key)) {
        map.set(key, marker);
      }
    });

    return map;
  }, [draftMarkers]);

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

  const placeSelectedMarker = (layout_x: number, layout_y: number) => {
    if (!selectedMarkerType) return;

    const occupiedMarker = markersByCell.get(getCellKey(layout_x, layout_y));

    if (occupiedMarker && occupiedMarker.type !== selectedMarkerType) {
      setFeedback("Ese espacio ya tiene otra referencia.");
      return;
    }

    setDraftMarkers((prev) => {
      const withoutSameType = prev.filter(
        (marker) => marker.type !== selectedMarkerType,
      );

      return [
        ...withoutSameType,
        {
          id: getMarkerId(selectedMarkerType),
          type: selectedMarkerType,
          layout_x,
          layout_y,
        },
      ];
    });

    setFeedback(`${getMarkerLabel(selectedMarkerType)} ubicado en el perímetro.`);
  };

  const handleMainCellClick = (x: number, y: number) => {
    const table = tablesByCell.get(getCellKey(x, y));

    if (table) {
      setSelectedTableId(table.id);
      setSelectedMarkerType(null);
      setFeedback(`Mesa ${table.table_number} seleccionada.`);
      return;
    }

    if (selectedMarkerType) {
      setFeedback("Las referencias visuales se colocan solo en el perímetro.");
      return;
    }

    moveSelectedTable(x, y);
  };

  const handlePerimeterSlotClick = (layout_x: number, layout_y: number) => {
    const marker = markersByCell.get(getCellKey(layout_x, layout_y));

    if (marker) {
      setSelectedMarkerType(marker.type);
      setSelectedTableId(null);
      setFeedback(
        `${getMarkerLabel(marker.type)} seleccionado. Elige otro espacio del perímetro para moverlo.`,
      );
      return;
    }

    if (!selectedMarkerType) {
      setFeedback("Selecciona Entrada, Baños o Cocina antes de elegir un espacio.");
      return;
    }

    placeSelectedMarker(layout_x, layout_y);
  };

  const removeMarker = (type: RestaurantLayoutMarkerType) => {
    setDraftMarkers((prev) => prev.filter((marker) => marker.type !== type));

    if (selectedMarkerType === type) {
      setSelectedMarkerType(null);
    }

    setFeedback(`${getMarkerLabel(type)} eliminado del plano.`);
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
      await onSaveLayout(layoutTables, draftMarkers);
      setFeedback("Layout guardado correctamente.");
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : "No se pudo guardar el layout.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const mainCells = Array.from({ length: COLUMNS * ROWS }, (_, index) => ({
    x: index % COLUMNS,
    y: Math.floor(index / COLUMNS),
  }));

  const renderPerimeterSlot = (slot: {
    key: string;
    label: string;
    layout_x: number;
    layout_y: number;
  }) => {
    const marker = markersByCell.get(getCellKey(slot.layout_x, slot.layout_y));
    const isSelected = marker?.type === selectedMarkerType;

    if (marker) {
      const Icon = getMarkerIcon(marker.type);

      return (
        <button
          key={slot.key}
          type="button"
          className={`${styles.perimeterSlot} ${styles.perimeterSlotFilled} ${
            isSelected ? styles.perimeterSlotSelected : ""
          }`}
          onClick={() =>
            handlePerimeterSlotClick(slot.layout_x, slot.layout_y)
          }
        >
          <Icon size={15} />
          <span>{getMarkerLabel(marker.type)}</span>
        </button>
      );
    }

    return (
      <button
        key={slot.key}
        type="button"
        className={styles.perimeterSlot}
        onClick={() => handlePerimeterSlotClick(slot.layout_x, slot.layout_y)}
      >
        <span>{slot.label}</span>
      </button>
    );
  };

  return (
    <section className={styles.editorShell}>
      <div className={styles.editorMain}>
        <div className={styles.legend}>
          <span>
            <i className={styles.visibleDot} /> visible
          </span>
          <span>
            <i className={styles.hiddenDot} /> oculta al comensal
          </span>
          <span>
            <i className={styles.inactiveDot} /> inactiva
          </span>
          <span>
            <i className={styles.markerDot} /> referencia
          </span>
        </div>

        <div className={styles.markerToolbar}>
          <p>Referencias visuales del perímetro</p>

          <div className={styles.markerActions}>
            {MARKER_OPTIONS.map(({ type, label, icon: Icon }) => (
              <button
                key={type}
                type="button"
                className={`${styles.markerButton} ${
                  selectedMarkerType === type ? styles.markerButtonActive : ""
                }`}
                onClick={() => {
                  setSelectedMarkerType(type);
                  setSelectedTableId(null);
                  setFeedback(
                    `${label} seleccionado. Elige un espacio del perímetro.`,
                  );
                }}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.perimeterBoard}>
          <div className={styles.perimeterTop}>
            {perimeterSlots.top.map(renderPerimeterSlot)}
          </div>

          <div className={styles.perimeterMiddle}>
            <div className={styles.perimeterSide}>
              {perimeterSlots.left.map(renderPerimeterSlot)}
            </div>

            <div className={styles.gridBoard}>
              {mainCells.map(({ x, y }) => {
                const cellKey = getCellKey(x, y);
                const table = tablesByCell.get(cellKey);
                const isSelected = table?.id === selectedTableId;
                const isHidden = table?.is_visible === false;
                const isInactive = table?.is_active === false;

                return (
                  <button
                    key={cellKey}
                    type="button"
                    className={`${styles.cell} ${table ? styles.cellFilled : ""} ${
                      isSelected ? styles.cellSelected : ""
                    } ${isHidden ? styles.cellHidden : ""} ${
                      isInactive ? styles.cellInactive : ""
                    }`}
                    onClick={() => handleMainCellClick(x, y)}
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

            <div className={styles.perimeterSide}>
              {perimeterSlots.right.map(renderPerimeterSlot)}
            </div>
          </div>

          <div className={styles.perimeterBottom}>
            {perimeterSlots.bottom.map(renderPerimeterSlot)}
          </div>
        </div>

        <div className={styles.editorFooter}>
          <p>Las mesas sin ubicar no apareceran para el comensal.</p>

          <button
            type="button"
            className={styles.primaryButton}
            onClick={handleSave}
            disabled={isSaving}
          >
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
                className={`${styles.unplacedButton} ${
                  selectedTableId === table.id ? styles.unplacedSelected : ""
                }`}
                onClick={() => {
                  setSelectedTableId(table.id);
                  setSelectedMarkerType(null);
                  setFeedback(
                    `Mesa ${table.table_number} seleccionada. Ahora elige una celda vacia.`,
                  );
                }}
              >
                <strong>Mesa {table.table_number}</strong>
                <span>
                  {table.zone} · {table.capacity} pers.
                </span>
              </button>
            ))}
          </div>
        )}

        <h3>Referencias ubicadas</h3>

        <div className={styles.unplacedList}>
          {draftMarkers.length === 0 ? (
            <p className={styles.emptyText}>No hay referencias ubicadas.</p>
          ) : (
            draftMarkers.map((marker) => (
              <div key={marker.id} className={styles.markerRow}>
                <button
                  type="button"
                  className={styles.unplacedButton}
                  onClick={() => {
                    setSelectedMarkerType(marker.type);
                    setSelectedTableId(null);
                    setFeedback(
                      `${getMarkerLabel(marker.type)} seleccionado. Elige otro espacio del perímetro para moverlo.`,
                    );
                  }}
                >
                  <strong>{getMarkerLabel(marker.type)}</strong>
                  <span>
                    Posición {marker.layout_x}, {marker.layout_y}
                  </span>
                </button>

                <button
                  type="button"
                  className={styles.removeMarkerButton}
                  onClick={() => removeMarker(marker.type)}
                >
                  Quitar
                </button>
              </div>
            ))
          )}
        </div>

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