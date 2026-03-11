/// <reference types="vite/client" />

import { Client } from '@stomp/stompjs'
import type { LocationUpdate } from '@/types/types'

type LocationCallback = (location: LocationUpdate) => void

const WS_BASE = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/api/v1/ws'

class WebSocketService {
  private client: Client | null = null
  private pendingCallbacks: (() => void)[] = []

  connect(onConnected?: () => void): void {
    // Já conectado — dispara callback imediatamente
    if (this.client?.connected) {
      onConnected?.()
      return
    }

    // Já está conectando — enfileira callback
    if (this.client?.active) {
      if (onConnected) this.pendingCallbacks.push(onConnected)
      return
    }

    if (onConnected) this.pendingCallbacks.push(onConnected)

    this.client = new Client({
      webSocketFactory: () => new WebSocket(`${WS_BASE}/websocket`),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('WebSocket conectado')
        // Drena todos os callbacks pendentes
        this.pendingCallbacks.forEach(cb => cb())
        this.pendingCallbacks = []
      },
      onDisconnect: () => {
        console.log('WebSocket desconectado')
      },
      onStompError: (frame) => {
        console.error('Erro STOMP:', frame)
      },
    })

    this.client.activate()
  }

  subscribeToLocation(publicCodeClient: string, callback: LocationCallback): () => void {
    if (!this.client?.connected) {
      console.warn('WebSocket não conectado ao tentar subscrever')
      return () => {}
    }

    const destination = `/topic/track/${publicCodeClient}`
    console.log('Subscrevendo em:', destination)

    const subscription = this.client.subscribe(destination, (message) => {
      try {
        const location: LocationUpdate = JSON.parse(message.body)
        console.log('Localização recebida:', location)
        callback(location)
      } catch (err) {
        console.error('Erro ao parsear mensagem WS:', err)
      }
    })

    return () => subscription.unsubscribe()
  }

  disconnect(): void {
    this.pendingCallbacks = []
    this.client?.deactivate()
    this.client = null
  }

  get isConnected(): boolean {
    return this.client?.connected ?? false
  }
}

export const wsService = new WebSocketService()