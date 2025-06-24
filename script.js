const temas = {
  simbolos: [
    { nome: "sol", simbolo: "☀️" },
    { nome: "sol", simbolo: "☀️" },
    { nome: "lua", simbolo: "🌙" },
    { nome: "lua", simbolo: "🌙" },
    { nome: "estrela", simbolo: "⭐" },
    { nome: "estrela", simbolo: "⭐" },
    { nome: "coração", simbolo: "❤️" },
    { nome: "coração", simbolo: "❤️" },
    { nome: "flor", simbolo: "🌸" },
    { nome: "flor", simbolo: "🌸" },
    { nome: "raio", simbolo: "⚡" },
    { nome: "raio", simbolo: "⚡" },
  ],
  letras: [
    { nome: "A", simbolo: "A" },
    { nome: "A", simbolo: "A" },
    { nome: "B", simbolo: "B" },
    { nome: "B", simbolo: "B" },
    { nome: "C", simbolo: "C" },
    { nome: "C", simbolo: "C" },
    { nome: "D", simbolo: "D" },
    { nome: "D", simbolo: "D" },
    { nome: "E", simbolo: "E" },
    { nome: "E", simbolo: "E" },
    { nome: "F", simbolo: "F" },
    { nome: "F", simbolo: "F" },
  ],
  numeros: [
    { nome: "1", simbolo: "1" },
    { nome: "1", simbolo: "1" },
    { nome: "2", simbolo: "2" },
    { nome: "2", simbolo: "2" },
    { nome: "3", simbolo: "3" },
    { nome: "3", simbolo: "3" },
    { nome: "4", simbolo: "4" },
    { nome: "4", simbolo: "4" },
    { nome: "5", simbolo: "5" },
    { nome: "5", simbolo: "5" },
    { nome: "6", simbolo: "6" },
    { nome: "6", simbolo: "6" },
  ],
};

const board = document.getElementById("game-board");
const status = document.getElementById("status");
const temporizadorEl = document.getElementById("temporizador");
const vezJogadorEl = document.getElementById("vezJogador");
const placarEl = document.getElementById("placar");
const placar1El = document.getElementById("placar1");
const placar2El = document.getElementById("placar2");
const btnIniciar = document.getElementById("btn-iniciar");
const btnReiniciar = document.getElementById("btn-reiniciar");
const selectTema = document.getElementById("tema");
const selectModo = document.getElementById("modo");
const rankingEl = document.getElementById("ranking");

let cartasAtuais = [];
let cartaSelecionada = null;
let travar = false;
let paresEncontrados = 0;

let modoMultiplayer = false;
let jogadorAtual = 1;
let placar = { 1: 0, 2: 0 };

let timer = null;
let tempoInicio = null;
let jogoAtivo = false;

function embaralhar(array) {
  return array.sort(() => 0.5 - Math.random());
}

function criarTabuleiro() {
  if (!jogoAtivo) jogoAtivo = true;

  board.innerHTML = "";
  paresEncontrados = 0;
  cartaSelecionada = null;
  travar = false;
  status.textContent = "";
  placar1El.textContent = "0";
  placar2El.textContent = "0";
  placar = { 1: 0, 2: 0 };
  jogadorAtual = 1;

  modoMultiplayer = selectModo.value === "2";

  vezJogadorEl.classList.toggle("hidden", !modoMultiplayer);
  placarEl.classList.toggle("hidden", !modoMultiplayer);
  btnReiniciar.classList.remove("hidden");
  btnIniciar.disabled = true;
  selectTema.disabled = true;
  selectModo.disabled = true;

  vezJogadorEl.textContent = `Vez do Jogador ${jogadorAtual}`;
  placar1El.textContent = placar[1];
  placar2El.textContent = placar[2];

  cartasAtuais = embaralhar([...temas[selectTema.value]]);

  cartasAtuais.forEach((carta) => {
    const div = document.createElement("div");
    div.classList.add("carta");
    div.dataset.nome = carta.nome;
    div.setAttribute("tabindex", "0");
    div.setAttribute("role", "button");
    div.setAttribute("aria-label", "Carta para combinar");

    const inner = document.createElement("div");
    inner.classList.add("carta-inner");

    const front = document.createElement("div");
    front.classList.add("carta-front");
    front.textContent = "❓";

    const back = document.createElement("div");
    back.classList.add("carta-back");
    back.textContent = carta.simbolo;

    inner.appendChild(front);
    inner.appendChild(back);
    div.appendChild(inner);

    div.addEventListener("click", () => virarCarta(div));
    div.addEventListener("keydown", (e) => {
      if ((e.key === "Enter" || e.key === " ") && jogoAtivo) {
        e.preventDefault();
        virarCarta(div);
      }
    });

    board.appendChild(div);
  });

  iniciarTemporizador();
  falar("Vamos jogar! Encontre os pares correspondentes.");
}

function virarCarta(div) {
  if (!jogoAtivo) return;
  if (travar || div.classList.contains("virada") || div.classList.contains("certa")) return;

  div.classList.add("virada");

  if (!cartaSelecionada) {
    cartaSelecionada = div;
    return;
  }

  if (div.dataset.nome === cartaSelecionada.dataset.nome) {
    div.classList.add("certa");
    cartaSelecionada.classList.add("certa");

    cartaSelecionada = null;
    paresEncontrados++;

    if (modoMultiplayer) {
      placar[jogadorAtual]++;
      placar1El.textContent = placar[1];
      placar2El.textContent = placar[2];
      falar(`Muito bem! Jogador ${jogadorAtual} acertou um par!`);
      status.textContent = `Jogador ${jogadorAtual} acertou um par!`;
    } else {
      falar("Muito bem! Você encontrou um par!");
      status.textContent = `Pares encontrados: ${paresEncontrados} / ${cartasAtuais.length / 2}`;
    }

    if (paresEncontrados === cartasAtuais.length / 2) {
      pararTemporizador();
      jogoAtivo = false;

      if (modoMultiplayer) {
        let msg;
        if (placar[1] > placar[2]) {
          msg = "Parabéns Jogador 1, você venceu!";
        } else if (placar[2] > placar[1]) {
          msg = "Parabéns Jogador 2, você venceu!";
        } else {
          msg = "Empate! Parabéns aos dois!";
        }
        falar(msg);
        status.textContent = msg;
      } else {
        salvarRanking(Math.floor(tempoDecorrido()));
        const msg = `Parabéns! Você completou o jogo em ${Math.floor(tempoDecorrido())} segundos!`;
        falar(msg);
        status.textContent = msg;
        mostrarRanking();
      }

      btnIniciar.disabled = false;
      selectTema.disabled = false;
      selectModo.disabled = false;
    }
  } else {
    travar = true;
    div.classList.add("errada");
    cartaSelecionada.classList.add("errada");

    falar("Ops! Tente novamente.");
    status.textContent = "Tente novamente!";

    if (modoMultiplayer) {
      jogadorAtual = jogadorAtual === 1 ? 2 : 1;
      vezJogadorEl.textContent = `Vez do Jogador ${jogadorAtual}`;
    }

    setTimeout(() => {
      div.classList.remove("virada", "errada");
      cartaSelecionada.classList.remove("virada", "errada");
      cartaSelecionada = null;
      travar = false;
      status.textContent = "";
    }, 1000);
  }
}

function falar(texto) {
  const synth = window.speechSynthesis;
  if (synth.speaking) synth.cancel();

  const msg = new SpeechSynthesisUtterance(texto);
  const vozes = synth.getVoices();

  let vozDivertida = vozes.find((v) =>
    v.lang.startsWith("pt") &&
    (v.name.toLowerCase().includes("child") ||
      v.name.toLowerCase().includes("zira") ||
      v.name.toLowerCase().includes("helena") ||
      v.name.toLowerCase().includes("female"))
  );

  if (!vozDivertida) {
    vozDivertida = vozes.find((v) => v.lang.startsWith("pt"));
  }

  if (vozDivertida) {
    msg.voice = vozDivertida;
    msg.lang = vozDivertida.lang;
  } else {
    msg.lang = "pt-BR";
  }

  msg.pitch = 1.5;
  msg.rate = 0.9;

  synth.speak(msg);
}

function iniciarTemporizador() {
  tempoInicio = Date.now();
  temporizadorEl.textContent = "Tempo: 0s";

  if (timer) clearInterval(timer);

  timer = setInterval(() => {
    const segundos = Math.floor((Date.now() - tempoInicio) / 1000);
    temporizadorEl.textContent = `Tempo: ${segundos}s`;
  }, 1000);
}

function pararTemporizador() {
  clearInterval(timer);
}

function tempoDecorrido() {
  return (Date.now() - tempoInicio) / 1000;
}

function salvarRanking(tempo) {
  let ranking = JSON.parse(localStorage.getItem("rankingMemoria")) || [];
  ranking.push(tempo);
  ranking.sort((a, b) => a - b);
  if (ranking.length > 5) ranking = ranking.slice(0, 5);
  localStorage.setItem("rankingMemoria", JSON.stringify(ranking));
}

function mostrarRanking() {
  let ranking = JSON.parse(localStorage.getItem("rankingMemoria")) || [];
  rankingEl.innerHTML = "";
  ranking.forEach((tempo, i) => {
    const li = document.createElement("li");
    li.textContent = `${i + 1}º - ${tempo.toFixed(1)} segundos`;
    rankingEl.appendChild(li);
  });
}

btnIniciar.addEventListener("click", criarTabuleiro);
btnReiniciar.addEventListener("click", () => {
  btnIniciar.disabled = false;
  selectTema.disabled = false;
  selectModo.disabled = false;
  btnReiniciar.classList.add("hidden");
  board.innerHTML = "";
  status.textContent = "";
  temporizadorEl.textContent = "Tempo: 0s";
  vezJogadorEl.classList.add("hidden");
  placarEl.classList.add("hidden");
  jogoAtivo = false;
  placar = { 1: 0, 2: 0 };
  paresEncontrados = 0;
  cartaSelecionada = null;
  travar = false;
  pararTemporizador();
  mostrarRanking();
});

window.onload = () => {
  mostrarRanking();
};
