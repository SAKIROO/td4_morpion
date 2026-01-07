<script>
import api from '@/api'
import ErrorsDisplay from '@/components/ErrorsDisplay.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import CodePill from '@/components/ui/CodePill.vue'
import { useToast } from '@/composables/useToast'
import { Copy, DoorOpen, Loader2 } from 'lucide-vue-next'

export default {
  name: 'GameView',
  components: {
    ErrorsDisplay,
    BaseCard,
    BaseButton,
    BaseBadge,
    CodePill,
    Copy,
    DoorOpen,
    Loader2,
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
      toast: useToast(),
    }
  },
  computed: {
    rawBoard() {
      return this.boardStateRaw
    },
    board() {
      return this.rawBoard.map((row) => row.map((cell) => this.formatCell(cell)))
    },
    playerId() {
      return this.getRoleId('player')
    },
    opponentId() {
      return this.getRoleId('opponent')
    },
    nextPlayerId() {
      const direct =
        this.game?.next_player_id ??
        this.game?.nextPlayerId ??
        this.game?.next_player?.id ??
        this.game?.current_player_id ??
        this.game?.currentPlayerId ??
        this.game?.current_player?.id ??
        this.game?.turn_player_id ??
        this.game?.turnPlayerId ??
        this.game?.turn?.player_id ??
        null
      if (direct) return direct
      const nextPlayer = this.game?.next_player
      if (typeof nextPlayer === 'number') return nextPlayer
      if (typeof nextPlayer === 'string') {
        const trimmed = nextPlayer.trim()
        if (trimmed && !Number.isNaN(Number(trimmed))) return Number(trimmed)
      }
      return null
    },
    selfName() {
      return this.resolveName(this.user)
    },
    localRole() {
      if (!this.userId) return ''
      if (this.idsMatch(this.playerId, this.userId)) return 'player'
      if (this.idsMatch(this.opponentId, this.userId)) return 'opponent'
      if (!this.playerId && this.opponentId && !this.idsMatch(this.opponentId, this.userId)) {
        return 'player'
      }
      if (!this.opponentId && this.playerId && !this.idsMatch(this.playerId, this.userId)) {
        return 'opponent'
      }
      return ''
    },
    playerName() {
      if (!this.game?.opponent && this.selfName) {
        return this.selfName
      }
      return this.resolveRoleName('player', 'Joueur 1')
    },
    opponentName() {
      if (!this.game?.opponent && !this.game?.opponent_id && !this.game?.opponentId) {
        return 'En attente'
      }
      return this.resolveRoleName('opponent', 'Joueur 2')
    },
    adversaryName() {
      if (this.localRole === 'player') return this.opponentName
      if (this.localRole === 'opponent') return this.playerName
      return this.opponentName
    },
    playerSymbol() {
      return this.resolveRoleSymbol('player', this.playerId) || 'X'
    },
    opponentSymbol() {
      return this.resolveRoleSymbol('opponent', this.opponentId) || 'O'
    },
    userSymbol() {
      if (this.localRole === 'player') return this.playerSymbol
      if (this.localRole === 'opponent') return this.opponentSymbol
      return ''
    },
    currentPlayerName() {
      const nextId = this.nextPlayerId
      if (nextId) {
        if (this.idsMatch(this.playerId, nextId)) return this.playerName
        if (this.idsMatch(this.opponentId, nextId)) return this.opponentName
        if (nextId === 1) return this.playerName
        if (nextId === 2) return this.opponentName
      }
      return (
        this.resolveNameDeep(this.game?.next_player) ||
        this.resolveNameDeep(this.game?.current_player) ||
        ''
      )
    },
    turnTitle() {
      if (this.isPlayerTurn) return 'À votre tour'
      if (this.currentPlayerName) return `Au tour de ${this.currentPlayerName}`
      return 'Au tour de ...'
    },
    currentTurnValue() {
      if (this.isPlayerTurn) return 'Vous'
      return this.currentPlayerName || '...'
    },
    isFinished() {
      return this.game?.status === 2
    },
    winnerName() {
      const winnerId = this.game?.winner_id
      if (!winnerId) return ''
      if (this.idsMatch(this.playerId, winnerId)) return this.playerName
      if (this.idsMatch(this.opponentId, winnerId)) return this.opponentName
      return ''
    },
    userId() {
      return this.user?.id || null
    },
    isPlayerTurn() {
      if (!this.game || !this.game.opponent || this.isFinished || !this.userId) return false
      if (this.idsMatch(this.nextPlayerId, this.userId)) return true
      if (this.nextPlayerId === 1 && this.localRole === 'player') return true
      if (this.nextPlayerId === 2 && this.localRole === 'opponent') return true
      return false
    },
  },
  methods: {
    getRoleId(role) {
      const roleValue = this.game?.[role]
      if (typeof roleValue === 'number') return roleValue
      if (typeof roleValue === 'string') {
        const trimmed = roleValue.trim()
        if (!trimmed) return null
        const looksLikeId = /^[0-9a-fA-F-]{8,}$/.test(trimmed) || !Number.isNaN(Number(trimmed))
        if (looksLikeId) return trimmed
      }
      return (
        roleValue?.id ??
        this.game?.[`${role}_id`] ??
        this.game?.[`${role}Id`] ??
        null
      )
    },
    idsMatch(a, b) {
      if (a === null || a === undefined || b === null || b === undefined) return false
      return String(a) === String(b)
    },
    resolveName(value) {
      if (!value) return ''
      if (typeof value === 'string') return value.trim()
      if (typeof value !== 'object') return ''
      const candidate =
        value.name ||
        value.nickname ||
        value.username ||
        value.pseudo ||
        value.displayName ||
        value.display_name ||
        value.fullName ||
        value.full_name
      if (typeof candidate === 'string') {
        return candidate.trim()
      }
      const first =
        value.first_name ||
        value.firstName ||
        value.firstname ||
        value.given_name ||
        value.givenName
      const last =
        value.last_name || value.lastName || value.lastname || value.family_name || value.familyName
      if (typeof first === 'string' || typeof last === 'string') {
        return [first, last].filter(Boolean).join(' ').trim()
      }
      return ''
    },
    isProbablyId(value) {
      if (typeof value !== 'string') return false
      const trimmed = value.trim()
      if (!trimmed) return false
      if (!Number.isNaN(Number(trimmed))) return true
      return /^[0-9a-fA-F-]{8,}$/.test(trimmed)
    },
    resolveNameDeep(value) {
      return (
        this.resolveName(value) ||
        this.resolveName(value?.user) ||
        this.resolveName(value?.user?.profile) ||
        this.resolveName(value?.player) ||
        this.resolveName(value?.profile) ||
        this.resolveName(value?.profile?.user) ||
        this.resolveName(value?.account) ||
        this.resolveName(value?.owner)
      )
    },
    findNameInPool(pool, id) {
      if (!pool) return ''
      if (pool && typeof pool === 'object' && !Array.isArray(pool)) {
        const direct = id ? pool[id] || pool[String(id)] : null
        const directName = this.resolveNameDeep(direct)
        if (directName && !this.isProbablyId(directName)) return directName
        return this.findNameInPool(Object.values(pool), id)
      }
      if (!Array.isArray(pool) || !id) return ''
      const match = pool.find((entry) => {
        const entryId =
          entry?.id ??
          entry?.user_id ??
          entry?.userId ??
          entry?.player_id ??
          entry?.playerId ??
          entry?.account_id ??
          entry?.accountId ??
          entry?.uuid ??
          entry?.uid
        return this.idsMatch(entryId, id)
      })
      if (!match) return ''
      const name = this.resolveNameDeep(match)
      if (name && !this.isProbablyId(name)) return name
      return ''
    },
    collectParticipantNames() {
      const names = []
      const pushName = (value) => {
        const name = this.resolveNameDeep(value)
        if (name && !this.isProbablyId(name)) names.push(name)
      }
      pushName(this.game?.player)
      pushName(this.game?.opponent)
      pushName(this.game?.creator)
      pushName(this.game?.owner)
      pushName(this.game?.host)
      pushName(this.game?.player_name)
      pushName(this.game?.playerName)
      pushName(this.game?.opponent_name)
      pushName(this.game?.opponentName)
      pushName(this.game?.creator_name)
      pushName(this.game?.creatorName)
      pushName(this.game?.owner_name)
      pushName(this.game?.ownerName)

      const pools = [
        this.game?.players,
        this.game?.users,
        this.game?.participants,
        this.game?.members,
        this.game?.player_list,
        this.game?.playerList,
      ]
      pools.forEach((pool) => {
        if (!pool) return
        if (Array.isArray(pool)) {
          pool.forEach((entry) => pushName(entry))
        } else if (typeof pool === 'object') {
          Object.values(pool).forEach((entry) => pushName(entry))
        }
      })

      return [...new Set(names)]
    },
    otherParticipantName() {
      const names = this.collectParticipantNames()
      if (!names.length) return ''
      const selfName = this.selfName?.toLowerCase?.() || ''
      const other = names.find((name) => name.toLowerCase() !== selfName)
      return other || ''
    },
    lookupNameById(id) {
      const pools = [
        this.game?.players,
        this.game?.users,
        this.game?.participants,
        this.game?.members,
        this.game?.player_list,
        this.game?.playerList,
      ]
      for (const pool of pools) {
        const name = this.findNameInPool(pool, id)
        if (name) return name
      }
      return ''
    },
    resolveSymbol(value) {
      if (value === null || value === undefined) return ''
      if (typeof value === 'number') {
        if (value === 1) return 'X'
        if (value === 2) return 'O'
        return String(value)
      }
      if (typeof value !== 'string') return ''
      const trimmed = value.trim()
      if (!trimmed) return ''
      const upper = trimmed.toUpperCase()
      if (upper === '1') return 'X'
      if (upper === '2') return 'O'
      return upper
    },
    resolveRoleName(role, fallback) {
      const roleData = this.game?.[role]
      const roleId = this.getRoleId(role)
      const direct = this.resolveNameDeep(roleData)
      if (direct && !this.isProbablyId(direct)) return direct
      const fromGame =
        this.resolveName(this.game?.[`${role}_name`]) ||
        this.resolveName(this.game?.[`${role}Name`])
      if (fromGame && !this.isProbablyId(fromGame)) return fromGame
      const fromPool = this.lookupNameById(roleId)
      if (fromPool) return fromPool
      if (this.selfName && this.localRole === role) {
        return this.selfName
      }
      if (this.localRole && this.localRole !== role) {
        const otherName = this.otherParticipantName()
        if (otherName) return otherName
      }
      return fallback
    },
    resolveRoleSymbol(role, playerId) {
      const candidates = [
        this.game?.[`${role}_symbol`],
        this.game?.[`${role}Symbol`],
        this.game?.[`${role}_sign`],
        this.game?.[`${role}Sign`],
        this.game?.[`${role}_mark`],
        this.game?.[`${role}Mark`],
        this.game?.[role]?.symbol,
        this.game?.[role]?.sign,
        this.game?.[role]?.mark,
      ]
      for (const candidate of candidates) {
        const resolved = this.resolveSymbol(candidate)
        if (resolved) return resolved
      }

      const symbolMap =
        this.game?.symbols ||
        this.game?.player_symbols ||
        this.game?.playerSymbols ||
        this.game?.marks
      if (symbolMap && playerId) {
        const mapped = symbolMap[playerId] ?? symbolMap[String(playerId)]
        const resolved = this.resolveSymbol(mapped)
        if (resolved) return resolved
      }
      return ''
    },
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
          const symbol =
            this.userSymbol ||
            (this.game?.player?.id === this.userId ? this.playerSymbol : this.opponentSymbol) ||
            'X'
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

      if (this.idsMatch(normalized, this.playerId)) return this.playerSymbol || 'X'
      if (this.idsMatch(normalized, this.opponentId)) return this.opponentSymbol || 'O'

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
        this.toast.show('Copié !', { variant: 'success' })
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
  <main class="page game">
    <BaseCard v-if="game" class="game-header fade-in" dense>
      <div class="header-left">
        <p class="eyebrow">Partie</p>
        <div class="code-line">
          <span class="label">Code</span>
          <CodePill :code="game.code" />
          <BaseButton variant="icon" aria-label="Copier" @click="copyCode(game.code)">
            <Copy class="icon" aria-hidden="true" />
          </BaseButton>
        </div>
        <p class="players-line">
          <span class="player truncate">{{ playerName }}</span>
          <span class="muted">vs</span>
          <span class="player truncate">{{ opponentName }}</span>
        </p>
      </div>
      <BaseButton variant="danger" to="/home">
        <DoorOpen class="icon" aria-hidden="true" />
        Quitter
      </BaseButton>
    </BaseCard>

    <section v-if="game" class="game-grid">
      <BaseCard class="board-card">
        <div v-if="game && !game.opponent" class="waiting-card">
          <Loader2 class="icon spin" aria-hidden="true" />
          <div class="waiting-content">
            <p class="title-lg">En attente d'un adversaire</p>
            <p class="subtitle">Partage le code ci-dessus à ton adversaire.</p>
            <div class="code-share">
              <CodePill :code="game.code" />
              <BaseButton variant="secondary" @click="copyCode(game.code)">
                <Copy class="icon" aria-hidden="true" />
                Copier
              </BaseButton>
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
              {
                disabled:
                  !isCellEmpty(rawBoard[Math.floor(idx / 3)][idx % 3]) ||
                  !isPlayerTurn ||
                  isFinished ||
                  isPlaying,
                winning: isWinningCell(Math.floor(idx / 3), idx % 3),
              },
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
      </BaseCard>

      <BaseCard class="status-card">
        <p class="eyebrow">Statut</p>
        <h2 class="title-lg">{{ turnTitle }}</h2>
        <p class="subtitle" v-if="isPlayerTurn">À votre tour.</p>
        <p class="subtitle" v-else>En attente de votre tour...</p>

        <div class="status-row">
          <BaseBadge tone="live">Tour actuel</BaseBadge>
          <span class="value truncate">{{ currentTurnValue }}</span>
        </div>
        <div class="status-row">
          <BaseBadge>Votre symbole</BaseBadge>
          <span class="value symbol" :class="symbolClass(userSymbol)">{{ userSymbol || '...' }}</span>
        </div>
        <div class="status-row">
          <BaseBadge>Adversaire</BaseBadge>
          <span class="value truncate">{{ adversaryName }}</span>
        </div>
      </BaseCard>
    </section>

    <BaseCard v-if="game && isFinished" class="end-card">
      <p v-if="endMessage" class="title-lg">{{ endMessage }}</p>
      <p v-else-if="winnerName">Partie terminée, {{ winnerName }} a gagné.</p>
      <p v-else>Partie terminée, match nul.</p>
      <BaseButton variant="secondary" to="/home">Retour à l'accueil</BaseButton>
    </BaseCard>

    <ErrorsDisplay :errors="errors" />

    <div v-if="showEndModal" class="modal-backdrop">
      <div class="modal">
        <p class="modal-title">{{ endModalTitle }}</p>
        <p class="modal-text">{{ endModalText }}</p>
        <div class="modal-actions">
          <BaseButton variant="secondary" to="/home">Quitter</BaseButton>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.game {
  display: grid;
  gap: 18px;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.header-left {
  display: grid;
  gap: 6px;
}

.code-line {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.label {
  font-weight: 600;
  color: var(--muted);
  font-size: 14px;
}

.players-line {
  margin: 0;
  display: flex;
  gap: 8px;
  align-items: center;
}

.player {
  font-weight: 600;
}

.truncate {
  max-width: clamp(120px, 20vw, 220px);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.game-grid {
  display: grid;
  gap: 18px;
}

@media (min-width: 960px) {
  .game-grid {
    grid-template-columns: minmax(0, 1fr) 320px;
    align-items: start;
  }
}

.board-card {
  min-height: 420px;
  display: grid;
  place-items: center;
}

.waiting-card {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 16px;
  align-items: center;
}

.waiting-content {
  display: grid;
  gap: 10px;
}

.code-share {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.grid-board {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.cell {
  aspect-ratio: 1 / 1;
  border-radius: 16px;
  border: 1px solid var(--border-subtle);
  background: rgba(255, 255, 255, 0.05);
  display: grid;
  place-items: center;
  font-size: clamp(32px, 5vw, 44px);
  font-weight: 700;
  color: var(--text);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
  cursor: pointer;
}

.cell:hover:not(.disabled) {
  border-color: color-mix(in srgb, var(--accent-cyan) 50%, transparent);
  box-shadow: 0 0 0 3px rgba(106, 228, 255, 0.2);
  transform: translateY(-2px);
}

.cell.disabled {
  cursor: not-allowed;
  opacity: 0.6;
  transform: none;
  box-shadow: none;
}

.cell.winning {
  border-color: color-mix(in srgb, var(--accent-cyan) 60%, transparent);
  box-shadow: 0 0 0 3px rgba(106, 228, 255, 0.25);
}

.symbol {
  text-shadow: 0 0 18px rgba(255, 255, 255, 0.2);
}

.symbol-x .symbol,
.value.symbol.symbol-x {
  color: var(--accent-pink);
}

.symbol-o .symbol,
.value.symbol.symbol-o {
  color: var(--accent-cyan);
}

.status-card {
  display: grid;
  gap: 12px;
}

.status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid var(--border-subtle);
  background: rgba(255, 255, 255, 0.05);
}

.value {
  font-weight: 600;
}

.value.symbol {
  font-weight: 700;
}

.end-card {
  text-align: center;
  display: grid;
  gap: 12px;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(5, 8, 16, 0.6);
  display: grid;
  place-items: center;
  z-index: 1000;
  padding: 16px;
}

.modal {
  background: rgba(13, 17, 30, 0.96);
  color: var(--text);
  border-radius: 16px;
  padding: 20px 22px;
  width: min(440px, 100%);
  border: 1px solid var(--border-subtle);
  box-shadow: var(--shadow-card);
  display: grid;
  gap: 10px;
  backdrop-filter: blur(14px);
}

.modal-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.icon {
  width: 18px;
  height: 18px;
}

.spin {
  animation: spin 0.9s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 720px) {
  .game-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .board-card {
    min-height: 360px;
  }
}
</style>
