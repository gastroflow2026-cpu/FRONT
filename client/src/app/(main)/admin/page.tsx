"use client";

import { useEffect, useState } from "react";
import { Employees } from "@/components/adminDashboard/Employees/Employees";
import { Menu } from "@/components/adminDashboard/Menu/Menu";
import { Metrics } from "@/components/adminDashboard/Metrics/Metrics";
import { Orders } from "@/components/adminDashboard/Orders/Orders";
import { Reservations } from "@/components/adminDashboard/Reservations/Reservations";
import { Settings } from "@/components/adminDashboard/Settings/Settings";
import { Sidebar } from "@/components/adminDashboard/Sidebar/Sidebar";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import styles from "./Admin.module.css";
import axios from "axios";
import { getToken } from "@/helpers/getToken";
import { CheckCircle2, Clock3, FileText, LockKeyhole, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import { UsersContext } from "@/context/UsersContext";


type RestaurantVerificationStatus = "pending" | "approved" | "rejected" | "suspended";

interface RestaurantProfile {
  id: string;
  name: string;
  is_active: boolean;
  verification_status: RestaurantVerificationStatus;
  verification_notes?: string | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const normalizeBaseUrl = (url?: string | null) => {
  if (!url) return "";
  return url.trim().replace(/\/+$/, "");
};

const buildApiUrl = (path: string) => {
  const base = normalizeBaseUrl(API_URL);
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (!base) {
    throw new Error("API_URL_NOT_CONFIGURED");
  }

  return `${base}${normalizedPath}`;
};

export default function Admin() {
  const router = useRouter();
  const { isLogged } = useContext(UsersContext);
  const [activeModule, setActiveModule] = useState("employees");
  const [restaurantProfile, setRestaurantProfile] = useState<RestaurantProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const modules: Record<string, React.ReactNode> = {
    employees: <Employees />,
    reservations: <Reservations />,
    menu: <Menu />,
    metrics: <Metrics />,
    orders: <Orders />,
    settings: <Settings />,
  };
  useEffect(() => {
    const fetchRestaurantProfile = async () => {
      const token = getToken();

      if (!token) {
        setProfileError("No hay una sesión activa.");
        setIsLoadingProfile(false);
        return;
      }

      try {
        const response = await axios.get<RestaurantProfile>(buildApiUrl("/restaurant/profile"), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setRestaurantProfile(response.data);
      } catch {
        setProfileError("No fue posible consultar el estado del restaurante.");
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchRestaurantProfile();
  }, []);

  useEffect(() => {
  const checkSubscription = async () => {
    if (!restaurantProfile || restaurantProfile.verification_status !== "approved") return;
    if (!isLogged?.restaurant_id) return;

    setIsLoadingSubscription(true);
    try {
      const token = getToken();
      await axios.get(
        buildApiUrl(`/subscriptions/restaurant/${isLogged.restaurant_id}`),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Si llega acá tiene suscripción activa → no hace nada, muestra el dashboard
    } catch (error: any) {
      if (error?.response?.status === 404) {
        // No tiene suscripción activa → redirigir a planes
        router.push("admin/subscription");
      }
    } finally {
      setIsLoadingSubscription(false);
    }
  };

    checkSubscription();
  }, [restaurantProfile, isLogged?.restaurant_id]);

  if (isLoadingProfile) {
    return (
      <div className={styles.rootContainer}>
        <Navbar />
        <main className={styles.statusMain}>
          <div className={styles.statusContainer}>
            <p className={styles.statusMessage}>Cargando estado del restaurante...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (profileError) {
    return (
      <div className={styles.rootContainer}>
        <Navbar />
        <main className={styles.statusMain}>
          <div className={styles.statusContainer}>
            <p className={styles.statusMessage}>{profileError}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  if (isLoadingSubscription) {
    return (
      <div className={styles.rootContainer}>
        <Navbar />
        <main className={styles.statusMain}>
          <div className={styles.statusContainer}>
            <p className={styles.statusMessage}>Verificando suscripción...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (restaurantProfile?.verification_status !== "approved") {
    return (
      <div className={styles.rootContainer}>
        <Navbar />

        <main className={styles.statusMain}>
          <div className={styles.statusContainer}>
            <section className={styles.statusPanel}>
              <div className={styles.statusHeader}>
                <div className={styles.statusBadge}>
                  <Clock3 className="h-4 w-4" />
                  Solicitud en revisión
                </div>

                <h1 className={styles.statusTitle}>Tu restaurante aún no está activado</h1>

                <p className={styles.statusDescription}>
                  Tu solicitud está en proceso de revisión. Estamos validando la información y documentos de tu
                  restaurante. Te avisaremos cuando tu cuenta sea activada.
                </p>
              </div>

              <div className={styles.statusGrid}>
                <div className={styles.statusContent}>
                  <div className={styles.statusCard}>
                    <div className={styles.statusCardTitle}>
                      <ShieldCheck className="h-5 w-5 text-orange-500" />
                      <h2>Estado del proceso</h2>
                    </div>

                    <div className={styles.statusSteps}>
                      <div className={styles.statusStep}>
                        <CheckCircle2 className="mb-3 h-5 w-5 text-green-600" />
                        <p className={styles.statusStepTitle}>Registro recibido</p>
                        <p className={styles.statusStepText}>Datos del restaurante guardados.</p>
                      </div>

                      <div className={`${styles.statusStep} ${styles.statusStepActive}`}>
                        <Clock3 className="mb-3 h-5 w-5 text-orange-500" />
                        <p className={styles.statusStepTitle}>Documentos en revisión</p>
                        <p className={styles.statusStepText}>Validaremos tu información.</p>
                      </div>

                      <div className={`${styles.statusStep} ${styles.statusStepDisabled}`}>
                        <LockKeyhole className="mb-3 h-5 w-5 text-gray-400" />
                        <p className={styles.statusStepTitle}>Panel administrativo</p>
                        <p className={styles.statusStepText}>Se activará al aprobarse.</p>
                      </div>
                    </div>
                  </div>

                  <div className={`${styles.statusCard} ${styles.statusCardWhite}`}>
                    <div className={styles.statusCardTitle}>
                      <h2>Documentación enviada</h2>
                    </div>

                    <div className={styles.documentList}>
                      <div className={styles.documentItem}>
                        <FileText className="h-5 w-5 text-orange-500" />
                        <span>Identificación oficial del dueño o representante</span>
                      </div>

                      <div className={styles.documentItem}>
                        <FileText className="h-5 w-5 text-orange-500" />
                        <span>Comprobante fiscal o documento comercial del restaurante</span>
                      </div>

                      <div className={styles.documentItem}>
                        <FileText className="h-5 w-5 text-orange-500" />
                        <span>Comprobante de domicilio del restaurante</span>
                      </div>
                    </div>
                  </div>
                </div>

                <aside className={styles.statusAside}>
                  <LockKeyhole className="mb-4 h-8 w-8 text-orange-400" />

                  <h2>Acceso temporalmente bloqueado</h2>

                  <p className={styles.statusAsideDescription}>
                    Por seguridad, las funciones administrativas como empleados, menú, órdenes, reservas, métricas y
                    configuración estarán disponibles cuando tu restaurante sea aprobado.
                  </p>

                  <div className={styles.restaurantNameBox}>
                    <p className={styles.restaurantNameLabel}>Restaurante</p>
                    <p className={styles.restaurantName}>{restaurantProfile?.name}</p>
                  </div>
                </aside>
              </div>
            </section>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.rootContainer}>
      <Navbar />

      <div className={styles.middleSection}>
        <Sidebar activeModule={activeModule} onModuleChange={setActiveModule} />

        <main className={styles.mainContent}>
          <div className={styles.container}>{modules[activeModule] || <Employees />}</div>
        </main>
      </div>

      <footer className={styles.footerWrapper}>
        <Footer />
      </footer>
    </div>
  );
}
