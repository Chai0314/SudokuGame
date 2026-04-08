import { ref, computed } from 'vue'

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert'
export type CellState = 'empty' | 'filled' | 'correct' | 'error'
export type GameStatus = 'idle' | 'playing' | 'won' | 'lost'

export interface Position {
  row: number
  col: number
}

/** 难度对应需要移除的数字数量 */
const DIFFICULTY_MAP: Record<Difficulty, number> = {
  easy: 36,
  medium: 46,
  hard: 52,
  expert: 58,
}

/** Fisher-Yates 洗牌算法 */
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/** 检查数字是否可以放在指定位置 */
function isValid(grid: number[][], row: number, col: number, num: number): boolean {
  // 检查行
  for (let i = 0; i < 9; i++) {
    if (grid[row][i] === num) return false
  }
  // 检查列
  for (let i = 0; i < 9; i++) {
    if (grid[i][col] === num) return false
  }
  // 检查 3x3 宫格
  const startRow = Math.floor(row / 3) * 3
  const startCol = Math.floor(col / 3) * 3
  for (let i = startRow; i < startRow + 3; i++) {
    for (let j = startCol; j < startCol + 3; j++) {
      if (grid[i][j] === num) return false
    }
  }
  return true
}

/** 使用回溯法生成完整的数独解 */
function generateSolution(): number[][] {
  const grid: number[][] = Array.from({ length: 9 }, () => Array(9).fill(0))

  function backtrack(row: number, col: number): boolean {
    if (row === 9) return true

    const nextRow = col === 8 ? row + 1 : row
    const nextCol = col === 8 ? 0 : col + 1

    const numbers = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9])

    for (const num of numbers) {
      if (isValid(grid, row, col, num)) {
        grid[row][col] = num
        if (backtrack(nextRow, nextCol)) return true
        grid[row][col] = 0
      }
    }
    return false
  }

  backtrack(0, 0)
  return grid
}

/** 根据难度从完整棋盘中移除数字，生成谜题 */
function removeNumbers(board: number[][], difficulty: Difficulty): number[][] {
  const puzzle = board.map(row => [...row])
  const removeCount = DIFFICULTY_MAP[difficulty]

  // 生成所有位置的随机排列
  const positions: Position[] = []
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      positions.push({ row: i, col: j })
    }
  }
  const shuffledPositions = shuffleArray(positions)

  // 移除指定数量的数字
  for (let i = 0; i < removeCount && i < shuffledPositions.length; i++) {
    const { row, col } = shuffledPositions[i]
    puzzle[row][col] = 0
  }

  return puzzle
}

export function useSudoku() {
  /** 创建空的 9x9 棋盘 */
  const emptyBoard = (): number[][] => Array.from({ length: 9 }, () => Array(9).fill(0))

  /** 完整答案 */
  const solution = ref<number[][]>(emptyBoard())
  /** 当前谜题状态（用户编辑的） */
  const puzzle = ref<number[][]>(emptyBoard())
  /** 初始谜题（用于判断哪些是预填的） */
  const initialPuzzle = ref<number[][]>(emptyBoard())
  /** 当前选中的单元格 */
  const selectedCell = ref<Position | null>(null)
  /** 已用时间（秒） */
  const timeElapsed = ref(0)
  /** 游戏状态 */
  const gameStatus = ref<GameStatus>('idle')
  /** 当前难度 */
  const difficulty = ref<Difficulty>('medium')
  /** 计时器 ID */
  let timerId: ReturnType<typeof setInterval> | null = null

  /** 完成度百分比 */
  const progress = computed(() => {
    if (!puzzle.value || puzzle.value.length === 0) return 0
    let filledCount = 0
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (puzzle.value[i][j] !== 0) filledCount++
      }
    }
    return Math.round((filledCount / 81) * 100)
  })

  /** 格式化的时间 */
  const formattedTime = computed(() => {
    const minutes = Math.floor(timeElapsed.value / 60)
    const seconds = timeElapsed.value % 60
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  })

  /** 判断某个位置是否是预填的 */
  function isReadonly(row: number, col: number): boolean {
    return initialPuzzle.value[row]?.[col] !== 0
  }

  /** 获取某个位置的单元格状态 */
  function getCellState(row: number, col: number): CellState {
    if (!puzzle.value[row] || puzzle.value[row][col] === 0) return 'empty'
    if (isReadonly(row, col)) return 'correct'
    if (puzzle.value[row][col] === solution.value[row][col]) return 'correct'
    return 'error'
  }

  /** 获取与指定位置相关的所有位置（同行、同列、同宫） */
  function getRelatedPositions(row: number, col: number): Position[] {
    const positions: Position[] = []
    for (let i = 0; i < 9; i++) {
      if (i !== col) positions.push({ row, col: i })
      if (i !== row) positions.push({ row: i, col })
    }
    const startRow = Math.floor(row / 3) * 3
    const startCol = Math.floor(col / 3) * 3
    for (let i = startRow; i < startRow + 3; i++) {
      for (let j = startCol; j < startCol + 3; j++) {
        if (i !== row || j !== col) {
          positions.push({ row: i, col: j })
        }
      }
    }
    return positions
  }

  /** 选择单元格 */
  function selectCell(row: number, col: number) {
    if (isReadonly(row, col)) {
      selectedCell.value = null
      return
    }
    selectedCell.value = { row, col }
  }

  /** 填充数字 */
  function fillCell(row: number, col: number, number: number): boolean {
    if (isReadonly(row, col)) return false
    if (gameStatus.value !== 'playing') return false

    puzzle.value[row][col] = number

    // 检查是否完成
    if (checkGameCompletion()) {
      gameStatus.value = 'won'
      stopTimer()
    }

    return true
  }

  /** 清除单元格 */
  function clearCell(row: number, col: number) {
    if (isReadonly(row, col)) return
    if (gameStatus.value !== 'playing') return
    puzzle.value[row][col] = 0
  }

  /** 获取提示：随机填入一个正确数字 */
  function getHint(): Position | null {
    if (gameStatus.value !== 'playing') return null

    const emptyCells: Position[] = []
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (puzzle.value[i][j] === 0) {
          emptyCells.push({ row: i, col: j })
        }
      }
    }

    if (emptyCells.length === 0) return null

    const cell = emptyCells[Math.floor(Math.random() * emptyCells.length)]
    puzzle.value[cell.row][cell.col] = solution.value[cell.row][cell.col]
    selectedCell.value = cell

    // 检查是否完成
    if (checkGameCompletion()) {
      gameStatus.value = 'won'
      stopTimer()
    }

    return cell
  }

  /** 显示答案 */
  function showSolution() {
    if (gameStatus.value !== 'playing') return
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (puzzle.value[i][j] !== solution.value[i][j]) {
          puzzle.value[i][j] = solution.value[i][j]
        }
      }
    }
    gameStatus.value = 'won'
    stopTimer()
  }

  /** 检查答案（用于"检查"按钮） */
  function checkSolution(): { hasError: boolean; isComplete: boolean } {
    let hasError = false
    let isComplete = true

    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (puzzle.value[i][j] === 0) {
          isComplete = false
        } else if (puzzle.value[i][j] !== solution.value[i][j]) {
          hasError = true
        }
      }
    }

    if (isComplete && !hasError) {
      gameStatus.value = 'won'
      stopTimer()
    }

    return { hasError, isComplete: isComplete && !hasError }
  }

  /** 检查游戏是否完成 */
  function checkGameCompletion(): boolean {
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (puzzle.value[i][j] !== solution.value[i][j]) return false
      }
    }
    return true
  }

  /** 开始计时 */
  function startTimer() {
    stopTimer()
    timerId = setInterval(() => {
      timeElapsed.value++
    }, 1000)
  }

  /** 停止计时 */
  function stopTimer() {
    if (timerId) {
      clearInterval(timerId)
      timerId = null
    }
  }

  /** 开始新游戏 */
  function newGame(diff?: Difficulty) {
    if (diff) difficulty.value = diff

    stopTimer()
    timeElapsed.value = 0
    gameStatus.value = 'playing'
    selectedCell.value = null

    solution.value = generateSolution()
    const puzzleBoard = removeNumbers(solution.value, difficulty.value)
    puzzle.value = puzzleBoard.map(row => [...row])
    initialPuzzle.value = puzzleBoard.map(row => [...row])

    startTimer()
  }

  /** 清理 */
  function cleanup() {
    stopTimer()
  }

  return {
    // 状态
    solution,
    puzzle,
    initialPuzzle,
    selectedCell,
    timeElapsed,
    gameStatus,
    difficulty,
    progress,
    formattedTime,
    // 方法
    isReadonly,
    getCellState,
    getRelatedPositions,
    selectCell,
    fillCell,
    clearCell,
    getHint,
    showSolution,
    checkSolution,
    newGame,
    cleanup,
  }
}
