import Link from "next/link";
import styles from "./css/Not-found.module.css";
import { GiKnifeFork } from "react-icons/gi";

export default function NotFound() {
  return (
    <div className={styles.notFound}>
      <GiKnifeFork className={styles.notFoundIcon} />
      <h1>LA COCINA NO PUDO PREPARAR ESTA PÁGINA.</h1>
      <p>Pero tenemos otras opciones deliciosas para ti.</p>
      <Link href="/">
        <button>INICIO</button>
      </Link>
    </div>
  );
}
