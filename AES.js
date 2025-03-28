import { generateSBox, generateInverseSBox, generateRCON, gfMultiply } from "./box.js";

const SBOX = generateSBox();
const INV_SBOX = generateInverseSBox();
const RCON = generateRCON();

function toStateMatrix(input) {
    let state = [];
    for (let i = 0; i < 4; i++) {
        state[i] = input.slice(i * 4, (i + 1) * 4);
    }
    return state;
}

function subWord(word) {
    return word.map(byte => SBOX[byte]);
}

function rotWord(word) {
    return [word[1], word[2], word[3], word[0]];
}

function keyExpansion(key) {
    let expandedKeys = [];
    let words = [];

    // Chia key thành các từ 4 byte
    for (let i = 0; i < key.length / 4; i++) {
        words[i] = key.slice(i * 4, (i + 1) * 4);
    }

    for (let i = key.length / 4; i < 44; i++) {  // 44 từ cho AES-128
        let temp = words[i - 1];

        if (i % 4 === 0) {
            temp = subWord(rotWord(temp));
            temp = temp.map((byte, j) => byte ^ RCON[i / 4 - 1][j]);
        }

        words[i] = words[i - 4].map((byte, j) => byte ^ temp[j]);
    }

    // Gộp lại thành khóa con
    for (let i = 0; i < 44; i += 4) {
        expandedKeys.push(words.slice(i, i + 4));
    }

    return expandedKeys;
}

function addRoundKey(state, roundKey) {
    for (let i = 0; i < 4; i++) { // 4 cột của ma trận
        for (let j = 0; j < 4; j++) { // 4 hàng của ma trận
            state[j][i] ^= roundKey[i][j]; // XOR từng byte
        }
    }
}

function subBytes(state) {
    for (let i = 0; i < 4; i++) { // Duyệt qua từng cột
        for (let j = 0; j < 4; j++) { // Duyệt qua từng hàng
            state[j][i] = SBOX[state[j][i]]; // Thay thế bằng giá trị từ S-box
        }
    }
}

function shiftRows(state) {
    for (let i = 1; i < 4; i++) { // Hàng 0 không thay đổi
        state[i] = state[i].slice(i).concat(state[i].slice(0, i));
    }
}

function mixColumns(state) {
    for (let i = 0; i < 4; i++) { // Duyệt từng cột
        let s0 = state[0][i], s1 = state[1][i], s2 = state[2][i], s3 = state[3][i];

        state[0][i] = gfMultiply(s0, 2) ^ gfMultiply(s1, 3) ^ gfMultiply(s2, 1) ^ gfMultiply(s3, 1);
        state[1][i] = gfMultiply(s0, 1) ^ gfMultiply(s1, 2) ^ gfMultiply(s2, 3) ^ gfMultiply(s3, 1);
        state[2][i] = gfMultiply(s0, 1) ^ gfMultiply(s1, 1) ^ gfMultiply(s2, 2) ^ gfMultiply(s3, 3);
        state[3][i] = gfMultiply(s0, 3) ^ gfMultiply(s1, 1) ^ gfMultiply(s2, 1) ^ gfMultiply(s3, 2);
    }
}

function invMixColumns(state) {
    for (let i = 0; i < 4; i++) { // Duyệt từng cột
        let s0 = state[0][i], s1 = state[1][i], s2 = state[2][i], s3 = state[3][i];

        state[0][i] = gfMultiply(s0, 14) ^ gfMultiply(s1, 11) ^ gfMultiply(s2, 13) ^ gfMultiply(s3, 9);
        state[1][i] = gfMultiply(s0, 9) ^ gfMultiply(s1, 14) ^ gfMultiply(s2, 11) ^ gfMultiply(s3, 13);
        state[2][i] = gfMultiply(s0, 13) ^ gfMultiply(s1, 9) ^ gfMultiply(s2, 14) ^ gfMultiply(s3, 11);
        state[3][i] = gfMultiply(s0, 11) ^ gfMultiply(s1, 13) ^ gfMultiply(s2, 9) ^ gfMultiply(s3, 14);
    }
}

function invShiftRows(state) {
    for (let i = 1; i < 4; i++) { // Hàng 0 không thay đổi
        state[i] = state[i].slice(4-i).concat(state[i].slice(0, 4-i));
    }
}

function invSubBytes(state) {
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            state[i][j] = INV_SBOX[state[i][j]];
        }
    }
}

function aesEncrypt(plaintext, key) {
    let state = toStateMatrix(plaintext); // Chuyển thành ma trận 4x4
    let roundKeys = keyExpansion(key); // Sinh khóa mở rộng
    let Nr = 10; // Số vòng lặp cho AES-128

    addRoundKey(state, roundKeys[0]); // Bước khởi tạo

    for (let round = 1; round < Nr; round++) {
        subBytes(state);
        shiftRows(state);
        mixColumns(state);
        addRoundKey(state, roundKeys[round]);
    }

    // Vòng cuối cùng không có mixColumns
    subBytes(state);
    shiftRows(state);
    addRoundKey(state, roundKeys[Nr]);

    return state; // Trả về ciphertext dạng ma trận
}

function aesDecrypt(ciphertext, key) {
    let state = ciphertext;
    let roundKeys = keyExpansion(key);
    let Nr = 10; // Số vòng cho AES-128

    addRoundKey(state, roundKeys[Nr]); // Bước khởi tạo (khóa cuối)

    for (let round = Nr - 1; round > 0; round--) {
        invShiftRows(state);
        invSubBytes(state);
        addRoundKey(state, roundKeys[round]);
        invMixColumns(state);
    }

    // Vòng cuối cùng không có invMixColumns
    invShiftRows(state);
    invSubBytes(state);
    addRoundKey(state, roundKeys[0]);

    return state; // Trả về plaintext dạng ma trận
}

// Kiểm thử
let plaintext = [0x32, 0x88, 0x31, 0xE0, 0x43, 0x5A, 0x31, 0x37, 0xF6, 0x30, 0x98, 0x07, 0xA8, 0x8D, 0xA2, 0x34];
let key = [0x2B, 0x7E, 0x15, 0x16, 0x28, 0xAE, 0xD2, 0xA6, 0xAB, 0xF7, 0x12, 0x09, 0xCF, 0xF2, 0x4A, 0xCF];
console.log(toStateMatrix(plaintext))
let ciphertext = aesEncrypt(plaintext, key);
console.log("Ciphertext:", ciphertext);
let decryptedText = aesDecrypt(ciphertext, key);
console.log("Decrypted Text:", decryptedText);







