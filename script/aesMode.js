import { padText, unpadText, textToBytes, bytesToText, generateAESKey } from "./util.js";
import { aesEncrypt, aesDecrypt } from "./aesAlgorithm.js";

export function aesEncryptText(plaintext, key) {
  plaintext = padText(plaintext); // Đảm bảo đủ bội số của 16 byte
  let bytes = textToBytes(plaintext);
  let ciphertext = [];

  for (let i = 0; i < bytes.length; i += 16) {
    let block = bytes.slice(i, i + 16);
    ciphertext.push(aesEncrypt(block, key));
  }
  return ciphertext;
}

export function aesDecryptText(ciphertext, key) {
  let decryptedBytes = [];

  for (let i = 0; i < ciphertext.length; i++) {
    let state = aesDecrypt(ciphertext[i], key);
    decryptedBytes.push(...state.flat()); // Chuyển ma trận 4x4 về mảng 1D
  }

  let text = bytesToText(decryptedBytes);
  return unpadText(text);
}

function xorBlocks(block1, block2) {
    return block1.map((byte, i) => byte ^ block2[i]);
}

export function aesEncryptCBC(plaintext, key, iv) {
    plaintext = padText(plaintext);
    let bytes = textToBytes(plaintext);
    let ciphertext = [];
    let prevBlock = iv; // Khối IV ban đầu
  
    for (let i = 0; i < bytes.length; i += 16) {
      let block = bytes.slice(i, i + 16);
      let xoredBlock = xorBlocks(block, prevBlock); // XOR với khối trước đó
      let encryptedBlock = aesEncrypt(xoredBlock, key);
      ciphertext.push(encryptedBlock);
      prevBlock = encryptedBlock; // Cập nhật khối trước cho vòng tiếp theo
    }
  
    return [iv, ...ciphertext]; // Trả về IV + ciphertext để giải mã đúng
}

export function aesDecryptCBC(ciphertext, key) {
    let iv = ciphertext[0]; // Lấy IV từ ciphertext
    let decryptedText = [];
    let prevBlock = iv;

    for (let i = 1; i < ciphertext.length; i++) {
        let decryptedBlock = aesDecrypt(ciphertext[i], key); 
        decryptedBlock = decryptedBlock.flat(); // Phẳng hóa ma trận 4x4

        let xoredBlock = xorBlocks(decryptedBlock, prevBlock); // XOR với khối trước đó
        decryptedText.push(...xoredBlock);
        prevBlock = ciphertext[i]; // Cập nhật khối trước cho vòng lặp tiếp theo
    }

    let text = bytesToText(decryptedText);
    return unpadText(text); // Loại bỏ padding và chuyển về text
}
  
export function measureAESPerformance(plaintext, key) {
    const startEncrypt = performance.now();
    const ciphertext = aesEncryptText(plaintext, key);
    const endEncrypt = performance.now();
    const encryptionTime = (endEncrypt - startEncrypt).toFixed(4);
  
    const startDecrypt = performance.now();
    const decryptedText = aesDecryptText(JSON.parse(JSON.stringify(ciphertext)), key);
    const endDecrypt = performance.now();
    const decryptionTime = (endDecrypt - startDecrypt).toFixed(4);

    return { ciphertext, decryptedText, encryptionTime, decryptionTime };
}

// Mã hóa file
function encryptFile(fileContent, key, iv = null, mode = "ECB") {
  let encryptedData;
  if (mode === "ECB") {
      encryptedData = aesEncryptText(fileContent, key);
  } else if (mode === "CBC") {
      encryptedData = aesEncryptCBC(fileContent, key, iv);
  }
  return encryptedData;
}

// Giải mã file
function decryptFile(encryptedData, key, mode = "ECB") {
  let decryptedData;
  if (mode === "ECB") {
      decryptedData = aesDecryptText(encryptedData, key);
  } else if (mode === "CBC") {
      decryptedData = aesDecryptCBC(encryptedData, key);
  }
  return decryptedData;
}

export { encryptFile, decryptFile };

// console.log(measureAESPerformance('Hello moi nguoi', generateAESKey(128)));
