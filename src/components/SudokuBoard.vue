<template>
  <div class="sudoku-board">
    <table>
      <tbody>
        <tr v-for="(row, rowIndex) in board" :key="rowIndex">
          <td v-for="(cell, colIndex) in row" :key="colIndex">
            <input
              v-model="board[rowIndex][colIndex]"
              :disabled="initialBoard[rowIndex][colIndex]!== 0"
              @input="handleInput(rowIndex, colIndex)"
              type="number"
              min="1"
              max="9"
            />
          </td>
        </tr>
      </tbody>
    </table>
    <button @click="solveSudoku">求解</button>
    <button @click="generateNewPuzzle">生成新数独</button>
  </div>
</template>

<script>
import { reactive } from 'vue';

export default { 
  name: 'SudokuBoard',
  setup() {
    const board = reactive([
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0]
    ]);
    const initialBoard = reactive(JSON.parse(JSON.stringify(board)));

    const solveSudoku = () => {
      // 数独求解逻辑
    };

    const generateNewPuzzle = () => {
      // 生成新数独谜题逻辑
    };

    const handleInput = (rowIndex, colIndex) => {
        console.log('---', rowIndex, colIndex)
      // 输入处理逻辑
    };

    return {
      board,
      initialBoard,
      solveSudoku,
      generateNewPuzzle,
      handleInput
    };
  }
};
</script>

<style scoped>
.sudoku-board {
  text-align: center;
}

table {
  margin: 20px auto;
  border-collapse: collapse;
}

td {
  border: 1px solid #ccc;
  width: 30px;
  height: 30px;
}

td:nth-child(3n) {
  border-right: 2px solid #000;
}

tr:nth-child(3n) td {
  border-bottom: 2px solid #000;
}

input {
  width: 100%;
  height: 100%;
  text-align: center;
  border: none;
}
</style>