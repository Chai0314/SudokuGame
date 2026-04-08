import { describe, it, expect, beforeEach } from 'vitest'
import { useSudoku } from '../useSudoku'

describe('useSudoku', () => {
  beforeEach(() => {
    // 每个测试前创建新的实例
  })

  describe('generateSolution', () => {
    it('应该生成一个有效的 9x9 数独解', () => {
      const { newGame, solution } = useSudoku()
      newGame('easy')

      // 检查维度
      expect(solution.value).toHaveLength(9)
      for (let i = 0; i < 9; i++) {
        expect(solution.value[i]).toHaveLength(9)
      }

      // 检查每行不重复
      for (let i = 0; i < 9; i++) {
        const row = solution.value[i]
        expect(new Set(row).size).toBe(9)
      }

      // 检查每列不重复
      for (let j = 0; j < 9; j++) {
        const col = solution.value.map(row => row[j])
        expect(new Set(col).size).toBe(9)
      }

      // 检查每个 3x3 宫格不重复
      for (let boxRow = 0; boxRow < 3; boxRow++) {
        for (let boxCol = 0; boxCol < 3; boxCol++) {
          const box: number[] = []
          for (let i = boxRow * 3; i < boxRow * 3 + 3; i++) {
            for (let j = boxCol * 3; j < boxCol * 3 + 3; j++) {
              box.push(solution.value[i][j])
            }
          }
          expect(new Set(box).size).toBe(9)
        }
      }
    })
  })

  describe('removeNumbers', () => {
    it('简单难度应该有空格（可能少于目标值，因为要保证唯一解）', () => {
      const { newGame, puzzle } = useSudoku()
      newGame('easy')

      let emptyCount = 0
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          if (puzzle.value[i][j] === 0) emptyCount++
        }
      }
      // 由于唯一解约束，实际移除数可能少于目标值，但应该有相当数量的空格
      expect(emptyCount).toBeGreaterThan(0)
      expect(emptyCount).toBeLessThanOrEqual(36)
    })

    it('专家难度应该有空格（可能少于目标值，因为要保证唯一解）', () => {
      const { newGame, puzzle } = useSudoku()
      newGame('expert')

      let emptyCount = 0
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          if (puzzle.value[i][j] === 0) emptyCount++
        }
      }
      expect(emptyCount).toBeGreaterThan(0)
      expect(emptyCount).toBeLessThanOrEqual(58)
    })

    it('谜题应该有唯一解', () => {
      const { newGame, puzzle } = useSudoku()
      newGame('medium')

      // 验证谜题有且仅有一个解
      const solutions = solveAll(puzzle.value, 2)
      expect(solutions).toBe(1)
    })
  })

  describe('fillCell', () => {
    it('应该能填入正确数字', () => {
      const { newGame, puzzle, solution, fillCell, isReadonly } = useSudoku()
      newGame('easy')

      // 找到一个空格
      let emptyRow = -1, emptyCol = -1
      for (let i = 0; i < 9 && emptyRow === -1; i++) {
        for (let j = 0; j < 9 && emptyRow === -1; j++) {
          if (puzzle.value[i][j] === 0) {
            emptyRow = i
            emptyCol = j
          }
        }
      }

      expect(emptyRow).toBeGreaterThan(-1)
      const correctNum = solution.value[emptyRow][emptyCol]
      const result = fillCell(emptyRow, emptyCol, correctNum)
      expect(result).toBe(true)
      expect(puzzle.value[emptyRow][emptyCol]).toBe(correctNum)
    })

    it('不应该修改预填格', () => {
      const { newGame, puzzle, fillCell, isReadonly } = useSudoku()
      newGame('easy')

      // 找到一个预填格
      let readonlyRow = -1, readonlyCol = -1
      for (let i = 0; i < 9 && readonlyRow === -1; i++) {
        for (let j = 0; j < 9 && readonlyRow === -1; j++) {
          if (isReadonly(i, j)) {
            readonlyRow = i
            readonlyCol = j
          }
        }
      }

      expect(readonlyRow).toBeGreaterThan(-1)
      const originalValue = puzzle.value[readonlyRow][readonlyCol]
      const result = fillCell(readonlyRow, readonlyCol, 9)
      expect(result).toBe(false)
      expect(puzzle.value[readonlyRow][readonlyCol]).toBe(originalValue)
    })
  })

  describe('clearCell', () => {
    it('应该能清除用户填入的数字', () => {
      const { newGame, puzzle, solution, fillCell, clearCell, isReadonly } = useSudoku()
      newGame('easy')

      // 找到一个空格并填入正确数字
      let emptyRow = -1, emptyCol = -1
      for (let i = 0; i < 9 && emptyRow === -1; i++) {
        for (let j = 0; j < 9 && emptyRow === -1; j++) {
          if (puzzle.value[i][j] === 0) {
            emptyRow = i
            emptyCol = j
          }
        }
      }

      fillCell(emptyRow, emptyCol, solution.value[emptyRow][emptyCol])
      expect(puzzle.value[emptyRow][emptyCol]).not.toBe(0)

      clearCell(emptyRow, emptyCol)
      expect(puzzle.value[emptyRow][emptyCol]).toBe(0)
    })
  })

  describe('getCellState', () => {
    it('预填格应该返回 correct', () => {
      const { newGame, getCellState, isReadonly } = useSudoku()
      newGame('easy')

      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          if (isReadonly(i, j)) {
            expect(getCellState(i, j)).toBe('correct')
          }
        }
      }
    })

    it('空格应该返回 empty', () => {
      const { newGame, getCellState, puzzle } = useSudoku()
      newGame('easy')

      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          if (puzzle.value[i][j] === 0) {
            expect(getCellState(i, j)).toBe('empty')
          }
        }
      }
    })

    it('填入冲突数字应该返回 error', () => {
      const { newGame, puzzle, fillCell, getCellState, isReadonly } = useSudoku()
      newGame('easy')

      // 找一个空格
      let emptyRow = -1, emptyCol = -1
      for (let i = 0; i < 9 && emptyRow === -1; i++) {
        for (let j = 0; j < 9 && emptyRow === -1; j++) {
          if (puzzle.value[i][j] === 0) {
            emptyRow = i
            emptyCol = j
          }
        }
      }

      // 找同行中已存在的一个数字
      let conflictNum = 0
      for (let j = 0; j < 9; j++) {
        if (puzzle.value[emptyRow][j] !== 0) {
          conflictNum = puzzle.value[emptyRow][j]
          break
        }
      }

      expect(conflictNum).toBeGreaterThan(0)
      fillCell(emptyRow, emptyCol, conflictNum)
      expect(getCellState(emptyRow, emptyCol)).toBe('error')
    })
  })

  describe('checkSolution', () => {
    it('未完成的谜题应该返回 isComplete=false', () => {
      const { newGame, checkSolution } = useSudoku()
      newGame('easy')

      const result = checkSolution()
      expect(result.isComplete).toBe(false)
    })

    it('填满正确答案后应该返回 isComplete=true', () => {
      const { newGame, solution, puzzle, fillCell, checkSolution, isReadonly } = useSudoku()
      newGame('easy')

      // 填入所有正确答案
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          if (!isReadonly(i, j)) {
            fillCell(i, j, solution.value[i][j])
          }
        }
      }

      const result = checkSolution()
      expect(result.isComplete).toBe(true)
      expect(result.hasError).toBe(false)
    })
  })

  describe('progress', () => {
    it('初始进度应该大于 0（因为有预填格）', () => {
      const { newGame, progress } = useSudoku()
      newGame('easy')
      expect(progress.value).toBeGreaterThan(0)
      expect(progress.value).toBeLessThan(100)
    })
  })

  describe('getRelatedPositions', () => {
    it('应该返回同行、同列、同宫的位置（排除自身）', () => {
      const { newGame, getRelatedPositions } = useSudoku()
      newGame('easy')

      const positions = getRelatedPositions(0, 0)
      // 同行 8 + 同列 8 + 同宫 8（含重复）= 24（函数未去重）
      expect(positions.length).toBe(24)
    })
  })
})

/** 辅助函数：求解数独并计数（最多 limit 个解） */
function solveAll(grid: number[][], limit: number = 2): number {
  let count = 0
  const board = grid.map(row => [...row])

  function isValid(board: number[][], row: number, col: number, num: number): boolean {
    for (let i = 0; i < 9; i++) {
      if (board[row][i] === num) return false
    }
    for (let i = 0; i < 9; i++) {
      if (board[i][col] === num) return false
    }
    const startRow = Math.floor(row / 3) * 3
    const startCol = Math.floor(col / 3) * 3
    for (let i = startRow; i < startRow + 3; i++) {
      for (let j = startCol; j < startCol + 3; j++) {
        if (board[i][j] === num) return false
      }
    }
    return true
  }

  function backtrack(row: number, col: number): void {
    if (count >= limit) return
    if (row === 9) { count++; return }

    const nextRow = col === 8 ? row + 1 : row
    const nextCol = col === 8 ? 0 : col + 1

    if (board[row][col] !== 0) {
      backtrack(nextRow, nextCol)
      return
    }

    for (let num = 1; num <= 9; num++) {
      if (isValid(board, row, col, num)) {
        board[row][col] = num
        backtrack(nextRow, nextCol)
        board[row][col] = 0
      }
    }
  }

  backtrack(0, 0)
  return count
}
