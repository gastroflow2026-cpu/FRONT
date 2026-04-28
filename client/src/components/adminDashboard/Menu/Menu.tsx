"use client";

import { useState } from "react";
import styles from "./Menu.module.css";
import { MenuView } from "./MenuView/MenuView";
import { CategoriesView } from "./CategoryView/CategoryView";
import { useMenu } from "@/utils/useMenu";
import { useCategories } from "@/utils/useCategory";

export function Menu() {
  const [activeTab, setActiveTab] = useState<"menu" | "categories">("menu");

  const { platesList, createItem, updateItem, deleteItem, changeStatus } = useMenu();

  const { categories, createCategory, updateCategory, deleteCategory } =
    useCategories();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2>Gestión de Menú</h2>
        <p>Administra categorías y platillos del restaurante</p>
      </header>

      <nav className={styles.tabs}>
        <button
          className={activeTab === "menu" ? styles.activeTab : ""}
          onClick={() => setActiveTab("menu")}
        >
          Platillos
        </button>
        <button
          className={activeTab === "categories" ? styles.activeTab : ""}
          onClick={() => setActiveTab("categories")}
        >
          Categorías
        </button>
      </nav>

      <main>
        {activeTab === "menu" && (
          <MenuView
            // menuItems={menuItems}
            platesList={platesList}
            onCreateItem={createItem}
            categories={categories}
            onUpdateItem={updateItem}
            onDeleteItem={deleteItem}
            onStatusChange={changeStatus}
          />
        )}

        {activeTab === "categories" && (
          <CategoriesView
            categories={categories}
            onCreateCategory={createCategory}
            onUpdateCategory={updateCategory}
            onDeleteCategory={deleteCategory}
          />
        )}
      </main>
    </div>
  );
}
