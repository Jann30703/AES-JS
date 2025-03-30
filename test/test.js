import { encryptFile, decryptFile } from "../script/aesMode.js";
import { textToBytes, generateAESKeyString } from "../script/util.js";

document.getElementById("encryptBtn").addEventListener("click", () => {
    const fileInput = document.getElementById("fileInput");
    const mode = document.querySelector('input[name="mode"]:checked').value;
    const keySize = parseInt(document.querySelector('input[name="keySize"]:checked').value);
    const key = generateAESKeyString(keySize); // Sinh khóa ngẫu nhiên
    console.log(key);
    if (fileInput.files.length === 0) {
        alert("Vui lòng chọn một file để mã hóa!");
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function (event) {
        const fileContent = event.target.result; // Nội dung file
        const iv = textToBytes("MyInitialVector!"); // Chế độ CBC cần IV
        const encryptedData = encryptFile(fileContent, textToBytes(key), iv, mode);
        downloadFile(encryptedData, "encryption" + ".enc");
        const decryptedData = decryptFile(encryptedData, textToBytes(key), mode);
        downloadFile(decryptedData, "Decryption" + ".txt");
    };

    reader.readAsText(file);
});

// Hàm tải file
function downloadFile(content, filename) {
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}
