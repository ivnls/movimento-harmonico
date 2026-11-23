/*
 * =====================================================================
 *  FERRAMENTAS COMUNS
 * =====================================================================
 *  Funções pequenas usadas por todas as partes da página:
 *  escrever números, ler controles e desenhar no <canvas>.
 *  Este arquivo é carregado primeiro, antes dos outros.
 */


/* ---------- Números e textos ---------- */

// Escreve um número com vírgula, como usamos no Brasil (0.25 → "0,25")
function formatar(numero, casasDecimais = 2) {
  // Evita mostrar "-0,00" quando o número é praticamente zero
  if (Math.abs(numero) < 0.5 * Math.pow(10, -casasDecimais)) {
    numero = 0;
  }
  return numero.toFixed(casasDecimais).replace(".", ",");
}

// Converte radianos para graus: graus = radianos · 180 / π
function radianosParaGraus(radianos) {
  return (radianos * 180) / Math.PI;
}

// Converte graus para radianos: radianos = graus · π / 180
function grausParaRadianos(graus) {
  return (graus * Math.PI) / 180;
}

// Deixa um ângulo em graus entre 0° e 360°
function anguloEntre0e360(graus) {
  let resultado = graus % 360;
  if (resultado < 0) resultado += 360;
  return resultado;
}

// Nomes das fases usadas nos controles: cada passo vale π/4 (45°)
const NOMES_DAS_FASES = ["0", "π/4", "π/2", "3π/4", "π", "5π/4", "3π/2", "7π/4", "2π"];


/* ---------- Página ---------- */

// Mostra um texto dentro do elemento da página que tem esse id
function escrever(id, conteudo) {
  document.getElementById(id).textContent = conteudo;
}

// Lê o valor de um controle deslizante como número
function lerControle(id) {
  return Number(document.getElementById(id).value);
}

// Pega uma cor definida no CSS da página (assim os desenhos acompanham o
// tema claro ou escuro do sistema)
function cor(nome) {
  return getComputedStyle(document.documentElement).getPropertyValue(nome).trim();
}

// Cria um botão de pausar / continuar. Devolve uma função que responde
// "está rodando?".
function criarBotaoPausa(id) {
  const botao = document.getElementById(id);
  let rodando = true;
  botao.addEventListener("click", () => {
    rodando = !rodando;
    botao.textContent = rodando ? "Pausar" : "Continuar";
  });
  return () => rodando;
}


/* ---------- Desenho no canvas ---------- */

// Prepara um <canvas> para desenhar: ajusta o tamanho, limpa a tela e
// devolve o "pincel" (contexto), a largura e a altura.
function prepararTela(id) {
  const canvas = document.getElementById(id);

  // Guardamos a altura escrita no HTML só uma vez, porque logo abaixo
  // mudamos o tamanho interno do canvas.
  if (!canvas.dataset.altura) {
    canvas.dataset.altura = canvas.getAttribute("height");
  }
  const largura = canvas.clientWidth;
  const altura = Number(canvas.dataset.altura);

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

function texto(pincel, conteudo, x, y, corDoTexto, tamanho = 13) {
  pincel.fillStyle = corDoTexto;
  pincel.font = tamanho + "px system-ui";
  pincel.fillText(conteudo, x, y);
}

// Desenha uma curva ligando vários pontos.
//   funcao: recebe um número t e devolve o valor da curva
//   paraX, paraY: convertem t e o valor em pixels
function curva(pincel, funcao, tInicial, tFinal, paraX, paraY, corDaCurva, espessura = 2, tracejada = false) {
  const numeroDePontos = 300;
  pincel.strokeStyle = corDaCurva;
  pincel.lineWidth = espessura;
  pincel.setLineDash(tracejada ? [6, 5] : []);
  pincel.beginPath();
  for (let i = 0; i <= numeroDePontos; i++) {
    const t = tInicial + ((tFinal - tInicial) * i) / numeroDePontos;
    const x = paraX(t);
    const y = paraY(funcao(t));
    if (i === 0) {
      pincel.moveTo(x, y);
    } else {
      pincel.lineTo(x, y);
    }
  }
  pincel.stroke();
  pincel.setLineDash([]);
}
