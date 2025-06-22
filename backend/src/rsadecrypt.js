// Exponenciación modular
function modPow(a, b, m) {
  let result = 1n;
  a = a % m;
  while (b > 0n) {
    if (b % 2n === 1n) {
      result = (result * a) % m;
    }
    a = (a * a) % m;
    b = b / 2n;
  }
  return result;
}

// Descifrado RSA
function decryptRSA(encryptedData, n, d) {
  const nBigInt = BigInt(n);
  const dBigInt = BigInt(d);

  // ✅ Soportar formato string con comas: "102,4549,289,..."
  let encryptedArray;

  if (Array.isArray(encryptedData)) {
    encryptedArray = encryptedData;
  } else if (typeof encryptedData === 'string' && encryptedData.includes(',')) {
    encryptedArray = encryptedData.split(',').map(s => s.trim());
  } else {
    encryptedArray = [encryptedData];
  }

  // Descifrar cada carácter
  const decrypted = encryptedArray.map(numStr => {
    const c = BigInt(numStr);
    return String.fromCharCode(Number(modPow(c, dBigInt, nBigInt)));
  });

  return decrypted.join('');
}

module.exports = { decryptRSA, modPow };
