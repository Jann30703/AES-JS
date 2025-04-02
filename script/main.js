import {bytesToText, generateAESKeyString, textToBytes} from './util.js'
import { measureAESPerformance } from './aesMode.js';

function getSelectedKeySize() {
    const selectedValue = document.querySelector('input[name="keySize"]:checked').value;
    return selectedValue;
}

function getSelectedMode() {
    const selectedValue = document.querySelector('input[name="mode"]:checked').value;
    console.log(selectedValue);
    return selectedValue;
}

function generateKey(){
    const keySize = getSelectedKeySize();
    const key = generateAESKeyString(keySize);
    document.querySelector('#key').value = key;
    document.getElementById('inputKey').value = key;
}

function renderOutput(result, mode){
    const ciphertext = mode === 'ECB' ? result.ciphertext.flat(Infinity) : result.ciphertext.flat(Infinity).slice(17);
    document.querySelector('#cipherText').value = bytesToText(ciphertext);
    document.querySelector('#decryptedText').value = result.decryptedText;
    document.querySelector('#encryptionTime').value = result.encryptionTime;
    document.querySelector('#decryptionTime').value = result.decryptionTime;
}

function startAES(){
    const plainText= document.querySelector('#plaintext').value;
    if(plainText === ''){
        alert('Văn bản không được để trống !');
        return;   
    }
    const key = document.querySelector('#inputKey').value;
    if (![16, 24, 32].includes(key.length)) {
        alert(`Độ dài khóa phải là 16, 24 hoặc 32 ký tự.
    Độ dài khóa hiện tại: ${key.length}`);
        return;
    }
    
    const mode = getSelectedMode();
    if(mode === 'CBC'){
        const iv = document.querySelector('#iv').value;
        if(iv.length !== 16){
            alert(`Độ dài của iv phải là 16 kí tự
Độ dài hiện tại: ${iv.length}`);
            return;
        }
        const result = measureAESPerformance(plainText,textToBytes(key),mode,textToBytes(iv));
        renderOutput(result, mode);
    }else{
        const result = measureAESPerformance(plainText, textToBytes(key));
        renderOutput(result, mode);
    }
}

document.querySelector('#encrypt').addEventListener('click',startAES);
document.querySelector('#generateKey').addEventListener('click', generateKey);