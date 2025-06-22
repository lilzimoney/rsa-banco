const fs = require('fs');
const path = require('path');

// === Función para verificar si un número es primo ===
function isPrime(n) {
  if (n < 2n) return false;
  if (n === 2n || n === 3n) return true;
  if (n % 2n === 0n || n % 3n === 0n) return false;
  for (let i = 5n; i * i <= n; i += 6n) {
    if (n % i === 0n || n % (i + 2n) === 0n) return false;
  }
  return true;
}

function generarPrimo(bits = 8) {
  while (true) {
    const num = BigInt(Math.floor(Math.random() * (2 ** bits)));
    if (isPrime(num)) return num;
  }
}

function extendedGCD(a, b) {
  if (a === 0n) return [b, 0n, 1n];
  const [g, y, x] = extendedGCD(b % a, a);
  return [g, x - (b / a) * y, y];
}

function modInverse(e, phi) {
  const [g, x] = extendedGCD(e, phi);
  if (g !== 1n) throw new Error("No tiene inverso modular");
  return (x % phi + phi) % phi;
}

// === Generar claves ===
function generarClaves(bits = 8) {
  let p = generarPrimo(bits);
  let q = generarPrimo(bits);
  while (q === p) q = generarPrimo(bits);

  const n = p * q;
  const phi = (p - 1n) * (q - 1n);
  let e = 3n;
  while (phi % e === 0n) e += 2n;

  const d = modInverse(e, phi);
  return { n, e, d };
}

// === Generar y guardar claves en archivos ===
function generarYGuardarClaves(bits = 8) {
  const { n, e, d } = generarClaves(bits);
  const dir = path.join(__dirname, 'keys');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'public.txt'), `${n},${e}`);
  fs.writeFileSync(path.join(dir, 'private.txt'), `${n},${d}`);
  console.log(`[+] Public Key (n, e): (${n}, ${e})`);
  console.log(`[+] Private Key (n, d): (${n}, ${d})`);
  return { n, e, d };
}

// Exporta ambas funciones
module.exports = {
  generarClaves,
  generarYGuardarClaves
};
