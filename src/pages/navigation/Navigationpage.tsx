import { useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useNavigationTracking } from '@/hooks/useNavigationTracking'
import styles from './NavigationPage.module.css'

declare const L: any

export function NavigationPage() {
  const { publicCodeClient, orderCode } = useParams<{
    publicCodeClient: string
    orderCode: string
  }>()
  const navigate = useNavigate()

  const { order, delivererLocation, loading, guard } =
    useNavigationTracking(publicCodeClient!, orderCode!)

  const mapRef        = useRef<any>(null)
  const markerRef     = useRef<any>(null)
  const destMarkerRef = useRef<any>(null)
  const mapElRef      = useRef<HTMLDivElement>(null)

  // ── Inicializa mapa — roda UMA vez após mount do DOM ──
  useEffect(() => {
    if (!mapElRef.current || mapRef.current) return

    mapRef.current = L.map(mapElRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView([-23.55, -46.63], 14)

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(mapRef.current)

    L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current)

    // ResizeObserver garante invalidateSize quando container ganha tamanho
    const ro = new ResizeObserver(() => {
      mapRef.current?.invalidateSize()
    })
    ro.observe(mapElRef.current)

    return () => {
      ro.disconnect()
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, []) // <- sem deps: roda uma única vez no mount

  // ── Marca destino via geocodificação ──
  useEffect(() => {
    if (!mapRef.current || !order?.address) return

    const { street, number, city, state } = order.address
    const query = encodeURIComponent(`${street} ${number}, ${city}, ${state}, Brasil`)

    fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`)
      .then(r => r.json())
      .then(([result]) => {
        if (!result) return
        const lat = parseFloat(result.lat)
        const lng = parseFloat(result.lon)

        const destIcon = L.divIcon({
          className: '',
          html: `<div class="${styles.destMarker}">🏠</div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        })

        if (destMarkerRef.current) {
          destMarkerRef.current.setLatLng([lat, lng])
        } else {
          destMarkerRef.current = L.marker([lat, lng], { icon: destIcon })
            .addTo(mapRef.current)
        }
      })
      .catch(() => {})
  }, [order?.address])

  // ── Atualiza marker do entregador ──
  useEffect(() => {
    if (!mapRef.current || !delivererLocation) return

    const { lat, lng } = delivererLocation

    const motoIcon = L.divIcon({
      className: '',
      html: `<div class="${styles.motoMarker}">🛵</div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    })

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng])
    } else {
      markerRef.current = L.marker([lat, lng], { icon: motoIcon })
        .addTo(mapRef.current)
    }

    mapRef.current.panTo([lat, lng], { animate: true, duration: 0.8 })
  }, [delivererLocation])

  // ── Guard ──
  useEffect(() => {
    if (guard === 'NOT_ARRIVING') {
      navigate(`/track/${publicCodeClient}/${orderCode}`, { replace: true })
    }
  }, [guard, navigate, publicCodeClient, orderCode])

  // ── Tela de entrega concluída ──
  if (guard === 'DELIVERED') {
    return (
      <div className={styles.page}>
        <div className={styles.deliveredScreen}>
          <div className={styles.deliveredIconWrap}>
            <span className={styles.deliveredIcon}>✓</span>
          </div>
          <h1 className={styles.deliveredTitle}>Entrega concluída!</h1>
          <p className={styles.deliveredSub}>
            Seu pedido foi entregue com sucesso.
            <br />Bom apetite! 🍽️
          </p>
          <button
            className={styles.btnBack}
            onClick={() => navigate(`/track/${publicCodeClient}/${orderCode}`, { replace: true })}
          >
            Ver detalhes do pedido
          </button>
        </div>
      </div>
    )
  }

  const addr = order?.address
  const addressLabel = addr
    ? `${addr.street}, ${addr.number}${addr.complement ? ` — ${addr.complement}` : ''}`
    : 'Seu endereço'

  // ── O mapa SEMPRE está no DOM — loading sobrepõe via CSS ──
  return (
    <div className={styles.page}>

      {/* Mapa sempre montado */}
      <div ref={mapElRef} className={styles.map} />

      {/* Loading overlay — some quando loading=false */}
      {loading && (
        <div className={styles.loadingOverlay}>
          <span className={styles.loadingSpinner} />
          <span className={styles.loadingText}>Conectando...</span>
        </div>
      )}

      {/* Conteúdo — só aparece após loading */}
      {!loading && (
        <>
          <header className={styles.header}>
            <button
              className={styles.btnBack2}
              onClick={() => navigate(`/track/${publicCodeClient}/${orderCode}`)}
              aria-label="Voltar"
            >
              ←
            </button>
            <div className={styles.headerInfo}>
              <span className={styles.headerTitle}>Rastreando entregador</span>
              <span className={styles.headerSub}>#{orderCode}</span>
            </div>
            <div className={styles.wsIndicator}>
              <span className={styles.wsDot} />
              <span className={styles.wsLabel}>ao vivo</span>
            </div>
          </header>

          <div className={styles.bottomCard}>
            <div className={styles.bottomCardRow}>
              <span className={styles.bottomIcon}>🏠</span>
              <div className={styles.bottomInfo}>
                <span className={styles.bottomLabel}>Seu endereço</span>
                <span className={styles.bottomAddress}>{addressLabel}</span>
                {addr?.neighborhood && (
                  <span className={styles.bottomAddressSub}>
                    {addr.neighborhood}{addr.city ? `, ${addr.city}` : ''}
                  </span>
                )}
              </div>
            </div>
            <div className={styles.arrivingBadge}>
              <span className={styles.arrivingDot} />
              Entregador a caminho
            </div>
          </div>
        </>
      )}
    </div>
  )
}