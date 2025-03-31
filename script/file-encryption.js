import { measureAESPerformance } from "../script/aesMode.js";
import { bytesToText, generateAESKey, downloadFile } from "../script/util.js";

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
      const iv = generateAESKey(128); // Chế độ CBC cần IV
      const result = measureAESPerformance(fileContent, key, iv, mode);
      console.log(result);
      document.getElementById('keyOutput').innerHTML = btoa(bytesToText(key));
      document.getElementById('encryptionTime').innerHTML = result.encryptionTime;
      document.getElementById('decryptionTime').innerHTML = result.decryptionTime;
      document.getElementById('ivOutput').innerHTML = btoa(bytesToText(iv));
      downloadFile(bytesToText(result.ciphertext.flat(Infinity)), "encryption" + ".bin");
      downloadFile(result.decryptedText, "Decryption" + ".txt");
    };

    reader.readAsText(file);
});

