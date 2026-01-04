<script>
import api from '@/api'

export default {
  data() {
    return {
      game: null,
      errors: [],
      ws: null,
    }
  },
  computed: {
    board() {
      const grid = this.game?.board || this.game?.grid || this.game?.cells
      if (Array.isArray(grid) && grid.length) return grid
      return [
        ['', '', ''],
        ['', '', ''],
        ['', '', ''],
      ]
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
  },
  methods: {
    async fetchGame(id) {
      const { data } = await api.get(`/api/games/${id}`)
      this.game = data
    },
    waitForOpponentMove() {
      if (!this.game?.id || !this.game?.player?.id || this.ws) return
      const ws = new WebSocket('wss://morpion-api.edu.netlor.fr/websockets')
      this.ws = ws

      ws.addEventListener('open', () => {
        ws.send(
          JSON.stringify({
            action: 'connect',
            game_id: this.game.id,
            player_id: this.game.player.id,
          }),
        )
      })

      ws.addEventListener('message', async (event) => {
        let payload
        try {
          payload = JSON.parse(event.data)
        } catch (err) {
          return
        }

        const action = payload?.action || payload?.type
        if (payload?.game) {
          this.game = payload.game
          return
        }
        if (
          action === 'opponent-join' ||
          action === 'opponent-play' ||
          action === 'opponent-quit'
        ) {
          try {
            await this.fetchGame(this.game.id)
          } catch (err) {
            this.errors = ['Impossible de rafraichir la partie.']
          }
        }
      })

      ws.addEventListener('close', () => {
        this.ws = null
      })
    },
    closeSocket() {
      if (this.ws) {
        this.ws.close()
        this.ws = null
      }
    },
    async play(rowIndex, colIndex) {
      if (!this.game || this.isFinished || !this.game.opponent) return
      if (this.board[rowIndex][colIndex]) return
      this.errors = []
      try {
        const row = rowIndex + 1
        const col = colIndex + 1
        const { data } = await api.patch(
          `/api/games/${this.game.id}/play/${row}/${col}`,
        )
        this.game = data
      } catch (err) {
        const apiErrors = err?.response?.data?.errors
        this.errors = Array.isArray(apiErrors)
          ? apiErrors
          : ['Impossible de jouer cette case.']
      }
    },
  },
  beforeRouteEnter(to, from, next) {
    api
      .get(`/api/games/${to.params.id}`)
      .then(({ data }) => {
        next((vm) => {
          vm.game = data
          vm.waitForOpponentMove()
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
  beforeRouteLeave() {
    this.closeSocket()
  },
}
</script>

<template>
  <main class="game">
    <div v-if="game" class="header">
      <div>
        <p class="title">Partie</p>
        <p class="code">Code: {{ game.code }}</p>
      </div>
      <RouterLink class="close" to="/home">Quitter</RouterLink>
    </div>

    <p v-if="game" class="players">
      {{ game.player?.name || 'Joueur 1' }}
      <span>vs</span>
      {{ game.opponent?.name || 'En attente' }}
    </p>

    <p v-if="game && currentPlayerName && !isFinished" class="turn">
      Au tour de {{ currentPlayerName }}
    </p>

    <p v-if="!game && !errors.length" class="loading">Chargement de la partie...</p>

    <p v-if="game && !game.opponent" class="waiting">
      En attente d'un adversaire...
    </p>

    <div v-if="game && game.opponent && !isFinished" class="board">
      <div v-for="(row, rowIndex) in board" :key="rowIndex" class="row">
        <button
          v-for="(cell, colIndex) in row"
          :key="colIndex"
          type="button"
          class="cell"
          :disabled="!!cell"
          @click="play(rowIndex, colIndex)"
        >
          {{ cell }}
        </button>
      </div>
    </div>

    <div v-if="game && isFinished" class="end">
      <p v-if="winnerName">Partie terminée, {{ winnerName }} a gagné.</p>
      <p v-else>Partie terminée, match nul.</p>
      <RouterLink class="return" to="/home">Retour à l'accueil</RouterLink>
    </div>

    <ul v-if="errors.length" class="errors">
      <li v-for="(error, index) in errors" :key="index">{{ error }}</li>
    </ul>
  </main>
</template>

<style scoped>
.game {
  max-width: 640px;
  margin: 48px auto;
  padding: 0 16px;
}

.header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.title {
  margin: 0;
  font-weight: 600;
}

.code {
  margin: 4px 0 0;
  font-size: 14px;
}

.close {
  text-decoration: none;
  color: #111;
}

.players {
  margin-top: 16px;
  display: flex;
  gap: 8px;
  align-items: center;
  font-weight: 600;
}

.players span {
  font-weight: 400;
  color: #666;
}

.turn {
  margin-top: 8px;
}

.loading,
.waiting {
  margin-top: 24px;
}

.board {
  margin-top: 24px;
  display: grid;
  gap: 6px;
}

.row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}

.cell {
  appearance: none;
  aspect-ratio: 1 / 1;
  display: grid;
  place-items: center;
  font-size: 28px;
  border: 1px solid #222;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
}

.cell:disabled {
  cursor: default;
  color: #111;
}

.end {
  margin-top: 24px;
  display: grid;
  gap: 12px;
}

.return {
  width: fit-content;
  padding: 10px 14px;
  border: 1px solid #111;
  border-radius: 6px;
  text-decoration: none;
  color: #111;
}

.errors {
  margin-top: 16px;
  padding-left: 18px;
  color: #b00020;
}
</style>
