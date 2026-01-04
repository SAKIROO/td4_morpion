<script>
import api from '@/api'
import ErrorsDisplay from '@/components/ErrorsDisplay.vue'

export default {
  name: 'GameView',
  components: {
    ErrorsDisplay,
  },
  data() {
    return {
      game: null,
      user: null,
      errors: [],
      boardStateRaw: [
        ['', '', ''],
        ['', '', ''],
        ['', '', ''],
      ],
      endMessage: '',
      endAlerted: false,
      rematchLoading: false,
      rematchError: '',
      showEndModal: false,
      endModalTitle: '',
      endModalText: '',
      ws: null,
      isPlaying: false,
      pollIntervalId: null,
    }
  },
  computed: {
    rawBoard() {
      return this.boardStateRaw
    },
    board() {
      return this.rawBoard.map((row) => row.map((cell) => this.formatCell(cell)))
    },
    currentPlayerName() {
      const nextId = this.game?.next_player_id
      if (!nextId) return ''
      if (this.game?.player?.id === nextId) return this.game.player.name || 'Joueur 1'
      if (this.game?.opponent?.id === nextId) return this.game.opponent.name || 'Joueur 2'
      return ''
    },
    isFinished() {
      return this.game?.status === 2
    },
    winnerName() {
      const winnerId = this.game?.winner_id
      if (!winnerId) return ''
      if (this.game?.player?.id === winnerId) return this.game.player.name || 'Joueur 1'
      if (this.game?.opponent?.id === winnerId) return this.game.opponent.name || 'Joueur 2'
      return ''
    },
    userId() {
      return this.user?.id || null
    },
    isPlayerTurn() {
      if (!this.game || !this.game.opponent || this.isFinished || !this.userId) return false
      return this.game.next_player_id === this.userId
    },
  },
  methods: {
    emptyGrid() {
      return [
        ['', '', ''],
        ['', '', ''],
        ['', '', ''],
      ]
    },
    deriveGrid(gameData) {
      const grid =
        gameData?.board ||
        gameData?.grid ||
        gameData?.cells ||
        gameData?.board_state ||
        gameData?.boardState ||
        gameData?.state?.board ||
        gameData?.state?.grid ||
        gameData?.state?.cells ||
        null

      // API renvoie r1c1...r3c3
      const hasRcx =
        gameData?.r1c1 !== undefined ||
        gameData?.r1c2 !== undefined ||
        gameData?.r1c3 !== undefined ||
        gameData?.r2c1 !== undefined ||
        gameData?.r2c2 !== undefined ||
        gameData?.r2c3 !== undefined ||
        gameData?.r3c1 !== undefined ||
        gameData?.r3c2 !== undefined ||
        gameData?.r3c3 !== undefined
      if (hasRcx) {
        return [
          [gameData?.r1c1 ?? '', gameData?.r1c2 ?? '', gameData?.r1c3 ?? ''],
          [gameData?.r2c1 ?? '', gameData?.r2c2 ?? '', gameData?.r2c3 ?? ''],
          [gameData?.r3c1 ?? '', gameData?.r3c2 ?? '', gameData?.r3c3 ?? ''],
        ]
      }

      if (Array.isArray(grid) && Array.isArray(grid[0])) {
        return grid
      }
      if (Array.isArray(grid) && grid.length >= 9) {
        return [
          grid.slice(0, 3),
          grid.slice(3, 6),
          grid.slice(6, 9),
        ]
      }
      if (typeof grid === 'string' && grid.length) {
        const chars = grid.split('').slice(0, 9)
        while (chars.length < 9) chars.push('')
        return [
          chars.slice(0, 3),
          chars.slice(3, 6),
          chars.slice(6, 9),
        ]
      }

      if (Array.isArray(gameData?.moves) && gameData.moves.length) {
        const base = [
          ['', '', ''],
          ['', '', ''],
          ['', '', ''],
        ]
        gameData.moves.forEach((move) => {
          const r =
            (move.row ?? move.r ?? move.line ?? move.i ?? move.x ?? 0) - 1
          const c =
            (move.col ?? move.column ?? move.j ?? move.y ?? 0) - 1
          if (r >= 0 && r < 3 && c >= 0 && c < 3) {
            base[r][c] =
              move.player_id ||
              move.player ||
              move.user_id ||
              move.played_by ||
              move.symbol ||
              move.sign ||
              move.value ||
              move.val ||
              'X'
          }
        })
        return base
      }

      return null
    },
    hasGridContent(grid) {
      if (!grid) return false
      return grid.some((row) => row.some((cell) => !this.isCellEmpty(cell)))
    },
    setBoardFromGame(gameData) {
      const derived = this.deriveGrid(gameData)
      this.boardStateRaw = derived || this.emptyGrid()
      this.updateEndState(gameData)
    },
    updateEndState(gameData) {
      const status = gameData?.status
      const winnerId = gameData?.winner_id
      const board = this.board
      let computedWinner = null
      let boardFull = false

      // Détection locale au cas où l'API ne remplit pas winner_id immédiatement
      if (Array.isArray(board) && board.length === 3) {
        const lines = [
          [board[0][0], board[0][1], board[0][2]],
          [board[1][0], board[1][1], board[1][2]],
          [board[2][0], board[2][1], board[2][2]],
          [board[0][0], board[1][0], board[2][0]],
          [board[0][1], board[1][1], board[2][1]],
          [board[0][2], board[1][2], board[2][2]],
          [board[0][0], board[1][1], board[2][2]],
          [board[0][2], board[1][1], board[2][0]],
        ]
        const lineIndexes = [
          [
            [0, 0],
            [0, 1],
            [0, 2],
          ],
          [
            [1, 0],
            [1, 1],
            [1, 2],
          ],
          [
            [2, 0],
            [2, 1],
            [2, 2],
          ],
          [
            [0, 0],
            [1, 0],
            [2, 0],
          ],
          [
            [0, 1],
            [1, 1],
            [2, 1],
          ],
          [
            [0, 2],
            [1, 2],
            [2, 2],
          ],
          [
            [0, 0],
            [1, 1],
            [2, 2],
          ],
          [
            [0, 2],
            [1, 1],
            [2, 0],
          ],
        ]
        this.winningCells = []
        lines.forEach((line, idx) => {
          if (line[0] && line[0] === line[1] && line[1] === line[2]) {
            computedWinner = line[0]
            this.winningCells = lineIndexes[idx]
          }
        })
        boardFull = board.every((row) => row.every((cell) => !!cell))
      }

      const hasWinner = winnerId || computedWinner
      const isOver = status === 2 || hasWinner || boardFull
      if (!isOver) {
        this.endMessage = ''
        this.endAlerted = false
        this.showEndModal = false
        return
      }

      // Message + alerte
      if (winnerId) {
        if (winnerId === this.userId) {
          this.endMessage = 'Vous avez gagné !'
          this.openEndModal('Partie terminée', 'Vous avez gagné !')
        } else if (winnerId === this.game?.opponent?.id) {
          const name = this.game?.opponent?.name || 'Votre adversaire'
          this.endMessage = `${name} a gagné.`
          this.openEndModal('Partie terminée', `${name} a gagné.`)
        } else {
          this.endMessage = 'Partie terminée.'
          this.openEndModal('Partie terminée', 'La partie est terminée.')
        }
      } else if (computedWinner) {
        if (computedWinner === 'X' && this.userId === this.game?.player?.id) {
          this.endMessage = 'Vous avez gagné !'
          this.openEndModal('Partie terminée', 'Vous avez gagné !')
        } else if (computedWinner === 'O' && this.userId === this.game?.opponent?.id) {
          this.endMessage = 'Votre adversaire a gagné.'
          this.openEndModal('Partie terminée', 'Votre adversaire a gagné.')
        } else {
          this.endMessage = 'Partie terminée.'
          this.openEndModal('Partie terminée', 'La partie est terminée.')
        }
      } else {
        this.endMessage = 'Match nul.'
        this.openEndModal('Partie terminée', 'Match nul.')
      }

      this.endAlerted = true
    },
    openEndModal(title, text) {
      if (this.endAlerted) return
      this.endModalTitle = title
      this.endModalText = text
      this.showEndModal = true
    },
    closeEndModal() {
      this.showEndModal = false
    },
    async fetchGame(id, showError = true) {
      try {
        const { data } = await api.get(`/api/games/${id}`)
        const payload = data?.game || data
        this.game = payload
        this.setBoardFromGame(payload)
      } catch (err) {
        if (showError) {
          const apiErrors = err?.response?.data?.errors
          this.errors = Array.isArray(apiErrors)
            ? apiErrors
            : ['Impossible de rafraichir la partie.']
        }
        throw err
      }
    },
    waitForUpdates() {
      if (!this.game?.id || !this.userId || this.ws) {
        this.startPollingGame()
        return
      }
      const ws = new WebSocket('wss://morpion-api.edu.netlor.fr/websockets')
      this.ws = ws
      this.startPollingGame()

      ws.addEventListener('open', () => {
        ws.send(
          JSON.stringify({
            action: 'connect',
            game_id: this.game.id,
            player_id: this.userId,
          }),
        )
      })

      ws.addEventListener('message', async (event) => {
        let payload
        try {
          payload = JSON.parse(event.data)
        } catch {
          return
        }

        const action = payload?.action || payload?.type
        if (payload?.game) {
          this.game = payload.game
          this.setBoardFromGame(payload.game)
          return
        }
        if (
          action === 'opponent-join' ||
          action === 'opponent-play' ||
          action === 'opponent-quit'
        ) {
          try {
            await this.fetchGame(this.game.id)
          } catch {
            this.errors = ['Impossible de rafraichir la partie.']
          }
        }
      })

      ws.addEventListener('error', () => {
        this.errors = ['La connexion en temps réel a rencontré une erreur.']
        this.startPollingGame()
      })

      ws.addEventListener('close', () => {
        this.ws = null
        this.startPollingGame()
      })
    },
    closeSocket() {
      if (this.ws) {
        this.ws.close()
        this.ws = null
      }
    },
    startPollingGame() {
      this.stopPollingGame()
      if (!this.game?.id) return
      this.pollIntervalId = window.setInterval(async () => {
        try {
          await this.fetchGame(this.game.id, false)
          if (this.isFinished) {
            this.stopPollingGame()
          }
        } catch {
          // Silently ignore to keep retrying
        }
      }, 2000)
    },
    stopPollingGame() {
      if (this.pollIntervalId) {
        clearInterval(this.pollIntervalId)
        this.pollIntervalId = null
      }
    },
    async play(rowIndex, colIndex) {
      if (!this.game || this.isFinished || !this.game.opponent || !this.isPlayerTurn) return
      if (!this.isCellEmpty(this.rawBoard[rowIndex][colIndex])) return
      this.errors = []
      this.isPlaying = true
      try {
        const row = rowIndex + 1
        const col = colIndex + 1
        const { data } = await api.patch(
          `/api/games/${this.game.id}/play/${row}/${col}`,
        )
        const payload = data?.game || data
        this.game = payload
        this.setBoardFromGame(payload)
        if (!this.hasGridContent(this.boardStateRaw)) {
          // fallback: mark locally to display
          const symbol = this.game?.player?.id === this.userId ? 'X' : 'O'
          this.boardStateRaw[rowIndex][colIndex] = symbol
        }
        if (this.isFinished) {
          this.updateEndState(this.game)
        }
      } catch (err) {
        const apiErrors = err?.response?.data?.errors
        this.errors = Array.isArray(apiErrors)
          ? apiErrors
          : ['Impossible de jouer cette case.']
      } finally {
        this.isPlaying = false
      }
    },
    extractCellValue(cell) {
      if (cell === null || cell === undefined) return null

      if (typeof cell === 'object') {
        const candidates = [
          cell.value,
          cell.val,
          cell.symbol,
          cell.sign,
          cell.player_id,
          cell.owner_id,
          cell.user_id,
          cell.played_by,
          cell.player,
          cell.id,
          cell.content,
          cell.cell,
        ]
        const found = candidates.find((v) => v !== undefined && v !== null)
        if (found !== undefined) return found
        return null
      }

      return cell
    },
    isCellEmpty(value) {
      const v = this.extractCellValue(value)
      if (v === null || v === undefined) return true
      if (typeof v === 'number' && v === 0) return true
      if (typeof v === 'string') {
        const trimmed = v.trim()
        if (trimmed === '' || trimmed === '0' || trimmed === '.') return true
      }
      return false
    },
    formatCell(cell) {
      const normalized = this.extractCellValue(cell)
      if (this.isCellEmpty(normalized)) return ''

      const playerId = this.game?.player?.id
      const opponentId = this.game?.opponent?.id

      if (normalized === playerId) return 'X'
      if (normalized === opponentId) return 'O'

      if (normalized === 1 || normalized === '1') return 'X'
      if (normalized === 2 || normalized === '2') return 'O'

      if (typeof normalized === 'string') {
        const upper = normalized.toUpperCase()
        if (upper === 'X' || upper === 'O') return upper
        if (upper === '1') return 'X'
        if (upper === '2') return 'O'
        return upper.charAt(0) || '?'
      }

      return String(normalized)
    },
    symbolClass(cell) {
      if (cell === 'X') return 'symbol-x'
      if (cell === 'O') return 'symbol-o'
      return ''
    },
    isWinningCell(row, col) {
      return this.winningCells.some(([r, c]) => r === row && c === col)
    },
    async copyCode(code) {
      if (!code) return
      try {
        await navigator.clipboard.writeText(code)
      } catch {
        // ignore
      }
    },
    async startRematch() {
      if (this.rematchLoading) return
      this.rematchError = ''
      this.rematchLoading = true
      try {
        const { data } = await api.post('/api/games', {})
        const newGame = data?.game || data
        alert(
          `Nouvelle partie créée. Code à communiquer : ${newGame.code || 'inconnu'}`,
        )
        this.$router.push({ name: 'game', params: { id: newGame.id } })
      } catch (err) {
        const apiErrors = err?.response?.data?.errors
        this.rematchError = Array.isArray(apiErrors)
          ? apiErrors.join(', ')
          : 'Impossible de créer la revanche.'
      } finally {
        this.rematchLoading = false
      }
    },
  },
  beforeRouteEnter(to, from, next) {
    Promise.all([api.get('/api/profile'), api.get(`/api/games/${to.params.id}`)])
      .then(([profileRes, gameRes]) => {
        next((vm) => {
          vm.user = profileRes.data
          vm.game = gameRes.data?.game || gameRes.data
          vm.boardStateRaw = [
            ['', '', ''],
            ['', '', ''],
            ['', '', ''],
          ]
          vm.setBoardFromGame(vm.game)
          vm.startPollingGame()
          vm.waitForUpdates()
        })
      })
      .catch((err) => {
        const apiErrors = err?.response?.data?.errors
        next((vm) => {
          vm.errors = Array.isArray(apiErrors)
            ? apiErrors
            : ['Impossible de charger la partie.']
        })
      })
  },
  beforeRouteLeave(to, from, next) {
    this.closeSocket()
    this.stopPollingGame()
    next()
  },
  beforeUnmount() {
    this.closeSocket()
    this.stopPollingGame()
  },
}
</script>

<template>
  <main class="page">
    <section v-if="game" class="panel topbar-card">
      <div class="topbar">
        <div>
          <p class="eyebrow">Partie</p>
          <div class="code-line">
            <span class="title-lg">Code</span>
            <button type="button" class="badge" @click="copyCode(game.code)">
              {{ game.code }}
            </button>
            <button type="button" class="btn ghost" @click="copyCode(game.code)">Copier</button>
          </div>
          <p class="subtitle">
            {{ game.player?.name || 'Joueur 1' }}
            <span class="muted">vs</span>
            {{ game.opponent?.name || 'En attente' }}
          </p>
        </div>
        <RouterLink class="btn danger ghost" to="/home">Quitter</RouterLink>
      </div>
    </section>

    <section class="status-grid">
      <div class="panel board-card">
        <div v-if="game && !game.opponent" class="waiting-card">
          <div class="loader" />
          <div>
            <p class="title-lg">En attente d'un adversaire...</p>
            <p class="subtitle">Partage le code ci-dessus à ton adversaire.</p>
            <div class="code-share">
              <button type="button" class="badge" @click="copyCode(game.code)">
                {{ game.code }}
              </button>
              <button type="button" class="btn ghost" @click="copyCode(game.code)">Copier</button>
            </div>
          </div>
        </div>

        <div v-else-if="game" class="grid-board">
          <button
            v-for="(cell, idx) in board.flat()"
            :key="idx"
            type="button"
            :class="[
              'cell',
              symbolClass(cell),
              { waiting: !isPlayerTurn || isPlaying, winning: isWinningCell(Math.floor(idx / 3), idx % 3) },
            ]"
            :disabled="
              !isCellEmpty(rawBoard[Math.floor(idx / 3)][idx % 3]) ||
              !isPlayerTurn ||
              isFinished ||
              isPlaying
            "
            @click="play(Math.floor(idx / 3), idx % 3)"
          >
            <span class="symbol">{{ cell }}</span>
          </button>
        </div>
      </div>

      <div class="panel status-card">
        <p class="eyebrow">Statut</p>
        <h2 class="title-lg">Au tour de {{ currentPlayerName || '...' }}</h2>
        <p class="subtitle" v-if="isPlayerTurn">C'est votre tour de jouer.</p>
        <p class="subtitle" v-else>En attente de votre tour...</p>

        <div class="status-row">
          <span class="pill live">Tour actuel</span>
          <span class="value">{{ currentPlayerName || '...' }}</span>
        </div>
        <div class="status-row">
          <span class="pill">Votre symbole</span>
          <span class="value symbol accent">{{ game?.player?.id === userId ? 'X' : 'O' }}</span>
        </div>
        <div class="status-row">
          <span class="pill">Adversaire</span>
          <span class="value">{{ game?.opponent?.name || 'En attente' }}</span>
        </div>
      </div>
    </section>

    <div v-if="game && isFinished" class="panel end">
      <p v-if="endMessage" class="title-lg">{{ endMessage }}</p>
      <p v-else-if="winnerName">Partie terminée, {{ winnerName }} a gagné.</p>
      <p v-else>Partie terminée, match nul.</p>
      <RouterLink class="btn secondary" to="/home">Retour à l'accueil</RouterLink>
    </div>

    <ErrorsDisplay :errors="errors" />

    <div v-if="showEndModal" class="modal-backdrop">
      <div class="modal">
        <p class="modal-title">{{ endModalTitle }}</p>
        <p class="modal-text">{{ endModalText }}</p>
        <div class="modal-actions">
          <RouterLink class="btn secondary" to="/home">Quitter</RouterLink>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.topbar-card {
  margin-bottom: 18px;
}

.code-line {
  display: flex;
  align-items: center;
  gap: 10px;
}

.muted {
  color: var(--muted);
}

.status-grid {
  display: grid;
  gap: 18px;
}

@media (min-width: 960px) {
  .status-grid {
    grid-template-columns: minmax(0, 1fr) 320px;
    align-items: start;
  }
}

.board-card {
  min-height: 360px;
}

.grid-board {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.cell {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--border);
  border-radius: 16px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.cell .symbol {
  color: var(--text);
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.12);
}

.cell.symbol-x .symbol {
  color: var(--primary2);
  text-shadow: 0 0 16px rgba(34, 211, 238, 0.35);
}

.cell.symbol-o .symbol {
  color: var(--primary);
  text-shadow: 0 0 16px rgba(124, 92, 255, 0.35);
}

.cell.winning {
  border-color: var(--primary2);
  box-shadow: 0 0 0 3px rgba(34, 211, 238, 0.2);
}

.waiting-card {
  display: flex;
  align-items: center;
  gap: 14px;
}

.code-share {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.status-card {
  display: grid;
  gap: 10px;
}

.status-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  color: var(--text);
  font-weight: 600;
  font-size: 14px;
}

.pill.live::before {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--primary2);
  box-shadow: 0 0 0 6px rgba(34, 211, 238, 0.2);
}

.value.symbol.accent {
  color: var(--primary2);
  font-weight: 700;
}

.end {
  margin-top: 18px;
  display: grid;
  gap: 12px;
  text-align: center;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: grid;
  place-items: center;
  z-index: 1000;
  padding: 16px;
}

.modal {
  background: #0f172a;
  color: #e2e8f0;
  border-radius: 16px;
  padding: 20px 22px;
  width: min(440px, 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: var(--shadow);
  display: grid;
  gap: 10px;
}

.modal .modal-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
}

.modal .modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
