// "use client";

// import { useEffect, useState } from "react";
// import { X } from "lucide-react";
// import styles from "./EditMenuItemDialog.module.css";
// import { ImageUpload } from "@/components/ui/ImageUpload";

// type MenuItemStatus = "disponible" | "agotado" | "inactivo";

// type EditMenuItemPayload = {
//   id: string;
//   name: string;
//   description: string;
//   price: number;
//   image_url: string;
//   status: MenuItemStatus;
// };

// interface EditMenuItemDialogProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onSubmit: (item: EditMenuItemPayload) => void;
//   item: EditMenuItemPayload | null;
// }

// const isMenuItemStatus = (value: string): value is MenuItemStatus => {
//   return ["disponible", "agotado", "inactivo"].includes(value);
// };

// export function EditMenuItemDialog({
//   isOpen,
//   onClose,
//   onSubmit,
//   item,
// }: EditMenuItemDialogProps) {
//   const [formData, setFormData] = useState({
//     name: "",
//     description: "",
//     price: "",
//     image_url: "",
//     status: "disponible" as MenuItemStatus,
//   });

//   const [errors, setErrors] = useState({
//     name: false,
//     description: false,
//     price: false,
//     image_url: false,
//   });

//   useEffect(() => {
//     if (!item) return;

//     const timeoutId = window.setTimeout(() => {
//       setFormData({
//         name: item.name,
//         description: item.description,
//         price: item.price.toString(),
//         image_url: item.image_url,
//         status: item.status,
//       });
//     }, 0);

//     return () => window.clearTimeout(timeoutId);
//   }, [item]);
//   if (!isOpen) return null;

//   const validateForm = () => {
//     const newErrors = {
//       name: !formData.name.trim(),
//       description: !formData.description.trim(),
//       price: !formData.price || parseFloat(formData.price) <= 0,
//       image_url: !formData.image_url,
//     };

//     setErrors(newErrors);
//     return !Object.values(newErrors).some(Boolean);
//   };

//   const handleSubmit = (e: React.SubmitEvent) => {
//     e.preventDefault();

//     if (!validateForm() || !item) return;

//     onSubmit({
//       id: item.id,
//       name: formData.name,
//       description: formData.description,
//       price: parseFloat(formData.price),
//       image_url: formData.image_url,
//       status: formData.status,
//     });

//     onClose();
//   };

//   const handleClose = () => {
//     setErrors({
//       name: false,
//       description: false,
//       price: false,
//       image_url: false,
//     });

//     onClose();
//   };

//   const handleStatusChange = (value: string) => {
//     if (!isMenuItemStatus(value)) return;

//     setFormData({
//       ...formData,
//       status: value,
//     });
//   };

//   return (
//     <div className={styles.overlay} onClick={handleClose}>
//       <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
//         <div className={styles.header}>
//           <h2 className={styles.title}>Editar Platillo</h2>

//           <button
//             type="button"
//             className={styles.closeBtn}
//             onClick={handleClose}
//             aria-label="Cerrar modal de edición"
//             title="Cerrar"
//           >
//             <X size={20} />
//           </button>
//         </div>

//         <form onSubmit={handleSubmit} className={styles.form}>
//           <div className={styles.inputGroup}>
//             <label className={styles.label}>Imagen del Platillo *</label>

//             <ImageUpload
//               value={formData.image_url}
//               onChange={(url) => setFormData({ ...formData, image_url: url })}
//             />

//             {errors.image_url && (
//               <span className={styles.errorText}>La imagen es requerida</span>
//             )}
//           </div>

//           <div className={styles.grid}>
//             <div className={styles.inputGroup}>
//               <label className={styles.label} htmlFor="edit-name">
//                 Título del Platillo *
//               </label>

//               <input
//                 id="edit-name"
//                 name="name"
//                 className={`${styles.input} ${
//                   errors.name ? styles.inputError : ""
//                 }`}
//                 value={formData.name}
//                 onChange={(e) =>
//                   setFormData({ ...formData, name: e.target.value })
//                 }
//                 placeholder="Ej: Paella Valenciana"
//                 required
//               />

//               {errors.name && (
//                 <span className={styles.errorText}>El título es requerido</span>
//               )}
//             </div>

//             <div className={styles.inputGroup}>
//               <label className={styles.label} htmlFor="edit-price">
//                 Precio *
//               </label>

//               <div className={styles.priceWrapper}>
//                 <span className={styles.currencySymbol}>$</span>

//                 <input
//                   id="edit-price"
//                   name="price"
//                   type="number"
//                   step="0.01"
//                   className={`${styles.input} ${styles.priceInput} ${
//                     errors.price ? styles.inputError : ""
//                   }`}
//                   value={formData.price}
//                   onChange={(e) =>
//                     setFormData({ ...formData, price: e.target.value })
//                   }
//                   placeholder="0.00"
//                   required
//                 />
//               </div>

//               {errors.price && (
//                 <span className={styles.errorText}>Precio no válido</span>
//               )}
//             </div>
//           </div>

//           <div className={styles.inputGroup}>
//             <label className={styles.label} htmlFor="edit-description">
//               Descripción *
//             </label>

//             <textarea
//               id="edit-description"
//               name="description"
//               className={`${styles.textarea} ${
//                 errors.description ? styles.inputError : ""
//               }`}
//               value={formData.description}
//               onChange={(e) =>
//                 setFormData({ ...formData, description: e.target.value })
//               }
//               placeholder="Describe el platillo..."
//               rows={3}
//             />

//             {errors.description && (
//               <span className={styles.errorText}>
//                 La descripción es requerida
//               </span>
//             )}
//           </div>

//           <div className={styles.inputGroup}>
//             <label className={styles.label} htmlFor="edit-status">
//               Estado del Platillo
//             </label>

//             <select
//               id="edit-status"
//               name="status"
//               className={styles.select}
//               value={formData.status}
//               onChange={(e) => handleStatusChange(e.target.value)}
//             >
//               <option value="disponible">Disponible</option>
//               <option value="agotado">Agotado</option>
//               <option value="inactivo">Inactivo</option>
//             </select>
//           </div>

//           <div className={styles.actions}>
//             <button
//               type="button"
//               className={styles.cancelBtn}
//               onClick={handleClose}
//             >
//               Cancelar
//             </button>

//             <button type="submit" className={styles.submitBtn}>
//               Guardar Cambios
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }
