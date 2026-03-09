import { useNavigate } from "react-router-dom";
import { useDriverDelivery } from "@/hooks/useDriverDelivery";
import { DeliveryCard } from "../driver/components/DeliveryCard";
import styles from "./DashboardPage.module.css";

export function DashboardPage() {
  const navigate = useNavigate();
  const { deliveries, loading } = useDriverDelivery();

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* ── Header ── */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Entregas</h1>
            <p className={styles.subtitle}>
              Gerencie e acompanhe todas as entregas
            </p>
          </div>
          <button
            className={styles.btnNew}
            onClick={() => navigate("/dashboard/new")}
          >
            + Nova entrega
          </button>
        </div>

        {/* ── Estados ── */}
        {loading ? (
          <div className={styles.loading}>
            <span className={styles.spinner} />
            Carregando entregas...
          </div>
        ) : deliveries.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>📦</span>
            <p>Nenhuma entrega criada ainda</p>
            <button
              className={styles.btnNewEmpty}
              onClick={() => navigate("/dashboard/new")}
            >
              Criar primeira entrega
            </button>
          </div>
        ) : (
          <div className={styles.list}>
            {deliveries.map((delivery) => (
              <DeliveryCard key={delivery.deliveryId} delivery={delivery} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
