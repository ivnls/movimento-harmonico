/*
 * =====================================================================
 *  SIMULADOR DE MOVIMENTO HARMÔNICO SIMPLES (MHS)
 * =====================================================================
 *
 *  Este arquivo controla o simulador da página. Ele é dividido em partes:
 *
 *    1. Parâmetros do movimento (A, m, k, φ)
 *    2. A física: as fórmulas trigonométricas do MHS
 *    3. Leitura dos controles deslizantes
 *    4. Desenho do círculo trigonométrico
 *    5. Desenho do sistema massa-mola
 *    6. Desenho dos gráficos x(t), v(t) e a(t)
 *    7. A animação (o "relógio" do simulador)
 *
 *  Ideia central: um ponto gira no círculo trigonométrico com ângulo
 *  θ = ω·t + φ. A projeção (a "sombra") desse ponto no eixo horizontal
 *  vale A·cos(θ). Essa sombra se move exatamente como o bloco da mola.
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
let tempo = 0;

// A animação está rodando ou pausada?
let rodando = true;

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

// Converte radianos para graus: graus = radianos · 180 / π
function radianosParaGraus(radianos) {
  return (radianos * 180) / Math.PI;
}


/* =====================================================================
 *  3. LEITURA DOS CONTROLES DESLIZANTES
 * ===================================================================== */

// O controle da fase vai de 0 a 8. Cada passo vale π/4 (45°).
const NOMES_DAS_FASES = ["0", "π/4", "π/2", "3π/4", "π", "5π/4", "3π/2", "7π/4", "2π"];

// Escreve um número com vírgula, como usamos no Brasil (0.25 → "0,25")
function formatar(numero, casasDecimais = 2) {
  return numero.toFixed(casasDecimais).replace(".", ",");
}

// Mostra um texto dentro do elemento da página que tem esse id
function escrever(id, texto) {
  document.getElementById(id).textContent = texto;
}

// Lê o valor de um controle deslizante como número
function lerControle(id) {
  return Number(document.getElementById(id).value);
}

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
}

// Sempre que um controle mudar, lemos tudo de novo e recomeçamos do t = 0
for (const id of ["A", "m", "k", "phi"]) {
  document.getElementById(id).addEventListener("input", () => {
    lerParametros();
    tempo = 0;
  });
}

// Botão de pausar / continuar
const botao = document.getElementById("play");
botao.addEventListener("click", () => {
  rodando = !rodando;
  botao.textContent = rodando ? "Pausar" : "Continuar";
});


/* =====================================================================
 *  FERRAMENTAS DE DESENHO
 * ===================================================================== */

// Pega uma cor definida no CSS da página (assim o simulador acompanha o
// tema claro ou escuro do sistema)
function cor(nome) {
  return getComputedStyle(document.documentElement).getPropertyValue(nome).trim();
}

// Prepara um <canvas> para desenhar: ajusta o tamanho, limpa a tela e
// devolve o "pincel" (contexto), a largura e a altura.
function prepararTela(id) {
  const canvas = document.getElementById(id);
  const largura = canvas.clientWidth;
  const altura = Number(canvas.getAttribute("height"));

  // Telas de celular têm mais pixels por ponto. Multiplicamos por esse
  // fator para o desenho não ficar borrado.
  const densidade = window.devicePixelRatio || 1;
  canvas.width = Math.round(largura * densidade);
  canvas.height = Math.round(altura * densidade);
  canvas.style.height = altura + "px";

  const pincel = canvas.getContext("2d");
  pincel.scale(densidade, densidade);
  return { pincel, largura, altura };
}

function linha(pincel, x1, y1, x2, y2, corDaLinha, espessura = 1, tracejada = false) {
  pincel.strokeStyle = corDaLinha;
  pincel.lineWidth = espessura;
  pincel.setLineDash(tracejada ? [4, 4] : []);
  pincel.beginPath();
  pincel.moveTo(x1, y1);
  pincel.lineTo(x2, y2);
  pincel.stroke();
  pincel.setLineDash([]);
}

function bolinha(pincel, x, y, raio, corDaBolinha) {
  pincel.fillStyle = corDaBolinha;
  pincel.beginPath();
  pincel.arc(x, y, raio, 0, 2 * Math.PI);
  pincel.fill();
}

function texto(pincel, conteudo, x, y, corDoTexto) {
  pincel.fillStyle = corDoTexto;
  pincel.font = "13px system-ui";
  pincel.fillText(conteudo, x, y);
}

// Quantos pixels valem 1 metro no círculo e na mola. Usamos a mesma escala
// nos dois desenhos para que o bloco fique exatamente embaixo da sombra.
// A amplitude máxima ocupa 42% de 300 pixels.
function pixelsPorMetro() {
  return (300 * 0.42) / AMPLITUDE_MAXIMA;
}


/* =====================================================================
 *  4. DESENHO DO CÍRCULO TRIGONOMÉTRICO
 * ===================================================================== */

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

  // Mostra o ângulo entre 0° e 360°
  let graus = radianosParaGraus(theta) % 360;
  if (graus < 0) graus += 360;
  texto(pincel, "θ = " + graus.toFixed(0) + "°", 8, 18, cor("--text"));
  texto(pincel, "x = A·cos θ = " + formatar(posicao(tempo), 3) + " m", 8, 36, cor("--text"));
}


/* =====================================================================
 *  5. DESENHO DO SISTEMA MASSA-MOLA
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
 *  6. DESENHO DOS GRÁFICOS x(t), v(t) e a(t)
 * ===================================================================== */

function desenharGraficos() {
  const { pincel, largura, altura } = prepararTela("graph");

  const margemEsquerda = 44;
  const margemDireita = 10;
  const larguraUtil = largura - margemEsquerda - margemDireita;

  // O gráfico mostra 2 períodos. Depois disso, ele recomeça do início.
  const duracaoDoGrafico = 2 * periodo;
  const tempoNoGrafico = tempo % duracaoDoGrafico;

  // Os três gráficos. "valorMaximo" define a escala vertical de cada um.
  const graficos = [
    {
      titulo: "x(t) = A·cos(ωt+φ)",
      funcao: posicao,
      valorMaximo: AMPLITUDE_MAXIMA,
      corDaCurva: cor("--accent"),
    },
    {
      titulo: "v(t) = −Aω·sen(ωt+φ)",
      funcao: velocidade,
      valorMaximo: amplitude * omega * 1.15,          // v máxima = A·ω
      corDaCurva: cor("--orange"),
    },
    {
      titulo: "a(t) = −Aω²·cos(ωt+φ)",
      funcao: aceleracao,
      valorMaximo: amplitude * omega * omega * 1.15,  // a máxima = A·ω²
      corDaCurva: cor("--red"),
    },
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

    // Eixo do tempo (valor zero)
    linha(pincel, margemEsquerda, linhaDoZero, largura - margemDireita, linhaDoZero, cor("--grid"));

    // Linhas tracejadas em t = T e t = 2T
    for (let n = 1; n <= 2; n++) {
      const x = tempoParaPixel(n * periodo);
      linha(pincel, x, topo, x, base, cor("--grid"), 1, true);
    }

    texto(pincel, grafico.titulo, margemEsquerda, topo - 4, cor("--muted"));

    // Desenha a curva ligando 300 pontos, do t = 0 até o tempo atual
    const numeroDePontos = 300;
    pincel.strokeStyle = grafico.corDaCurva;
    pincel.lineWidth = 2;
    pincel.beginPath();
    for (let i = 0; i <= numeroDePontos; i++) {
      const t = (tempoNoGrafico * i) / numeroDePontos;
      const x = tempoParaPixel(t);
      const y = valorParaPixel(grafico.funcao(t));
      if (i === 0) {
        pincel.moveTo(x, y);
      } else {
        pincel.lineTo(x, y);
      }
    }
    pincel.stroke();

    // Bolinha marcando o instante atual
    bolinha(
      pincel,
      tempoParaPixel(tempoNoGrafico),
      valorParaPixel(grafico.funcao(tempoNoGrafico)),
      4,
      grafico.corDaCurva
    );
  });
}


/* =====================================================================
 *  7. A ANIMAÇÃO
 * ===================================================================== */

// O navegador chama a função "quadro" cerca de 60 vezes por segundo.
// A cada chamada, avançamos o tempo e redesenhamos tudo.
let instanteAnterior = null;

function quadro(instanteAtual) {
  // instanteAtual vem em milissegundos. Calculamos quanto tempo passou
  // desde o quadro anterior e convertemos para segundos.
  if (instanteAnterior !== null && rodando) {
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
