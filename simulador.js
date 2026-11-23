/*
 * =====================================================================
 *  SIMULADOR DO SISTEMA MASSA-MOLA (seção 1 da página)
 * =====================================================================
 *
 *  Partes deste arquivo:
 *    1. Parâmetros do movimento (A, m, k, φ)
 *    2. A física: as fórmulas trigonométricas do MHS
 *    3. Leitura dos controles deslizantes
 *    4. Tabela dos ângulos notáveis
 *    5. Desenho do círculo trigonométrico
 *    6. Desenho do sistema massa-mola
 *    7. Desenho dos gráficos x(t), v(t) e a(t)
 *    8. A animação (o "relógio" do simulador)
 *
 *  Ideia central: um ponto gira no círculo trigonométrico com ângulo
 *  θ = ω·t + φ. A projeção (a "sombra") desse ponto no eixo horizontal
 *  vale A·cos(θ). Essa sombra se move exatamente como o bloco da mola.
 *
 *  As funções formatar, escrever, linha, bolinha etc. estão em comum.js.
 */


/* =====================================================================
 *  1. PARÂMETROS DO MOVIMENTO
 * ===================================================================== */

// Valores atuais dos parâmetros. Eles mudam quando o usuário mexe nos
// controles deslizantes (veja a parte 3).
let amplitude = 0.10;      // A: maior distância do equilíbrio, em metros
let massa = 0.5;           // m: massa do bloco, em kg
let constanteMola = 50;    // k: "dureza" da mola, em N/m
let faseInicial = 0;       // φ: ângulo de partida, em radianos

// Valores calculados a partir dos parâmetros acima
let omega = 0;             // ω: frequência angular, em rad/s
let periodo = 0;           // T: tempo de uma oscilação completa, em s

// Tempo da simulação, em segundos. Começa em zero e vai aumentando.
// A seção de energia (energia.js) também usa este tempo.
let tempo = 0;

// Maior amplitude permitida no controle deslizante. Usamos esse valor para
// decidir a escala do desenho, assim ele nunca sai da tela.
const AMPLITUDE_MAXIMA = 0.15;

// A animação roda em câmera lenta (metade da velocidade real) para ficar
// mais fácil de acompanhar o movimento.
const VELOCIDADE_DA_ANIMACAO = 0.5;


/* =====================================================================
 *  2. A FÍSICA: FÓRMULAS TRIGONOMÉTRICAS DO MHS
 * ===================================================================== */

// Frequência angular: ω = √(k / m)
function calcularOmega(k, m) {
  return Math.sqrt(k / m);
}

// Período: T = 2π / ω
function calcularPeriodo(w) {
  return (2 * Math.PI) / w;
}

// Ângulo no círculo trigonométrico no instante t: θ = ω·t + φ
function angulo(t) {
  return omega * t + faseInicial;
}

// Posição: x(t) = A · cos(ω·t + φ)
function posicao(t) {
  return amplitude * Math.cos(angulo(t));
}

// Velocidade: v(t) = −A · ω · sen(ω·t + φ)
// (é a derivada da posição: a derivada de cos é −sen)
function velocidade(t) {
  return -amplitude * omega * Math.sin(angulo(t));
}

// Aceleração: a(t) = −A · ω² · cos(ω·t + φ)
// Repare que isso é igual a −ω² · x(t): a aceleração sempre aponta
// para o lado contrário da posição, puxando o bloco de volta ao centro.
function aceleracao(t) {
  return -amplitude * omega * omega * Math.cos(angulo(t));
}

// Energia mecânica: E = ½ · k · A²
// Ela é constante porque Ep + Ec = ½kA²·(cos²θ + sen²θ) = ½kA² · 1
function energiaMecanica() {
  return 0.5 * constanteMola * amplitude * amplitude;
}


/* =====================================================================
 *  3. LEITURA DOS CONTROLES DESLIZANTES
 * ===================================================================== */

function lerParametros() {
  // Lê os valores escolhidos pelo usuário
  amplitude = lerControle("A");
  massa = lerControle("m");
  constanteMola = lerControle("k");
  const passoDaFase = lerControle("phi");
  faseInicial = passoDaFase * (Math.PI / 4);

  // Recalcula ω e T com os novos valores
  omega = calcularOmega(constanteMola, massa);
  periodo = calcularPeriodo(omega);

  // Mostra os valores escolhidos ao lado de cada controle
  escrever("oA", formatar(amplitude));
  escrever("om", formatar(massa, 1));
  escrever("ok", constanteMola);
  escrever("ophi", NOMES_DAS_FASES[passoDaFase]);

  // Mostra os resultados calculados nos quadrinhos
  escrever("sw", formatar(omega) + " rad/s");
  escrever("sT", formatar(periodo, 3) + " s");
  escrever("sf", formatar(1 / periodo) + " Hz");
  escrever("sv", formatar(amplitude * omega) + " m/s");
  escrever("sE", formatar(energiaMecanica(), 3) + " J");

  atualizarTabela();
}

// Sempre que um controle mudar, lemos tudo de novo e recomeçamos do t = 0
for (const id of ["A", "m", "k", "phi"]) {
  document.getElementById(id).addEventListener("input", () => {
    lerParametros();
    tempo = 0;
  });
}

const simuladorRodando = criarBotaoPausa("play");


/* =====================================================================
 *  4. TABELA DOS ÂNGULOS NOTÁVEIS
 * =====================================================================
 *  Calcula x, v e a nos instantes 0, T/4, T/2, 3T/4 e T.
 *  A cada quarto de período, o ponto anda 90° no círculo.
 */

function atualizarTabela() {
  const nomesDosInstantes = ["0", "T/4", "T/2", "3T/4", "T"];
  let linhas = "<tr><th>t</th><th>t (s)</th><th>θ = ωt + φ</th><th>x (m)</th><th>v (m/s)</th><th>a (m/s²)</th></tr>";

  for (let n = 0; n <= 4; n++) {
    const t = (n * periodo) / 4;
    const graus = anguloEntre0e360(radianosParaGraus(angulo(t)));
    linhas +=
      "<tr>" +
      "<td>" + nomesDosInstantes[n] + "</td>" +
      "<td>" + formatar(t, 3) + "</td>" +
      "<td>" + graus.toFixed(0) + "°</td>" +
      "<td>" + formatar(posicao(t), 3) + "</td>" +
      "<td>" + formatar(velocidade(t), 3) + "</td>" +
      "<td>" + formatar(aceleracao(t), 2) + "</td>" +
      "</tr>";
  }
  document.getElementById("tabela").innerHTML = linhas;
}


/* =====================================================================
 *  5. DESENHO DO CÍRCULO TRIGONOMÉTRICO
 * ===================================================================== */

// Quantos pixels valem 1 metro no círculo e na mola. Usamos a mesma escala
// nos dois desenhos para que o bloco fique exatamente embaixo da sombra.
// A amplitude máxima ocupa 42% de 300 pixels.
function pixelsPorMetro() {
  return (300 * 0.42) / AMPLITUDE_MAXIMA;
}

function desenharCirculo() {
  const { pincel, largura, altura } = prepararTela("circle");

  // Centro do círculo no meio da tela
  const centroX = largura / 2;
  const centroY = altura / 2;
  const raio = amplitude * pixelsPorMetro();

  // Eixos horizontal (cosseno) e vertical (seno)
  linha(pincel, 0, centroY, largura, centroY, cor("--line"));
  linha(pincel, centroX, 0, centroX, altura, cor("--line"));

  // O círculo de raio A
  pincel.strokeStyle = cor("--muted");
  pincel.lineWidth = 2;
  pincel.beginPath();
  pincel.arc(centroX, centroY, raio, 0, 2 * Math.PI);
  pincel.stroke();

  // Posição do ponto no círculo:
  //   horizontal = A · cos θ
  //   vertical   = A · sen θ
  // (no canvas o eixo y cresce para baixo, por isso usamos o sinal de menos)
  const theta = angulo(tempo);
  const pontoX = centroX + raio * Math.cos(theta);
  const pontoY = centroY - raio * Math.sin(theta);

  // Raio do centro até o ponto
  linha(pincel, centroX, centroY, pontoX, pontoY, cor("--purple"), 2);

  // Linha tracejada do ponto até sua sombra no eixo horizontal
  linha(pincel, pontoX, pontoY, pontoX, centroY, cor("--muted"), 1, true);

  // O ponto girando (roxo) e a sua sombra (azul), que faz o MHS
  bolinha(pincel, pontoX, pontoY, 7, cor("--purple"));
  bolinha(pincel, pontoX, centroY, 7, cor("--accent"));

  const graus = anguloEntre0e360(radianosParaGraus(theta));
  texto(pincel, "θ = " + graus.toFixed(0) + "°", 8, 18, cor("--text"));
  texto(pincel, "x = A·cos θ = " + formatar(posicao(tempo), 3) + " m", 8, 36, cor("--text"));
}


/* =====================================================================
 *  6. DESENHO DO SISTEMA MASSA-MOLA
 * ===================================================================== */

function desenharMola() {
  const { pincel, largura, altura } = prepararTela("spring");

  const centroX = largura / 2;   // posição de equilíbrio (x = 0)
  const centroY = altura / 2;
  const larguraParede = 10;
  const tamanhoBloco = 26;

  // Onde o bloco está agora: o equilíbrio mais a posição x(t) em pixels
  const blocoX = centroX + posicao(tempo) * pixelsPorMetro();

  // Parede à esquerda
  pincel.fillStyle = cor("--muted");
  pincel.fillRect(0, 10, larguraParede, altura - 20);

  // Mola em zigue-zague, da parede até a lateral do bloco
  const inicio = larguraParede;
  const fim = blocoX - tamanhoBloco / 2;
  const numeroDeDentes = 16;
  pincel.strokeStyle = cor("--muted");
  pincel.lineWidth = 1.5;
  pincel.beginPath();
  pincel.moveTo(inicio, centroY);
  for (let i = 1; i < numeroDeDentes; i++) {
    const x = inicio + ((fim - inicio) * i) / numeroDeDentes;
    const y = i % 2 === 1 ? centroY - 10 : centroY + 10;   // alterna cima e baixo
    pincel.lineTo(x, y);
  }
  pincel.lineTo(fim, centroY);
  pincel.stroke();

  // O bloco
  pincel.fillStyle = cor("--accent");
  pincel.fillRect(blocoX - tamanhoBloco / 2, centroY - tamanhoBloco / 2, tamanhoBloco, tamanhoBloco);

  // Linha tracejada marcando a posição de equilíbrio
  linha(pincel, centroX, 4, centroX, altura - 4, cor("--line"), 1, true);
}


/* =====================================================================
 *  7. DESENHO DOS GRÁFICOS x(t), v(t) e a(t)
 * ===================================================================== */

function desenharGraficos() {
  const { pincel, largura, altura } = prepararTela("graph");

  const margemEsquerda = 10;
  const margemDireita = 10;
  const larguraUtil = largura - margemEsquerda - margemDireita;

  // O gráfico mostra 2 períodos. Depois disso, ele recomeça do início.
  const duracaoDoGrafico = 2 * periodo;
  const tempoNoGrafico = tempo % duracaoDoGrafico;

  // Os três gráficos. "valorMaximo" define a escala vertical de cada um.
  const graficos = [
    { titulo: "x(t) = A·cos(ωt+φ)", funcao: posicao, valorMaximo: AMPLITUDE_MAXIMA, corDaCurva: cor("--accent") },
    { titulo: "v(t) = −Aω·sen(ωt+φ)", funcao: velocidade, valorMaximo: amplitude * omega * 1.15, corDaCurva: cor("--orange") },
    { titulo: "a(t) = −Aω²·cos(ωt+φ)", funcao: aceleracao, valorMaximo: amplitude * omega * omega * 1.15, corDaCurva: cor("--red") },
  ];

  const alturaDeCadaGrafico = altura / graficos.length;

  graficos.forEach((grafico, indice) => {
    // Faixa vertical da tela reservada para este gráfico
    const topo = indice * alturaDeCadaGrafico + 18;
    const base = (indice + 1) * alturaDeCadaGrafico - 6;
    const linhaDoZero = (topo + base) / 2;
    const metadeDaAltura = (base - topo) / 2;

    // Converte um tempo t em coordenada horizontal (pixels)
    const tempoParaPixel = (t) => margemEsquerda + (larguraUtil * t) / duracaoDoGrafico;

    // Converte um valor (posição, velocidade...) em coordenada vertical
    const valorParaPixel = (valor) => linhaDoZero - (valor / grafico.valorMaximo) * metadeDaAltura;

    // Eixo do tempo (valor zero) e linhas tracejadas em t = T e t = 2T
    linha(pincel, margemEsquerda, linhaDoZero, largura - margemDireita, linhaDoZero, cor("--grid"));
    for (let n = 1; n <= 2; n++) {
      const x = tempoParaPixel(n * periodo);
      linha(pincel, x, topo, x, base, cor("--grid"), 1, true);
    }

    texto(pincel, grafico.titulo, margemEsquerda, topo - 4, cor("--muted"), 12);

    // A curva vai do t = 0 até o tempo atual
    curva(pincel, grafico.funcao, 0, tempoNoGrafico, tempoParaPixel, valorParaPixel, grafico.corDaCurva);

    // Bolinha marcando o instante atual
    bolinha(pincel, tempoParaPixel(tempoNoGrafico), valorParaPixel(grafico.funcao(tempoNoGrafico)), 4, grafico.corDaCurva);
  });
}


/* =====================================================================
 *  8. A ANIMAÇÃO
 * ===================================================================== */

// O navegador chama a função "quadro" cerca de 60 vezes por segundo.
// A cada chamada, avançamos o tempo e redesenhamos tudo.
let instanteAnterior = null;

function quadro(instanteAtual) {
  // instanteAtual vem em milissegundos. Calculamos quanto tempo passou
  // desde o quadro anterior e convertemos para segundos.
  if (instanteAnterior !== null && simuladorRodando()) {
    let passou = (instanteAtual - instanteAnterior) / 1000;

    // Se a aba ficou escondida, "passou" pode ser enorme. Limitamos o salto.
    passou = Math.min(passou, 0.05);

    tempo += passou * VELOCIDADE_DA_ANIMACAO;
  }
  instanteAnterior = instanteAtual;

  desenharCirculo();
  desenharMola();
  desenharGraficos();

  // Pede ao navegador para chamar "quadro" de novo no próximo quadro
  requestAnimationFrame(quadro);
}

// Começo: lê os valores iniciais e dispara a animação
lerParametros();
requestAnimationFrame(quadro);
