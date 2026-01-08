// ================== ELEMENTOS ==================
const form = document.getElementById("form");
const qtdEl = document.getElementById("qtd");
const minEl = document.getElementById("min");
const maxEl = document.getElementById("max");
const noRepeatEl = document.getElementById("noRepeat");

const errorEl = document.getElementById("error");
const resultsGrid = document.getElementById("resultsGrid");
const btnClear = document.getElementById("btnClear");

// ================== HELPERS ==================
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function onlyInt(value) {
  return String(value).replace(/[^\d-]/g, "");
}

function toInt(value) {
  const n = Number(String(value).trim());
  return Number.isFinite(n) ? Math.trunc(n) : NaN;
}

function showError(message) {
  errorEl.textContent = message;
  errorEl.hidden = false;
}

function clearError() {
  errorEl.textContent = "";
  errorEl.hidden = true;
}

function clearResults() {
  resultsGrid.innerHTML = "";
}

// ================== UI ==================
function renderGhost(count) {
  clearResults();

  const limit = Math.min(count, 24);
  for (let i = 0; i < limit; i++) {
    const div = document.createElement("div");
    div.className = "ball ball--ghost";
    div.textContent = "•";
    resultsGrid.appendChild(div);
  }
}

// ================== RANDOM ==================
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ================== VALIDACAO ==================
function validateInputs(qtd, min, max, noRepeat) {
  if ([qtd, min, max].some(Number.isNaN)) {
    return "Preencha todos os campos com números válidos.";
  }

  if (qtd <= 0) return "A quantidade deve ser maior que zero.";
  if (min === max) return "O valor mínimo e máximo não podem ser iguais.";
  if (max < min) return "O valor máximo deve ser maior que o mínimo.";

  if (noRepeat) {
    const range = max - min + 1;
    if (qtd > range) {
      return `Com “Não repetir número”, o máximo é ${range} número(s).`;
    }
  }

  if (qtd > 200) return "Limite máximo: 200 números.";

  return null;
}

// ================== SORTEIO ==================
function drawNumbers(qtd, min, max, noRepeat) {
  if (!noRepeat) {
    return Array.from({ length: qtd }, () => randomInt(min, max));
  }

  const pool = [];
  for (let i = min; i <= max; i++) pool.push(i);

  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return pool.slice(0, qtd);
}

// ================== ANIMACAO ==================
async function animateDraw(numbers) {
  clearResults();

  const limited = Math.min(numbers.length, 48);

  for (let i = 0; i < limited; i++) {
    const div = document.createElement("div");
    div.className = "ball";
    div.textContent = numbers[i];
    resultsGrid.appendChild(div);

    await sleep(70);
  }

  if (numbers.length > limited) {
    const extra = document.createElement("div");
    extra.className = "ball";
    extra.textContent = `+${numbers.length - limited}`;
    resultsGrid.appendChild(extra);
  }
}

// ================== INPUT SOMENTE NUMEROS ==================
[qtdEl, minEl, maxEl].forEach((input) => {
  input.addEventListener("input", () => {
    const raw = input.value;
    const cleaned = onlyInt(raw);

    if (cleaned.includes("-")) {
      const normalized = cleaned.replace(/-/g, "");
      input.value =
        (raw.trim().startsWith("-") ? "-" : "") + normalized;
    } else {
      input.value = cleaned;
    }
  });
});

// ================== EVENTOS ==================
btnClear.addEventListener("click", () => {
  clearError();
  clearResults();
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearError();

  const qtd = toInt(qtdEl.value);
  const min = toInt(minEl.value);
  const max = toInt(maxEl.value);
  const noRepeat = noRepeatEl.checked;

  const error = validateInputs(qtd, min, max, noRepeat);
  if (error) {
    showError(error);
    renderGhost(8);
    return;
  }

  renderGhost(Math.min(qtd, 12));
  await sleep(200);

  const numbers = drawNumbers(qtd, min, max, noRepeat);

  if (noRepeat) numbers.sort((a, b) => a - b);

  await animateDraw(numbers);
});

// ================== ESTADO INICIAL ==================
renderGhost(8);
