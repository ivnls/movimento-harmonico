/*
 * =====================================================================
 *  PÊNDULO SIMPLES: A APROXIMAÇÃO sen θ ≈ θ (seção 5 da página)
 * =====================================================================
 *
 *  A equação real do pêndulo é:
 *      aceleração angular = −(g / L) · sen θ
 *
 *  Ela não tem uma solução simples com seno e cosseno. Mas, para ângulos
 *  pequenos (em radianos), sen θ ≈ θ. Com essa troca a equação vira a do
 *  MHS, e a solução é:
 *      θ(t) = θ0 · cos(ω · t),   com ω = √(g / L)  e  T = 2π · √(L / g)
 *
 *  Aqui comparamos os dois:
 *    - pêndulo real (azul): calculado passo a passo pelo computador
 *    - pêndulo MHS (laranja, tracejado): fórmula com cosseno
 */

const G = 9.81;   // aceleração da gravidade (m/s²)

// Estado da seção
let anguloInicial = 0;        // θ0 em radianos
let comprimento = 1;          // L em metros
let omegaPendulo = 0;         // ω = √(g/L)
let periodoMHS = 0;           // T pela fórmula do MHS
let periodoReal = 0;          // T medido na simulação real
let tempoPendulo = 0;         // relógio desta seção
let duracaoPendulo = 0;       // quanto tempo o gráfico mostra

// A simulação real é guardada numa lista: um ângulo a cada PASSO segundos
const PASSO = 0.001;
let angulosReais = [];

const penduloRodando = criarBotaoPausa("pPlay");


/* ---------- A física ---------- */

// Ângulo do pêndulo MHS: θ(t) = θ0 · cos(ω·t)
function anguloMHS(t) {
  return anguloInicial * Math.cos(omegaPendulo * t);
}

// Ângulo do pêndulo real: procuramos na lista calculada
function anguloReal(t) {
  const indice = Math.min(Math.round(t / PASSO), angulosReais.length - 1);
  return angulosReais[indice];
}

// Aceleração angular real: −(g/L) · sen θ
function aceleracaoAngular(theta) {
  return -(G / comprimento) * Math.sin(theta);
}

// Calcula o pêndulo real passo a passo (método de Runge-Kutta de 4ª ordem).
// A cada passo pequeno, estimamos como o ângulo e a velocidade angular
// mudam, usando a aceleração −(g/L)·sen θ.
function simularPenduloReal() {
  angulosReais = [];
  let theta = anguloInicial;   // começa no ângulo inicial...
  let w = 0;                   // ...e parado
  periodoReal = 0;

  const numeroDePassos = Math.ceil(duracaoPendulo / PASSO) + 1;
  for (let i = 0; i < numeroDePassos; i++) {
    angulosReais.push(theta);

    // Quatro estimativas da inclinação, combinadas numa média ponderada
    const k1theta = w;
    const k1w = aceleracaoAngular(theta);
    const k2theta = w + (PASSO / 2) * k1w;
    const k2w = aceleracaoAngular(theta + (PASSO / 2) * k1theta);
    const k3theta = w + (PASSO / 2) * k2w;
    const k3w = aceleracaoAngular(theta + (PASSO / 2) * k2theta);
    const k4theta = w + PASSO * k3w;
    const k4w = aceleracaoAngular(theta + PASSO * k3theta);

    const wAnterior = w;
    theta += (PASSO / 6) * (k1theta + 2 * k2theta + 2 * k3theta + k4theta);
    w += (PASSO / 6) * (k1w + 2 * k2w + 2 * k3w + k4w);

    // Medindo o período: o pêndulo sai parado do lado direito. Quando a
    // velocidade volta a zero pela primeira vez, ele está parado do lado
    // esquerdo: passou meio período.
    if (periodoReal === 0 && i > 0 && wAnterior < 0 && w >= 0) {
      periodoReal = 2 * (i + 1) * PASSO;
    }
  }
}


/* ---------- Controles ---------- */

function lerPendulo() {
  const graus = lerControle("pTheta");
  anguloInicial = grausParaRadianos(graus);
  comprimento = lerControle("pL");

  omegaPendulo = Math.sqrt(G / comprimento);
  periodoMHS = (2 * Math.PI) / omegaPendulo;

  // Mostramos três períodos. O real é sempre um pouco maior que o do MHS,
  // então reservamos uma folga de 30%.
  duracaoPendulo = 3 * periodoMHS * 1.3;
  simularPenduloReal();
  tempoPendulo = 0;

  // Quanto sen θ0 é diferente de θ0?
  const seno = Math.sin(anguloInicial);
  const erro = ((anguloInicial - seno) / seno) * 100;

  escrever("opTheta", graus + "°");
  escrever("opL", formatar(comprimento, 1) + " m");
  escrever("pRad", formatar(anguloInicial, 3));
  escrever("pSen", formatar(seno, 3));
  escrever("pErro", formatar(erro, 1) + "%");
  escrever("pTmhs", formatar(periodoMHS, 3) + " s");
  escrever("pTreal", formatar(periodoReal, 3) + " s");
}

for (const id of ["pTheta", "pL"]) {
  document.getElementById(id).addEventListener("input", lerPendulo);
}


/* ---------- Desenho ---------- */

// Desenha um pêndulo pendurado em (pivoX, pivoY)
function desenharUmPendulo(pincel, pivoX, pivoY, tamanho, theta, corDoPendulo, tracejado) {
  // θ é medido a partir da vertical: para a direita é positivo
  const x = pivoX + tamanho * Math.sin(theta);
  const y = pivoY + tamanho * Math.cos(theta);
  linha(pincel, pivoX, pivoY, x, y, corDoPendulo, 2, tracejado);
  bolinha(pincel, x, y, 11, corDoPendulo);
}

function desenharPendulo() {
  if (penduloRodando()) {
    tempoPendulo += 1 / 60;               // cerca de 1/60 s por quadro
    if (tempoPendulo >= duracaoPendulo) { // chegou ao fim: recomeça
      tempoPendulo = 0;
    }
  }
  const thetaReal = anguloReal(tempoPendulo);
  const thetaMHS = anguloMHS(tempoPendulo);

  /* ---------- Os dois pêndulos ---------- */
  {
    const { pincel, largura, altura } = prepararTela("pendulo");
    const pivoX = largura / 2;
    const pivoY = 16;
    // 2 metros (o maior L) ocupam quase toda a altura
    const tamanho = (comprimento / 2) * (altura - 50);

    linha(pincel, pivoX - 40, pivoY, pivoX + 40, pivoY, cor("--muted"), 4);
    linha(pincel, pivoX, pivoY, pivoX, altura - 10, cor("--line"), 1, true);   // vertical
    desenharUmPendulo(pincel, pivoX, pivoY, tamanho, thetaMHS, cor("--orange"), true);
    desenharUmPendulo(pincel, pivoX, pivoY, tamanho, thetaReal, cor("--accent"), false);
    bolinha(pincel, pivoX, pivoY, 4, cor("--text"));
  }

  /* ---------- Gráfico θ(t) em graus ---------- */
  {
    const { pincel, largura, altura } = prepararTela("penduloGrafico");
    const meio = altura / 2;
    const maximo = radianosParaGraus(anguloInicial) * 1.15;
    const tempoParaPixel = (t) => 10 + ((largura - 20) * t) / duracaoPendulo;
    const grausParaPixel = (graus) => meio - (graus / maximo) * (altura / 2 - 20);

    linha(pincel, 0, meio, largura, meio, cor("--line"));
    texto(pincel, "θ (graus) ao longo do tempo", 10, 14, cor("--muted"), 12);

    const realEmGraus = (t) => radianosParaGraus(anguloReal(t));
    const mhsEmGraus = (t) => radianosParaGraus(anguloMHS(t));
    curva(pincel, mhsEmGraus, 0, tempoPendulo, tempoParaPixel, grausParaPixel, cor("--orange"), 2, true);
    curva(pincel, realEmGraus, 0, tempoPendulo, tempoParaPixel, grausParaPixel, cor("--accent"), 2);

    bolinha(pincel, tempoParaPixel(tempoPendulo), grausParaPixel(realEmGraus(tempoPendulo)), 4, cor("--accent"));
    bolinha(pincel, tempoParaPixel(tempoPendulo), grausParaPixel(mhsEmGraus(tempoPendulo)), 4, cor("--orange"));
  }

  requestAnimationFrame(desenharPendulo);
}

lerPendulo();
requestAnimationFrame(desenharPendulo);
