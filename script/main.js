import { bytesToText, generateAESKeyString, textToBytes } from './util.js'
import { aesEncryptText, aesDecryptText,aesEncryptCBC ,aesDecryptCBC , measureAESPerformance } from './aesMode.js'

//Lấy giá trị plaintext
function getPlaintext(){
  const plaintext = document.getElementById('plaintext').value;
  return plaintext;
}

//Chọn chế độ AES
function getSelectedAESMode() {
  // Lấy giá trị ban đầu (đã checked sẵn)
  let selectedAESMode = document.querySelector('input[name="mode"]:checked').value;
  return selectedAESMode;
}

//Chọn kích cỡ khóa
function getSelectedKeySize() {
  // Biến lưu giá trị hiện tại
  let selectedKeySize = document.querySelector('input[name="keySize"]:checked').value;
  return selectedKeySize; // Luôn trả về giá trị mới nhất
}

//Tạo khóa
function generateKey(){
  let key = generateAESKeyString(getSelectedKeySize());
  // console.log(key);
  document.getElementById('key').value = `${key}`;
  return key;
}

document.getElementById('generateKey').addEventListener('click', ()=>{
  document.getElementById('inputKey').value = generateKey();
});

//Chạy chương trình
function runProgram(iv = null, mode = 'ECB'){
  const plaintext = getPlaintext();
  const key = document.getElementById('inputKey').value;
  mode = getSelectedAESMode();
  if(mode === 'ECB'){
    const cypherText = aesEncryptText(plaintext, textToBytes(key));
    const text = bytesToText(cypherText.flat(Infinity));
    const decryptedText = aesDecryptText(cypherText, textToBytes(key));
  }
  else if(mode === 'CBC'){
    iv = document.getElementById('iv').value;
    const cypherText = aesEncryptCBC(plaintext, textToBytes(key), iv);
    const text = bytesToText(cypherText.flat(Infinity));
    const decryptedText = aesDecryptCBC(cypherText, textToBytes(key), iv);
  }

  const result = measureAESPerformance(plaintext, textToBytes(key));
  document.getElementById('cipherText').value = bytesToText((result.ciphertext).flat(Infinity));
  document.getElementById('decryptedText').value = result.decryptedText;
  document.getElementById('encryptionTime').value = result.encryptionTime;
  document.getElementById('decryptionTime').value = result.decryptionTime;
  // console.log(`CypherText:${bytesToText((result.ciphertext).flat(Infinity))}`);
}

document.getElementById('encrypt').addEventListener('click',()=>{
  runProgram();
});




