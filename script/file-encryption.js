import { measureAESPerformance} from "../script/aesMode.js";
import { generateAESKey, downloadFile, bytesToText } from "../script/util.js";

document.getElementById("startProgram").addEventListener("click", () => {
    const fileInput = document.getElementById("fileInput");
    const mode = document.querySelector('input[name="mode"]:checked').value;
    const keySize = parseInt(document.querySelector('input[name="keySize"]:checked').value);
    const key = generateAESKey(keySize); // Sinh khóa ngẫu nhiên
    if (fileInput.files.length === 0) {
        alert("Vui lòng chọn một file để mã hóa!");
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function (event) {
        const fileContent = event.target.result; // Nội dung file
        let result = {};

        if (mode === "ECB") {
            result = measureAESPerformance(fileContent, key);
            processEncryptionResult(result, key);
        } else if (mode === "CBC") {
            const iv = generateAESKey(128);
            result = measureAESPerformance(fileContent, key, mode, iv);
            processEncryptionResult(result, key, iv);
        }
    };

    reader.readAsText(file);
});

function processEncryptionResult(result, key, iv = null) {
    const encryptedData = bytesToText(result.ciphertext.flat(Infinity));
    downloadFile(encryptedData, "Encryption.bin");
    const decryptedData = result.decryptedText;
    downloadFile(decryptedData, "Decryption.txt");

    renderOutput(
        btoa(bytesToText(key)),
        result.encryptionTime,
        result.decryptionTime,
        iv ? btoa(bytesToText(iv)) : "N/A"
    );
}

function renderOutput(key, encryptionTime, decryptionTime, iv='N/A'){
    document.getElementById('keyOutput').innerHTML = key;
    document.getElementById('encryptionTime').innerHTML =`${encryptionTime}ms`;
    document.getElementById('decryptionTime').innerHTML =`${decryptionTime}ms`;
    document.getElementById('ivOutput').innerHTML =iv;
}

document.querySelector('#fileInput').addEventListener('change', function () {
    const fileLabel = document.querySelector('.file-label');
    if (this.files.length > 0) {
        fileLabel.classList.add('selected'); // Thêm class khi có file
    } else {
        fileLabel.classList.remove('selected'); // Xóa class khi hủy chọn
    }
});
