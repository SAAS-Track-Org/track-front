import { useNavigate } from 'react-router-dom'
import { useCreateDelivery } from '@/hooks/useCreatedelivery'
import { deliveryService } from '@/services/api/delivery.service'
import { StepSuccess } from './steps/StepSuccess'
import styles from './CreateDeliveryPage.module.css'

export function CreateDeliveryPage() {
  const navigate = useNavigate()
  const { response, loading, error, retry } = useCreateDelivery()

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.loading}>
            <span className={styles.spinner} />
            Gerando links...
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <button className={styles.btnBack} onClick={() => navigate('/dashboard')}>
            ← Voltar
          </button>
          <div className={styles.errorBanner}>
            <span>⚠</span> {error}
          </div>
          <button className={styles.btnCreate} onClick={retry}>
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  if (response) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.header}>
            <button className={styles.btnBack} onClick={() => navigate('/dashboard')}>
              ← Voltar
            </button>
            <div>
              <h1 className={styles.title}>Nova entrega</h1>
              <p className={styles.subtitle}>Entrega criada com sucesso</p>
            </div>
          </div>
          <div className={styles.content}>
            <StepSuccess
              response={response}
              onManage={() => navigate(`/dashboard/delivery/${response.deliveryId}`)}
              onNew={() => navigate('/dashboard')}
              onAddOrder={() => deliveryService.addOrder(response.deliveryId)}
            />
          </div>
        </div>
      </div>
    )
  }

  return null
}