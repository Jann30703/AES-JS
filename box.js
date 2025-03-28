export function gfMultiply(a, b) {
    let result = 0;
    while (b > 0) {
        if (b & 1) result ^= a; // Nếu b lẻ, cộng (XOR) a vào kết quả
        a = (a << 1) ^ (a & 0x80 ? 0x1B : 0); // Nếu bit cao nhất của a là 1, XOR với 0x1B (m(x))
        b >>= 1; // Dịch phải b
    }
    return result & 0xFF; // Giữ kết quả trong phạm vi 8 bit
}

function gfInverse(x) {
    if (x === 0) return 0; // 0 không có nghịch đảo
    let y = x;
    for (let i = 1; i < 254; i++) {
        y = gfMultiply(y, x);
    }
    return y;
}

function affineTransform(x) {
    let result = 0;
    for (let i = 0; i < 8; i++) {
        let bit = (x >> i) & 1;
        let rotatedBits = ((x >> ((i + 4) % 8)) & 1) ^
                          ((x >> ((i + 5) % 8)) & 1) ^
                          ((x >> ((i + 6) % 8)) & 1) ^
                          ((x >> ((i + 7) % 8)) & 1);
        let newBit = bit ^ rotatedBits ^ ((0x63 >> i) & 1);
        result |= (newBit << i);
    }
    return result;
}

export function generateSBox() {
    let sBox = new Array(256);
    for (let i = 0; i < 256; i++) {
        let inv = gfInverse(i);
        sBox[i] = affineTransform(inv);
    }
    return sBox;
}

export function generateInverseSBox() {
    let sBox = generateSBox();
    let inverseSBox = new Array(256);
    for (let i = 0; i < 256; i++) {
        inverseSBox[sBox[i]] = i; // Ánh xạ ngược
    }
    return inverseSBox;
}

export function generateRCON(rounds = 10) {
    let rcon = [];
    let rc = 0x01; // RC[1] = 0x01

    for (let i = 0; i < rounds; i++) {
        rcon.push([rc, 0x00, 0x00, 0x00]); // Rcon[j] = (RC[j], 0, 0, 0)
        rc = gfMultiply(rc, 2); // Thay vì dịch bit thủ công, dùng gfMultiply
    }
    return rcon;
}