import { measureAESPerformance } from "../script/aesMode.js";
import { bytesToText, generateAESKey, downloadFile } from "../script/util.js";

function renderOutput(id, data){
  document.getElementById(id).innerHTML = data;
}

document.getElementById("startProgram").addEventListener("click", () => {
    const fileInput = document.getElementById("fileInput");
    const mode = document.querySelector('input[name="mode"]:checked').value;
    const keySize = parseInt(document.querySelector('input[name="keySize"]:checked').value);
    const key = generateAESKey(keySize); // Sinh khóa ngẫu nhiên
    console.log(key);
    if (fileInput.files.length === 0) {
        alert("Vui lòng chọn một file để mã hóa!");
        return;
    }
    
    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function (event) {
      const fileContent = event.target.result; // Nội dung file
      let result = {};
      // console.log(fileContent);

      if(mode === 'ECB'){
        result = measureAESPerformance(fileContent, key);
        handleOutput(result,key);
      }
      else if(mode === 'CBC'){
        const iv = generateAESKey(128); // Chế độ CBC cần IV
        result = measureAESPerformance(fileContent, key, iv, mode);
        handleOutput(result, key, iv);
      }
    };
    reader.readAsText(file);
  });
  
  function handleOutput(result, key, iv = null){
    renderOutput('keyOutput', btoa(bytesToText(key)));
    renderOutput('encryptionTime', result.encryptionTime);
    renderOutput('decryptionTime', result.decryptionTime);
    renderOutput('ivOutput',iv ? btoa(bytesToText(iv)) : "N/A");
    downloadFile(bytesToText(result.ciphertext.flat(Infinity)), "encryption.bin");
    downloadFile(result.decryptedText, "Decryption.txt");
  }
