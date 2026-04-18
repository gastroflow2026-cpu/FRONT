import styles from "./Password.module.css";

export const Password = () => {
  return (
    <div className={styles.passBox}>
      <form action="" className={styles.passForm}>
        <h3>Actualizar Contraseña</h3>
        <div className={styles.inputBox}>
          <label htmlFor="newPass">Nueva Contraseña</label>
          <input type="password" id="newPass" />
        </div>
        <div className={styles.inputBox}>
          <label htmlFor="confirmPass">Confirmar Contraseña</label>
          <input type="password" id="confirmPass" />
        </div>
        <button type="submit">Actualizar</button>
      </form>
    </div>
  );
};
