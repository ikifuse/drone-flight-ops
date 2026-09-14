/**
 * Phase C0: PWA App Shell Root Component
 * Renders the minimal mobile-first shell, monitors network & SW status,
 * and verifies offline readiness without implementing unapproved business logic.
 */

import { subscribeSwStatus, SwStatus } from './service-worker-reg';

export class AppShell {
  private container: HTMLElement;
  private isOnline: boolean = navigator.onLine;
  private isStandalone: boolean = false;
  private swStatus: SwStatus = {
    registered: false,
    controlling: false,
    offlineReady: false,
  };

  constructor(container: HTMLElement) {
    this.container = container;
    this.checkDisplayMode();
    this.bindEvents();
    this.render();
  }

  private checkDisplayMode(): void {
    const isStandaloneMedia = window.matchMedia('(display-mode: standalone)').matches;
    // iOS Safari specific standalone flag
    const isIosStandalone = ('standalone' in navigator) && Boolean((navigator as unknown as { standalone?: boolean }).standalone);
    this.isStandalone = isStandaloneMedia || isIosStandalone;
  }

  private bindEvents(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.updateStatusBadges();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.updateStatusBadges();
    });

    window.matchMedia('(display-mode: standalone)').addEventListener('change', (e) => {
      this.isStandalone = e.matches;
      this.updateStatusBadges();
    });

    subscribeSwStatus((status) => {
      this.swStatus = status;
      this.updateStatusBadges();
    });
  }

  public render(): void {
    this.container.innerHTML = `
      <div class="shell-container">
        <!-- Error Boundary Display (hidden by default) -->
        <div id="error-boundary" class="error-boundary-card" role="alert">
          <div class="error-title">起動時警告 / エラー</div>
          <div id="error-message" class="error-message"></div>
        </div>

        <!-- App Header -->
        <header class="shell-header">
          <div class="brand-section">
            <div class="app-logo" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"/>
              </svg>
            </div>
            <div class="app-title-group">
              <h1>drone-flight-ops</h1>
              <div class="subtext">総合ドローン運航管理システム</div>
            </div>
          </div>
          <div class="header-status-group">
            <div id="network-badge" class="status-badge ${this.isOnline ? 'online' : 'offline'}">
              <span class="indicator-dot"></span>
              <span id="network-badge-text">${this.isOnline ? 'オンライン' : 'オフライン'}</span>
            </div>
          </div>
        </header>

        <!-- Main Body -->
        <main class="shell-main">
          <!-- Phase Status Card -->
          <section class="card">
            <div class="card-header">
              <h2 class="card-title">
                <span>基盤稼働状態（Phase C0）</span>
              </h2>
              <span class="status-badge pwa-mode">${this.isStandalone ? 'PWA Standalone' : 'Browser Mode'}</span>
            </div>
            <div class="card-body">
              <div class="status-list">
                <div class="status-row">
                  <span class="status-label">開発フェーズ</span>
                  <span class="status-value">Phase C0: PWA App Shell 基盤</span>
                </div>
                <div class="status-row">
                  <span class="status-label">通信状態</span>
                  <span id="stat-network" class="status-value">${this.isOnline ? '接続中 (Online)' : '圏外 / 切断 (Offline)'}</span>
                </div>
                <div class="status-row">
                  <span class="status-label">表示モード</span>
                  <span id="stat-display" class="status-value">${this.isStandalone ? 'スタンドアロン（ホーム画面起動）' : 'ブラウザ表示（ホーム画面追加可能）'}</span>
                </div>
                <div class="status-row">
                  <span class="status-label">Service Worker</span>
                  <span id="stat-sw" class="status-value">${this.getSwDescription()}</span>
                </div>
                <div class="status-row">
                  <span class="status-label">オフライン起動</span>
                  <span id="stat-offline-ready" class="status-value">${this.swStatus.offlineReady ? '準備完了（キャッシュ済）' : 'キャッシュ確認中...'}</span>
                </div>
              </div>
            </div>
          </section>

          <!-- Safe-area & Architecture Notice Card -->
          <section class="card notice-card">
            <div class="notice-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
              </svg>
              <span>Phase C0 受入検証について</span>
            </div>
            <p>
              本画面は <strong>Phase C0（PWA最小基盤 / App Shell）</strong> です。
              現場（iPhone Safari / Android Chrome）でのホーム画面追加、全画面起動、および通信遮断時のオフライン再起動を検証するための基盤です。
            </p>
            <p>
              ※飛行計画（FlightPlan）、飛行日誌、バッテリー管理、DIPS通報等の業務機能は、オーナー承認後の <strong>Phase C1 以降</strong> で段階的に実装されます。
            </p>
          </section>
        </main>

        <!-- Footer -->
        <footer class="shell-footer">
          <div class="footer-version">drone-flight-ops v0.1.0-c0 (Build Phase C0)</div>
          <div class="footer-copyright">ikifuse / drone-flight-ops</div>
        </footer>
      </div>
    `;
  }

  private updateStatusBadges(): void {
    const networkBadge = document.getElementById('network-badge');
    const networkBadgeText = document.getElementById('network-badge-text');
    const statNetwork = document.getElementById('stat-network');
    const statDisplay = document.getElementById('stat-display');
    const statSw = document.getElementById('stat-sw');
    const statOfflineReady = document.getElementById('stat-offline-ready');

    if (networkBadge && networkBadgeText) {
      networkBadge.className = `status-badge ${this.isOnline ? 'online' : 'offline'}`;
      networkBadgeText.textContent = this.isOnline ? 'オンライン' : 'オフライン';
    }

    if (statNetwork) {
      statNetwork.textContent = this.isOnline ? '接続中 (Online)' : '圏外 / 切断 (Offline)';
    }

    if (statDisplay) {
      statDisplay.textContent = this.isStandalone
        ? 'スタンドアロン（ホーム画面起動）'
        : 'ブラウザ表示（ホーム画面追加可能）';
    }

    if (statSw) {
      statSw.textContent = this.getSwDescription();
    }

    if (statOfflineReady) {
      statOfflineReady.textContent = this.swStatus.offlineReady
        ? '準備完了（キャッシュ済）'
        : 'キャッシュ確認中...';
    }
  }

  private getSwDescription(): string {
    if (this.swStatus.error) {
      return `エラー: ${this.swStatus.error}`;
    }
    if (this.swStatus.offlineReady || this.swStatus.controlling) {
      return '登録済・有効（App Shell事前キャッシュ済）';
    }
    if (this.swStatus.registered) {
      return '登録済（初回キャッシュ生成中...）';
    }
    return '登録中...';
  }

  public showError(message: string): void {
    const errorCard = document.getElementById('error-boundary');
    const errorMessage = document.getElementById('error-message');
    if (errorCard && errorMessage) {
      errorMessage.textContent = message;
      errorCard.classList.add('active');
    }
  }
}
