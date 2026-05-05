"use client";

import { useContext, useEffect, useState } from "react";
import { useFormik } from "formik";
import Swal from "sweetalert2";
import { Building2, Globe, ImageIcon, Mail, MapPin, Phone, Save, ScrollText } from "lucide-react";
import { UsersContext } from "@/context/UsersContext";
import { getToken } from "@/helpers/getToken";
import styles from "./Settings.module.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface RestaurantData {
  name?: string;
  slug?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  description?: string;
  category?: string;
  image_url?: string;
  about?: string;
  is_active?: boolean;
}

const fieldClassName = styles.field;

export function Settings() {
  const { isLogged } = useContext(UsersContext);
  const [isLoading, setIsLoading] = useState(true);
  const [initialData, setInitialData] = useState<RestaurantData>({
    name: "",
    slug: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    country: "",
    description: "",
    category: "",
    image_url: "",
    about: "",
    is_active: true,
  });

  useEffect(() => {
    const fetchRestaurantData = async () => {
      const token = getToken();

      if (!token || !API_URL) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/restaurant/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          setIsLoading(false);
          return;
        }

        const data = await response.json();
        setInitialData({
          name: data.name || "",
          slug: data.slug || "",
          phone: data.phone || "",
          email: data.email || "",
          address: data.address || "",
          city: data.city || "",
          country: data.country || "",
          description: data.description || "",
          category: data.category || "",
          image_url: data.image_url || "",
          about: data.about || "",
          is_active: data.is_active ?? true,
        });
      } catch (error) {
        console.error("Error fetching restaurant data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurantData();
  }, []);

  const formik = useFormik({
    initialValues: initialData,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const token = getToken();

        if (!token || !API_URL) {
          await Swal.fire({
            theme: "dark",
            icon: "error",
            title: "Error",
            text: "No se pudo actualizar la configuracion.",
            confirmButtonColor: "#f97316",
          });
          setSubmitting(false);
          return;
        }

        const payload = values;

        const response = await fetch(`${API_URL}/restaurant/profile`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          await Swal.fire({
            theme: "dark",
            icon: "success",
            title: "Configuracion actualizada",
            text: "Los cambios se guardaron correctamente.",
            confirmButtonColor: "#f97316",
          });
        } else {
          const data = await response.json();
          await Swal.fire({
            theme: "dark",
            icon: "error",
            title: "Error",
            text: data.message || "No se pudo actualizar la configuracion.",
            confirmButtonColor: "#f97316",
          });
        }
      } catch (error) {
        await Swal.fire({
          theme: "dark",
          icon: "error",
          title: "Error",
          text: "Ocurrio un error al guardar los cambios.",
          confirmButtonColor: "#f97316",
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Cargando configuracion...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h2>Configuracion del Restaurante</h2>
          <p>Administra la informacion de tu restaurante</p>
        </div>
      </div>

      <form onSubmit={formik.handleSubmit} className={styles.form}>
        <div className={styles.grid}>
          <div className={styles.fullWidth}>
            <label className={styles.label}>
              <Building2 className={styles.labelIcon} />
              Nombre del restaurante
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Bistro Central"
              maxLength={100}
              className={fieldClassName}
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </div>

          <div>
            <label className={styles.label}>
              <Globe className={styles.labelIcon} />
              Slug
            </label>
            <input
              id="slug"
              name="slug"
              type="text"
              placeholder="nombre-del-restaurante"
              maxLength={150}
              className={fieldClassName}
              value={formik.values.slug}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </div>

          <div>
            <label className={styles.label}>
              <Phone className={styles.labelIcon} />
              Telefono
            </label>
            <input
              id="phone"
              name="phone"
              type="text"
              placeholder="+54 11 1234 5678"
              maxLength={20}
              className={fieldClassName}
              value={formik.values.phone}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </div>

          <div>
            <label className={styles.label}>
              <Mail className={styles.labelIcon} />
              Email del restaurante
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="contacto@bistro.com"
              maxLength={150}
              className={fieldClassName}
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </div>

          <div>
            <label className={styles.label}>
              <ImageIcon className={styles.labelIcon} />
              URL del Logo
            </label>
            <input
              id="image_url"
              name="image_url"
              type="url"
              placeholder="https://..."
              className={fieldClassName}
              value={formik.values.image_url}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </div>

          <div>
            <label className={styles.label}>
              <MapPin className={styles.labelIcon} />
              Direccion
            </label>
            <input
              id="address"
              name="address"
              type="text"
              placeholder="Av. Corrientes 1234"
              maxLength={150}
              className={fieldClassName}
              value={formik.values.address}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </div>

          <div>
            <label className={styles.label}>Ciudad</label>
            <input
              id="city"
              name="city"
              type="text"
              placeholder="Buenos Aires"
              maxLength={80}
              className={fieldClassName}
              value={formik.values.city}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </div>

          <div>
            <label className={styles.label}>Pais</label>
            <input
              id="country"
              name="country"
              type="text"
              placeholder="Argentina"
              maxLength={80}
              className={fieldClassName}
              value={formik.values.country}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </div>

          <div>
            <label className={styles.label}>Categoria</label>
            <input
              id="category"
              name="category"
              type="text"
              placeholder="Ej: Italiana, Parrilla, Sushi..."
              maxLength={80}
              className={fieldClassName}
              value={formik.values.category}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </div>
        </div>

        <div>
          <label className={styles.label}>
            <ScrollText className={styles.labelIcon} />
            Descripcion
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            placeholder="Describe el concepto, la cocina o el valor diferencial del restaurante."
            className={`${fieldClassName} ${styles.textarea}`}
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
        </div>

        <div>
          <label className={styles.label}>About</label>
          <textarea
            id="about"
            name="about"
            rows={3}
            placeholder="Breve reseña sobre la historia o filosofia del restaurante."
            className={`${fieldClassName} ${styles.textarea}`}
            value={formik.values.about}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
        </div>

        <label className={styles.checkboxLabel}>
          <input
            id="is_active"
            name="is_active"
            type="checkbox"
            className={styles.checkbox}
            checked={formik.values.is_active}
            onChange={formik.handleChange}
          />
          <span>
            <strong className={styles.checkboxText}>Restaurante activo</strong>
            <span className={styles.checkboxDescription}>
              Marcale si quieres que tu restaurante este visible para los clientes.
            </span>
          </span>
        </label>

        <button type="submit" disabled={formik.isSubmitting} className={styles.submitButton}>
          <Save className={styles.buttonIcon} />
          {formik.isSubmitting ? "Guardando..." : "Guardar Cambios"}
        </button>
      </form>
    </div>
  );
}
