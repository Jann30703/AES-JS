//Phép nhân Galois
export function gfMultiply(a, b) {
    let result = 0;
    while (b > 0) {
        if (b & 1) result ^= a; // Nếu b lẻ, cộng (XOR) a vào kết quả
        a = (a << 1) ^ (a & 0x80 ? 0x1B : 0); // Nếu bit cao nhất của a là 1, XOR với 0x1B (m(x))
        b >>= 1; // Dịch phải b
    }
    return result & 0xFF; // Giữ kết quả trong phạm vi 8 bit
}

//Hàm chuyển mảng 1D -> 2D 
export function toStateMatrix(input) {
    let state = [];
    for (let i = 0; i < 4; i++) {
        state[i] = input.slice(i * 4, (i + 1) * 4);
    }
    return state;
}

// Hàm chuyển đổi giữa giữa Text <=> Bytes
export function textToBytes(text) {
    let bytes = [];
    for (let i = 0; i < text.length; i++) {
        bytes.push(text.charCodeAt(i));
    }
    return bytes;
}

export function bytesToText(bytes) {
    return bytes.map(byte => String.fromCharCode(byte)).join('');
}

//Hàm padding và unpadding 
export function padText(text) {
    let padLength = 16 - (text.length % 16);
    return text + String.fromCharCode(padLength).repeat(padLength);
}

export function unpadText(text) {
    let padLength = text.charCodeAt(text.length - 1);
    return text.slice(0, -padLength);
}

//Sinh khóa ngẫu nhiên
export function generateAESKey(bits) {
    const byteLength = bits / 8; // 128-bit => 16 byte, 192-bit => 24 byte, 256-bit => 32 byte
    const key = new Uint8Array(byteLength);
  
    // Sinh khóa ngẫu nhiên
    crypto.getRandomValues(key);
  
    return Array.from(key); // Trả về mảng các byte
}

export function generateAESKeyString(bits) {
    const charSet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*()-_=+";
    const keyLength = bits / 8; // 128-bit => 16 ký tự, 192-bit => 24 ký tự, 256-bit => 32 ký tự
    let key = "";

    for (let i = 0; i < keyLength; i++) {
        key += charSet[Math.floor(Math.random() * charSet.length)];
    }

    return key; // Trả về chuỗi khóa ngẫu nhiên
}

//Download file
export function downloadFile(content, filename) {
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}