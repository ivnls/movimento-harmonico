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
 *
 *  Quando você muda os controles, o movimento NÃO recomeça: os dois
 *  pêndulos continuam de onde estavam, já com os novos valores.
 */

const G = 9.81;            // aceleração da gravidade (m/s²)
const PASSO = 0.001;       // passo da simulação real, em segundos
const JANELA_GRAFICO = 8;  // o gráfico mostra os últimos 8 segundos

// Parâmetros escolhidos nos controles
let anguloInicial = grausParaRadianos(10);   // θ0, em radianos
let comprimento = 1;                         // L, em metros

// Estado do pêndulo real: ângulo e velocidade angular
let thetaReal = anguloInicial;
let velocidadeAngularReal = 0;

// Estado do pêndulo MHS. Em vez de usar θ0·cos(ω·t) direto, guardamos o
// ângulo de dentro do cosseno ("faseMHS") e somamos ω·Δt a cada quadro.
// Assim, se ω mudar, a curva continua sem dar saltos.
let faseMHS = 0;

// Relógio desta seção e histórico de pontos para o gráfico
let tempoPendulo = 0;
let historico = [];   // lista de { t, real, mhs } (ângulos em radianos)

const penduloRodando = criarBotaoPausa("pPlay");


/* =====================================================================
 *  A FÍSICA
 * ===================================================================== */

// ω do MHS: √(g / L)
function omegaDoPendulo() {
  return Math.sqrt(G / comprimento);
}

// Ângulo do pêndulo MHS: θ0 · cos(fase)
function anguloMHS() {
  return anguloInicial * Math.cos(faseMHS);
}

// Aceleração angular real: −(g/L) · sen θ
function aceleracaoAngular(theta) {
  return -(G / comprimento) * Math.sin(theta);
}

// Avança um pêndulo real por um passo pequeno (método de Runge-Kutta de
// 4ª ordem). Recebe o ângulo e a velocidade angular de agora e devolve
// os valores depois do passo.
function passoRungeKutta(theta, w, dt) {
  // Quatro estimativas de como θ e w mudam, combinadas numa média ponderada
  const k1theta = w;
  const k1w = aceleracaoAngular(theta);
  const k2theta = w + (dt / 2) * k1w;
  const k2w = aceleracaoAngular(theta + (dt / 2) * k1theta);
  const k3theta = w + (dt / 2) * k2w;
  const k3w = aceleracaoAngular(theta + (dt / 2) * k2theta);
  const k4theta = w + dt * k3w;
  const k4w = aceleracaoAngular(theta + dt * k3theta);

  return {
    theta: theta + (dt / 6) * (k1theta + 2 * k2theta + 2 * k3theta + k4theta),
    w: w + (dt / 6) * (k1w + 2 * k2w + 2 * k3w + k4w),
  };
}

// Mede o período real: soltamos um pêndulo de teste parado em θ0 e
// simulamos até ele parar do outro lado (velocidade volta a zero).
// Esse tempo é meio período.
function medirPeriodoReal() {
  let theta = anguloInicial;
  let w = 0;
  let t = 0;
  while (true) {
    const novo = passoRungeKutta(theta, w, PASSO);
    t += PASSO;
    if (w < 0 && novo.w >= 0) {   // a velocidade trocou de sinal: parou
      return 2 * t;
    }
    theta = novo.theta;
    w = novo.w;
  }
}


/* =====================================================================
 *  CONTROLES
 * ===================================================================== */

function lerPendulo() {
  const graus = lerControle("pTheta");
  const novoAngulo = grausParaRadianos(graus);

  // Se o ângulo inicial mudou, mudamos o tamanho do balanço do pêndulo
  // real na mesma proporção, sem reiniciar o movimento.
  const proporcao = novoAngulo / anguloInicial;
  thetaReal *= proporcao;
  velocidadeAngularReal *= proporcao;

  anguloInicial = novoAngulo;
  comprimento = lerControle("pL");

  // Quanto sen θ0 é diferente de θ0?
  const seno = Math.sin(anguloInicial);
  const erro = ((anguloInicial - seno) / seno) * 100;
  const periodoMHS = (2 * Math.PI) / omegaDoPendulo();

  escrever("opTheta", graus + "°");
  escrever("opL", formatar(comprimento, 1) + " m");
  escrever("pRad", formatar(anguloInicial, 3));
  escrever("pSen", formatar(seno, 3));
  escrever("pErro", formatar(erro, 1) + "%");
  escrever("pTmhs", formatar(periodoMHS, 3) + " s");
  escrever("pTreal", formatar(medirPeriodoReal(), 3) + " s");
}

for (const id of ["pTheta", "pL"]) {
  document.getElementById(id).addEventListener("input", lerPendulo);
}


/* =====================================================================
 *  AVANÇAR O TEMPO
 * ===================================================================== */

function avancar(tempoQuePassou) {
  // Dividimos o tempo em passos pequenos de 0,001 s
  const numeroDePassos = Math.round(tempoQuePassou / PASSO);
  const dt = numeroDePassos * PASSO;

  // Pêndulo real: um passo de Runge-Kutta de cada vez
  for (let i = 0; i < numeroDePassos; i++) {
    const novo = passoRungeKutta(thetaReal, velocidadeAngularReal, PASSO);
    thetaReal = novo.theta;
    velocidadeAngularReal = novo.w;
  }

  // Pêndulo MHS: o ângulo do cosseno anda ω · Δt
  faseMHS += omegaDoPendulo() * dt;

  tempoPendulo += dt;

  // Guarda o ponto no histórico e apaga os pontos que saíram da janela
  historico.push({ t: tempoPendulo, real: thetaReal, mhs: anguloMHS() });
  while (historico[0].t < tempoPendulo - JANELA_GRAFICO) {
    historico.shift();
  }
}


/* =====================================================================
 *  DESENHO
 * ===================================================================== */

// Desenha um pêndulo pendurado em (pivoX, pivoY)
function desenharUmPendulo(pincel, pivoX, pivoY, tamanho, theta, corDoPendulo, tracejado) {
  // θ é medido a partir da vertical: para a direita é positivo
  const x = pivoX + tamanho * Math.sin(theta);
  const y = pivoY + tamanho * Math.cos(theta);
  linha(pincel, pivoX, pivoY, x, y, corDoPendulo, 2, tracejado);
  bolinha(pincel, x, y, 11, corDoPendulo);
}

function desenharPendulos() {
  const { pincel, largura, altura } = prepararTela("pendulo");
  const pivoX = largura / 2;
  const pivoY = 16;
  // O maior fio (2 m) ocupa quase toda a altura do desenho
  const tamanho = (comprimento / 2) * (altura - 40);

  linha(pincel, pivoX - 40, pivoY, pivoX + 40, pivoY, cor("--muted"), 4);
  linha(pincel, pivoX, pivoY, pivoX, altura - 10, cor("--line"), 1, true);   // vertical
  desenharUmPendulo(pincel, pivoX, pivoY, tamanho, anguloMHS(), cor("--orange"), true);
  desenharUmPendulo(pincel, pivoX, pivoY, tamanho, thetaReal, cor("--accent"), false);
  bolinha(pincel, pivoX, pivoY, 4, cor("--text"));
}

function desenharGraficoPendulo() {
  const { pincel, largura, altura } = prepararTela("penduloGrafico");
  const meio = altura / 2;

  // Escala vertical: o maior ângulo que aparece no histórico, com folga
  let maiorAngulo = radianosParaGraus(anguloInicial);
  for (const ponto of historico) {
    maiorAngulo = Math.max(maiorAngulo, Math.abs(radianosParaGraus(ponto.real)), Math.abs(radianosParaGraus(ponto.mhs)));
  }
  const escala = maiorAngulo * 1.15;

  // O gráfico "anda": a borda direita é sempre o instante atual
  const inicioDaJanela = Math.max(0, tempoPendulo - JANELA_GRAFICO);
  const tempoParaPixel = (t) => 10 + ((largura - 20) * (t - inicioDaJanela)) / JANELA_GRAFICO;
  const grausParaPixel = (graus) => meio - (graus / escala) * (altura / 2 - 20);

  linha(pincel, 0, meio, largura, meio, cor("--line"));
  texto(pincel, "θ (graus) nos últimos 8 segundos", 10, 14, cor("--muted"), 12);

  // Liga os pontos do histórico: primeiro o MHS, depois o real por cima
  const series = [
    { campo: "mhs", corDaCurva: cor("--orange"), tracejada: true },
    { campo: "real", corDaCurva: cor("--accent"), tracejada: false },
  ];
  for (const serie of series) {
    pincel.strokeStyle = serie.corDaCurva;
    pincel.lineWidth = 2;
    pincel.setLineDash(serie.tracejada ? [6, 5] : []);
    pincel.beginPath();
    historico.forEach((ponto, i) => {
      const x = tempoParaPixel(ponto.t);
      const y = grausParaPixel(radianosParaGraus(ponto[serie.campo]));
      if (i === 0) {
        pincel.moveTo(x, y);
      } else {
        pincel.lineTo(x, y);
      }
    });
    pincel.stroke();
    pincel.setLineDash([]);
  }
}


/* =====================================================================
 *  ANIMAÇÃO
 * ===================================================================== */

let instanteAnteriorPendulo = null;

function quadroPendulo(instanteAtual) {
  if (instanteAnteriorPendulo !== null && penduloRodando()) {
    // Tempo real que passou desde o último quadro (no máximo 0,05 s)
    const passou = Math.min((instanteAtual - instanteAnteriorPendulo) / 1000, 0.05);
    avancar(passou);
  }
  instanteAnteriorPendulo = instanteAtual;

  desenharPendulos();
  desenharGraficoPendulo();
  requestAnimationFrame(quadroPendulo);
}

lerPendulo();
historico.push({ t: 0, real: thetaReal, mhs: anguloMHS() });
requestAnimationFrame(quadroPendulo);
