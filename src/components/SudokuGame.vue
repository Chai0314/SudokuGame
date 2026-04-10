<template>
  <div class="min-h-screen bg-gradient-to-br from-light via-white to-blue-50 font-sans">
    <!-- 顶部标题 -->
    <header class="text-center pt-8 pb-6 px-4">
      <h1 class="text-[clamp(2rem,5vw,3.5rem)] font-extrabold tracking-tight mb-2">
        <span class="text-primary">数</span><span class="text-accent">独</span>
        <span class="text-[clamp(1rem,2vw,1.5rem)] font-normal text-gray-500 ml-2">Sudoku</span>
      </h1>
      <p class="text-gray-500 max-w-xl mx-auto text-sm md:text-base">
        锻炼逻辑思维的经典数字游戏，将数字 1-9 填入空格，使每行、每列和每个 3×3 宫格内均不重复。
      </p>
    </header>

    <!-- 主内容区域 -->
    <div class="max-w-5xl mx-auto px-4 pb-12">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <!-- 左侧面板 -->
        <div class="lg:col-span-1 order-2 lg:order-1 space-y-4">
          <!-- 游戏进度卡片 -->
          <div class="bg-white rounded-2xl shadow-md p-5">
            <h2 class="text-lg font-bold text-dark mb-3 flex items-center">
              <i class="fa-solid fa-trophy text-accent mr-2"></i>游戏进度
            </h2>
            <div class="grid grid-cols-2 gap-3 mb-4">
              <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 text-center">
                <p class="text-xs text-gray-500 mb-1">已用时</p>
                <p class="text-2xl font-bold text-primary tabular-nums">{{ formattedTime }}</p>
              </div>
              <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 text-center">
                <p class="text-xs text-gray-500 mb-1">完成度</p>
                <p class="text-2xl font-bold text-secondary tabular-nums">{{ progress }}%</p>
              </div>
            </div>
            <div class="bg-gray-50 rounded-xl p-3">
              <p class="text-xs text-gray-500 mb-1">难度</p>
              <select
                v-model="difficulty"
                class="w-full p-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              >
                <option value="easy">🟢 简单</option>
                <option value="medium">🟡 中等</option>
                <option value="hard">🔴 困难</option>
                <option value="expert">💀 专家</option>
              </select>
            </div>
          </div>

          <!-- 游戏说明卡片 -->
          <div class="bg-white rounded-2xl shadow-md p-5">
            <h2 class="text-lg font-bold text-dark mb-3 flex items-center">
              <i class="fa-solid fa-circle-info text-primary mr-2"></i>游戏说明
            </h2>
            <ul class="text-gray-600 space-y-2 text-sm">
              <li class="flex items-start">
                <i class="fa-solid fa-circle-check text-secondary mt-0.5 mr-2 text-xs"></i>
                <span>点击空格后，使用数字键盘或键盘 1-9 输入</span>
              </li>
              <li class="flex items-start">
                <i class="fa-solid fa-circle-check text-secondary mt-0.5 mr-2 text-xs"></i>
                <span>错误数字显示为<span class="text-red-500 font-medium">红色</span></span>
              </li>
              <li class="flex items-start">
                <i class="fa-solid fa-circle-check text-secondary mt-0.5 mr-2 text-xs"></i>
                <span>方向键移动选中，Delete/Backspace 清除</span>
              </li>
              <li class="flex items-start">
                <i class="fa-solid fa-circle-check text-secondary mt-0.5 mr-2 text-xs"></i>
                <span>点击"提示"可获取一个正确数字</span>
              </li>
            </ul>
          </div>

          <!-- 操作按钮 -->
          <div class="bg-white rounded-2xl shadow-md p-5 space-y-3">
            <div class="grid grid-cols-2 gap-3">
              <button
                @click="handleNewGame"
                class="bg-primary hover:bg-blue-600 text-white py-3 px-4 rounded-xl font-medium flex items-center justify-center btn-hover text-sm"
              >
                <i class="fa-solid fa-rotate-right mr-2"></i>新游戏
              </button>
              <button
                @click="handleHint"
                :disabled="gameStatus !== 'playing'"
                class="bg-accent hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-4 rounded-xl font-medium flex items-center justify-center btn-hover text-sm"
              >
                <i class="fa-solid fa-lightbulb mr-2"></i>提示
              </button>
            </div>
            <button
              @click="handleShowSolution"
              :disabled="gameStatus !== 'playing'"
              class="w-full bg-secondary hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-4 rounded-xl font-medium flex items-center justify-center btn-hover text-sm"
            >
              <i class="fa-solid fa-wand-magic-sparkles mr-2"></i>显示答案
            </button>
          </div>
        </div>

        <!-- 右侧：棋盘区域 -->
        <div class="lg:col-span-2 order-1 lg:order-2">
          <div class="bg-white rounded-2xl shadow-md p-5">
            <!-- 棋盘标题栏 -->
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-lg font-bold text-dark flex items-center">
                <i class="fa-solid fa-table-cells text-primary mr-2"></i>数独棋盘
              </h2>
              <div class="flex space-x-2">
                <button
                  @click="handleClear"
                  :disabled="!selectedCell || gameStatus !== 'playing'"
                  class="bg-gray-100 hover:bg-gray-200 disabled:opacity-40 text-gray-700 py-2 px-4 rounded-lg font-medium btn-hover text-sm"
                >
                  <i class="fa-solid fa-eraser mr-1"></i>清除
                </button>
                <button
                  @click="handleCheck"
                  :disabled="gameStatus !== 'playing'"
                  class="bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white py-2 px-4 rounded-lg font-medium btn-hover text-sm"
                >
                  <i class="fa-solid fa-check mr-1"></i>检查
                </button>
              </div>
            </div>

            <!-- 数独棋盘 -->
            <div class="flex justify-center mb-6">
              <div class="inline-grid grid-cols-9 border-2 border-gray-600 rounded-lg overflow-hidden shadow-inner">
                <div
                  v-for="(_, index) in 81"
                  :key="index"
                  :class="getCellClasses(index)"
                  @click="handleCellClick(index)"
                  @contextmenu="handleCellRightClick(index, $event)"
                >
                  <span class="cell-main-number">{{ getCellDisplay(index) }}</span>
                  <div v-if="getCellMarks(index).length > 0" class="cell-marks">
                    <span v-for="mark in getCellMarks(index)" :key="mark" class="cell-mark">{{ mark }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 数字选择器 -->
            <div class="grid grid-cols-9 gap-1.5 max-w-md mx-auto">
              <button
                v-for="n in 9"
                :key="n"
                class="num-btn"
                :class="{ 'num-btn-completed': numberCounts[n] >= 9 }"
                :disabled="gameStatus !== 'playing' || numberCounts[n] >= 9"
                :title="numberCounts[n] >= 9 ? '该数字已全部填入' : `剩余 ${9 - numberCounts[n]} 个`"
                @click="handleNumberInput(n)"
              >
                {{ n }}
                <span class="block text-[10px] leading-none mt-0.5 opacity-60">{{ 9 - numberCounts[n] }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 结果弹窗 -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showModal"
          class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          @click.self="showModal = false"
        >
          <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
            <div class="text-6xl mb-4">{{ modalIcon }}</div>
            <h2 class="text-2xl font-bold mb-2" :class="modalTitleClass">{{ modalTitle }}</h2>
            <p class="text-gray-500 mb-6">{{ modalMessage }}</p>
            <button
              @click="handlePlayAgain"
              class="bg-primary hover:bg-blue-600 text-white py-3 px-8 rounded-xl font-medium btn-hover"
            >
              再玩一次
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- 页脚 -->
    <footer class="text-center text-gray-400 text-xs pb-6">
      <p>&copy; 2025 数独游戏 | 锻炼逻辑思维的经典数字游戏</p>
    </footer>
  </div>
</template>

<style scoped>
/* 单元格样式 */
.sudoku-cell {
  position: relative;
  width: 48px;
  height: 48px;
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

/* 主数字样式 */
.cell-main-number {
  z-index: 1;
}

/* 标记容器 */
.cell-marks {
  position: absolute;
  top: 2px;
  left: 2px;
  right: 2px;
  bottom: 2px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 1px;
  z-index: 0;
}

/* 单个标记样式 */
.cell-mark {
  font-size: 10px;
  font-weight: 400;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 3x3 宫格粗线 */
.border-b-thick {
  border-bottom: 2px solid #4b5563;
}

.border-r-thick {
  border-right: 2px solid #4b5563;
}

/* 预填格 */
.cell-readonly {
  background-color: #f9fafb;
  color: #111827;
  font-weight: 700;
}

/* 选中状态 */
.cell-selected {
  background-color: #dbeafe;
  border-color: #3b82f6;
}

/* 关联高亮 */
.cell-highlight {
  background-color: #eff6ff;
}

/* 正确状态 */
.cell-correct {
  color: #10b981;
}

/* 错误状态 */
.cell-error {
  color: #ef4444;
}

/* 数字按钮样式 */
.num-btn {
  width: 100%;
  aspect-ratio: 1;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background-color: #ffffff;
  color: #111827;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.num-btn:hover:not(:disabled) {
  background-color: #f3f4f6;
  border-color: #d1d5db;
}

.num-btn:active:not(:disabled) {
  background-color: #e5e7eb;
}

.num-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.num-btn-completed {
  background-color: #f0fdf4;
  border-color: #bbf7d0;
  color: #16a34a;
}

/* 按钮悬停效果 */
.btn-hover {
  transition: all 0.2s ease;
}

.btn-hover:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.btn-hover:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

/* 模态框动画 */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useSudoku } from '../composables/useSudoku'

const {
  puzzle,
  selectedCell,
  gameStatus,
  difficulty,
  progress,
  formattedTime,
  numberCounts,
  bestTimes,
  timeElapsed,
  marks,
  isReadonly,
  getCellState,
  getRelatedPositions,
  selectCell,
  fillCell,
  clearCell,
  addMark,
  removeMark,
  toggleMark,
  clearMarks,
  getHint,
  showSolution,
  checkSolution,
  newGame,
  cleanup,
} = useSudoku()

// 弹窗状态
const showModal = ref(false)
const modalIsSuccess = ref(true)
const isNewRecord = ref(false)

const modalIcon = computed(() => modalIsSuccess.value ? (isNewRecord.value ? '🌟' : '🏆') : '😅')
const modalTitle = computed(() => modalIsSuccess.value ? (isNewRecord.value ? '新纪录！' : '恭喜你！') : '再试一次')
const modalTitleClass = computed(() => modalIsSuccess.value ? (isNewRecord.value ? 'text-accent' : 'text-secondary') : 'text-red-500')
const modalMessage = computed(() => {
  if (modalIsSuccess.value) {
    const minutes = Math.floor(formattedTime.value.split(':')[0])
    const seconds = formattedTime.value.split(':')[1]
    const currentTime = `${minutes} 分 ${seconds} 秒`
    
    const bestTime = bestTimes.value[difficulty.value]
    let bestTimeStr = '无记录'
    if (bestTime !== null) {
      const bestMinutes = Math.floor(bestTime / 60)
      const bestSeconds = bestTime % 60
      bestTimeStr = `${bestMinutes} 分 ${bestSeconds} 秒`
    }
    
    if (isNewRecord.value) {
      return `🎉 新纪录！你完成了数独游戏，用时 ${currentTime}。\n这是你在 ${difficulty.value === 'easy' ? '简单' : difficulty.value === 'medium' ? '中等' : difficulty.value === 'hard' ? '困难' : '专家'} 难度的最快记录！`
    } else {
      return `你完成了数独游戏，用时 ${currentTime}。\n当前 ${difficulty.value === 'easy' ? '简单' : difficulty.value === 'medium' ? '中等' : difficulty.value === 'hard' ? '困难' : '专家'} 难度的最快记录是 ${bestTimeStr}。`
    }
  }
  return '你的答案中包含错误，请检查后继续。'
})

/** 获取单元格的行和列 */
function getRowCol(index: number): { row: number; col: number } {
  return { row: Math.floor(index / 9), col: index % 9 }
}

/** 获取单元格显示的数字 */
function getCellDisplay(index: number): string {
  const { row, col } = getRowCol(index)
  return puzzle.value[row]?.[col] !== 0 ? String(puzzle.value[row][col]) : ''
}

/** 获取单元格的标记 */
function getCellMarks(index: number): number[] {
  const { row, col } = getRowCol(index)
  return Array.from(marks.value[row]?.[col] || []).sort((a, b) => a - b)
}

/** 处理单元格右键点击 */
function handleCellRightClick(index: number, event: MouseEvent) {
  event.preventDefault() // 阻止默认右键菜单
  const { row, col } = getRowCol(index)
  if (isReadonly(row, col)) return
  if (gameStatus.value !== 'playing') return
  if (puzzle.value[row][col] !== 0) return // 已有数字的单元格不能添加标记
  
  selectedCell.value = { row, col }
}

/** 获取单元格的 CSS 类 */
function getCellClasses(index: number): string {
  const { row, col } = getRowCol(index)
  const classes = ['sudoku-cell']

  // 3x3 宫格粗线
  if (row === 2 || row === 5) classes.push('border-b-thick')
  if (col === 2 || col === 5) classes.push('border-r-thick')

  // 预填格
  if (isReadonly(row, col)) {
    classes.push('cell-readonly')
  } else {
    // 单元格状态
    const state = getCellState(row, col)
    if (state === 'correct') classes.push('cell-correct')
    if (state === 'error') classes.push('cell-error')

    // 选中状态
    if (selectedCell.value && selectedCell.value.row === row && selectedCell.value.col === col) {
      classes.push('cell-selected')
    }

    // 关联高亮
    if (selectedCell.value && !(selectedCell.value.row === row && selectedCell.value.col === col)) {
      const related = getRelatedPositions(selectedCell.value.row, selectedCell.value.col)
      if (related.some(p => p.row === row && p.col === col)) {
        classes.push('cell-highlight')
      }
    }
  }

  return classes.join(' ')
}

/** 处理单元格点击 */
function handleCellClick(index: number) {
  const { row, col } = getRowCol(index)
  selectCell(row, col)
}

/** 处理数字输入 */
function handleNumberInput(num: number) {
  if (!selectedCell.value) return
  fillCell(selectedCell.value.row, selectedCell.value.col, num)
}

/** 处理清除 */
function handleClear() {
  if (!selectedCell.value) return
  clearCell(selectedCell.value.row, selectedCell.value.col)
}

/** 处理提示 */
function handleHint() {
  const result = getHint()
  if (result) {
    selectCell(result.row, result.col)
  }
}

/** 处理显示答案 */
function handleShowSolution() {
  showSolution()
}

/** 处理检查 */
function handleCheck() {
  const { hasError, isComplete, isNewRecord: newRecord } = checkSolution()
  if (isComplete) {
    modalIsSuccess.value = true
    isNewRecord.value = newRecord
    showModal.value = true
  } else if (hasError) {
    modalIsSuccess.value = false
    isNewRecord.value = false
    showModal.value = true
  }
}

/** 处理新游戏 */
function handleNewGame() {
  showModal.value = false
  newGame()
}

/** 处理再玩一次 */
function handlePlayAgain() {
  showModal.value = false
  newGame()
}

/** 键盘事件处理 */
function handleKeydown(e: KeyboardEvent) {
  if (!selectedCell.value || gameStatus.value !== 'playing') return

  const { row, col } = selectedCell.value

  // 数字键
  if (e.key >= '1' && e.key <= '9') {
    if (e.altKey) {
      // Alt + 数字键：添加/移除标记
      toggleMark(row, col, parseInt(e.key))
    } else {
      // 普通数字键：填充数字
      fillCell(row, col, parseInt(e.key))
    }
    return
  }

  // 删除键
  if (e.key === 'Delete' || e.key === 'Backspace') {
    if (puzzle.value[row][col] === 0) {
      // 单元格为空时，清除所有标记
      clearMarks(row, col)
    } else {
      // 单元格有数字时，清除数字
      clearCell(row, col)
    }
    return
  }

  // 方向键
  if (e.key === 'ArrowUp' && row > 0) { selectCell(row - 1, col); e.preventDefault() }
  else if (e.key === 'ArrowDown' && row < 8) { selectCell(row + 1, col); e.preventDefault() }
  else if (e.key === 'ArrowLeft' && col > 0) { selectCell(row, col - 1); e.preventDefault() }
  else if (e.key === 'ArrowRight' && col < 8) { selectCell(row, col + 1); e.preventDefault() }
}

onMounted(() => {
  newGame()
  document.addEventListener('keydown', handleKeydown)
})

// 监听游戏状态变化，当游戏获胜时显示提示框
watch(() => gameStatus.value, (newStatus) => {
  if (newStatus === 'won') {
    // 计算是否创造了新纪录
    const currentTime = timeElapsed.value
    const bestTime = bestTimes.value[difficulty.value]
    isNewRecord.value = bestTime === null || currentTime < bestTime
    modalIsSuccess.value = true
    showModal.value = true
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  cleanup()
})
</script>
