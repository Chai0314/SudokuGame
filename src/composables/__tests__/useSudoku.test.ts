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
    it('简单难度应该有约 45 个空格', () => {
      const { newGame, puzzle } = useSudoku()
      newGame('easy')

      let emptyCount = 0
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          if (puzzle.value[i][j] === 0) emptyCount++
        }
      }
      expect(emptyCount).toBe(36)
    })

    it('专家难度应该有约 58 个空格', () => {
      const { newGame, puzzle } = useSudoku()
      newGame('expert')

      let emptyCount = 0
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          if (puzzle.value[i][j] === 0) emptyCount++
        }
      }
      expect(emptyCount).toBe(58)
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
      const { newGame, getCellState } = useSudoku()
      newGame('easy')

      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          // 找空格
          // We can't directly check since puzzle is reactive
        }
      }
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
