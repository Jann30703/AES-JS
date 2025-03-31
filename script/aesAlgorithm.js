import { generateSBox, generateInverseSBox, generateRCON } from "./box.js";
import { gfMultiply, toStateMatrix } from "./util.js";

const SBOX = generateSBox();
const INV_SBOX = generateInverseSBox();
const RCON = generateRCON(14);

export function subWord(word) {
  return word.map((byte) => SBOX[byte]);
}

export function rotWord(word) {
  return [word[1], word[2], word[3], word[0]];
}

export function keyExpansion(key) {
  let expandedKeys = [];
  let words = [];

  const Nk = key.length / 4; // Số từ khóa (AES-128: 4, AES-192: 6, AES-256: 8)
  const Nb = 4; // Số cột của state matrix
  const Nr = Nk + 6; // Số vòng AES
  const totalWords = Nb * (Nr + 1); // Tổng số từ cần tạo

  // Chia key thành các từ 4 byte
  for (let i = 0; i < Nk; i++) {
    words[i] = key.slice(i * 4, (i + 1) * 4);
  }

  for (let i = Nk; i < totalWords; i++) {
    let temp = words[i - 1];

    if (i % Nk === 0) {
      temp = subWord(rotWord(temp));
      temp = temp.map((byte, j) => byte ^ RCON[Math.floor(i / Nk) - 1][j]);
    } else if (Nk === 8 && i % Nk === 4) {
      // Xử lý riêng AES-256
      temp = subWord(temp);
    }

    words[i] = words[i - Nk].map((byte, j) => byte ^ temp[j]);
  }

  // Gộp lại thành khóa con
  for (let i = 0; i < totalWords; i += Nb) {
    expandedKeys.push(words.slice(i, i + Nb));
  }

  return expandedKeys;
}

function addRoundKey(state, roundKey) {
  for (let i = 0; i < 4; i++) {
    // 4 cột của ma trận
    for (let j = 0; j < 4; j++) {
      // 4 hàng của ma trận
      state[j][i] ^= roundKey[i][j]; // XOR từng byte
    }
  }
}

function subBytes(state) {
  for (let i = 0; i < 4; i++) {
    // Duyệt qua từng cột
    for (let j = 0; j < 4; j++) {
      // Duyệt qua từng hàng
      state[j][i] = SBOX[state[j][i]]; // Thay thế bằng giá trị từ S-box
    }
  }
}

function shiftRows(state) {
  for (let i = 1; i < 4; i++) {
    // Hàng 0 không thay đổi
    state[i] = state[i].slice(i).concat(state[i].slice(0, i));
  }
}

function mixColumns(state) {
  for (let i = 0; i < 4; i++) {
    // Duyệt từng cột
    let s0 = state[0][i],
      s1 = state[1][i],
      s2 = state[2][i],
      s3 = state[3][i];

    state[0][i] =
      gfMultiply(s0, 2) ^
      gfMultiply(s1, 3) ^
      gfMultiply(s2, 1) ^
      gfMultiply(s3, 1);
    state[1][i] =
      gfMultiply(s0, 1) ^
      gfMultiply(s1, 2) ^
      gfMultiply(s2, 3) ^
      gfMultiply(s3, 1);
    state[2][i] =
      gfMultiply(s0, 1) ^
      gfMultiply(s1, 1) ^
      gfMultiply(s2, 2) ^
      gfMultiply(s3, 3);
    state[3][i] =
      gfMultiply(s0, 3) ^
      gfMultiply(s1, 1) ^
      gfMultiply(s2, 1) ^
      gfMultiply(s3, 2);
  }
}

function invMixColumns(state) {
  for (let i = 0; i < 4; i++) {
    // Duyệt từng cột
    let s0 = state[0][i],
      s1 = state[1][i],
      s2 = state[2][i],
      s3 = state[3][i];

    state[0][i] =
      gfMultiply(s0, 14) ^
      gfMultiply(s1, 11) ^
      gfMultiply(s2, 13) ^
      gfMultiply(s3, 9);
    state[1][i] =
      gfMultiply(s0, 9) ^
      gfMultiply(s1, 14) ^
      gfMultiply(s2, 11) ^
      gfMultiply(s3, 13);
    state[2][i] =
      gfMultiply(s0, 13) ^
      gfMultiply(s1, 9) ^
      gfMultiply(s2, 14) ^
      gfMultiply(s3, 11);
    state[3][i] =
      gfMultiply(s0, 11) ^
      gfMultiply(s1, 13) ^
      gfMultiply(s2, 9) ^
      gfMultiply(s3, 14);
  }
}

function invShiftRows(state) {
  for (let i = 1; i < 4; i++) {
    // Hàng 0 không thay đổi
    state[i] = state[i].slice(4 - i).concat(state[i].slice(0, 4 - i));
  }
}

function invSubBytes(state) {
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      state[i][j] = INV_SBOX[state[i][j]];
    }
  }
}

export function aesEncrypt(plaintext, key) {
  let keyLength = key.length;
  let Nr = keyLength === 16 ? 10 : keyLength === 24 ? 12 : 14; // Xác định số vòng
  let expandedKey = keyExpansion(key); // Sinh khóa

  let state = toStateMatrix(plaintext);
  addRoundKey(state, expandedKey[0]); // Vòng khởi tạo

  for (let round = 1; round < Nr; round++) {
    subBytes(state);
    shiftRows(state);
    mixColumns(state);
    addRoundKey(state, expandedKey[round]);
  }

  // Vòng cuối không có mixColumns
  subBytes(state);
  shiftRows(state);
  addRoundKey(state, expandedKey[Nr]);

  return state;
}

export function aesDecrypt(ciphertext, key) {
  let keyLength = key.length;
  let Nr = keyLength === 16 ? 10 : keyLength === 24 ? 12 : 14; // Xác định số vòng
  let expandedKey = keyExpansion(key);

  let state = ciphertext; // Giữ nguyên vì đầu vào đã ở dạng ma trận
  addRoundKey(state, expandedKey[Nr]); // Vòng đầu tiên

  for (let round = Nr - 1; round > 0; round--) {
    invShiftRows(state);
    invSubBytes(state);
    addRoundKey(state, expandedKey[round]);
    invMixColumns(state);
  }

  invShiftRows(state);
  invSubBytes(state);
  addRoundKey(state, expandedKey[0]);

  return state;
}