/*
 * =====================================================================
 *  O PAPEL DE A, ω e φ (seção 4 da página)
 * =====================================================================
 *
 *  Compara duas funções:
 *    referência (tracejada):  x(t) = 0,10 · cos(2π · t)
 *    sua curva (azul):        x(t) = A · cos(ω · t + φ)
 *
 *  - A estica a curva na vertical (muda a altura máxima)
 *  - ω muda quantas oscilações cabem no mesmo tempo (T = 2π/ω)
 *  - φ desloca a curva para os lados (muda onde ela começa)
 */

const DURACAO_COMPARACAO = 2;   // o gráfico mostra de t = 0 até t = 2 s
const ESCALA_VERTICAL = 0.16;   // maior valor de x que cabe no gráfico

function desenharComparacao() {
  // Lê os controles
  const A = lerControle("cA");
  const multiploDePi = lerControle("cW");          // ω = multiploDePi · π
  const w = multiploDePi * Math.PI;
  const passoDaFase = lerControle("cPhi");
  const phi = passoDaFase * (Math.PI / 4);

  // Mostra os valores escolhidos
  const nomeOmega = formatar(multiploDePi, 1).replace(",0", "") + "π";
  escrever("ocA", formatar(A));
  escrever("ocW", nomeOmega + " rad/s");
  escrever("ocPhi", NOMES_DAS_FASES[passoDaFase]);
  escrever("cEquacao",
    "x(t) = " + formatar(A) + " · cos(" + nomeOmega + "·t + " + NOMES_DAS_FASES[passoDaFase] + ")");
  escrever("cPeriodo", "Período T = 2π/ω = " + formatar((2 * Math.PI) / w, 2) + " s");

  // As duas funções
  const referencia = (t) => 0.10 * Math.cos(2 * Math.PI * t);
  const minhaCurva = (t) => A * Math.cos(w * t + phi);

  // Desenho
  const { pincel, largura, altura } = prepararTela("comparar");
  const meio = altura / 2;
  const tempoParaPixel = (t) => 10 + ((largura - 20) * t) / DURACAO_COMPARACAO;
  const valorParaPixel = (x) => meio - (x / ESCALA_VERTICAL) * (altura / 2 - 10);

  // Eixo do tempo e marcas de 0,5 em 0,5 segundo
  linha(pincel, 0, meio, largura, meio, cor("--line"));
  for (let t = 0.5; t < DURACAO_COMPARACAO; t += 0.5) {
    const x = tempoParaPixel(t);
    linha(pincel, x, 10, x, altura - 10, cor("--grid"), 1, true);
    texto(pincel, formatar(t, 1) + " s", x + 3, altura - 4, cor("--muted"), 11);
  }

  curva(pincel, referencia, 0, DURACAO_COMPARACAO, tempoParaPixel, valorParaPixel, cor("--muted"), 2, true);
  curva(pincel, minhaCurva, 0, DURACAO_COMPARACAO, tempoParaPixel, valorParaPixel, cor("--accent"), 2.5);
}

// Redesenha sempre que um controle mudar e quando a janela mudar de tamanho
for (const id of ["cA", "cW", "cPhi"]) {
  document.getElementById(id).addEventListener("input", desenharComparacao);
}
window.addEventListener("resize", desenharComparacao);
desenharComparacao();
