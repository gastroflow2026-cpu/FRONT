import ReservationsList from "@/components/ui/perfil/ReservationsList";
import UserInfo from "@/components/ui/perfil/UserInfo";
import styles from "./Perfil.module.css";

export default function Perfil() {
  // const user = await getUser()
  // const historial = await getReservations()

  /* if (!user) {
        return home
    } else {
        return user info
    }*/

  const user = {
    id: 1,
    name: "Pedro",
    email: "pedro@gmail.com",
    phone: "+00 111 222 3333",
  };

  const res1 = {
    id: 1,
    date: "05-05-2026",
    time: "15:00",
    guests_count: 3,
    status: "Activa",
    total: "15 USD",
  };

  const res2 = {
    id: 2,
    date: "05-06-2026",
    time: "17:00",
    guests_count: 5,
    status: "Cancelada",
    total: "20 USD",
  };

  const reserva = [res1, res2];

  return (
    <main className={styles.profile}>
      <h2>Panel de Usuario</h2>
      <div className={styles.userLayout}>
        <UserInfo user={user} />
        <ReservationsList reserva={reserva} />
      </div>
    </main>
  );
}
