/*
 * =====================================================================
 *  ENERGIA NO MHS (seção 2 da página)
 * =====================================================================
 *
 *  Usa os mesmos parâmetros e o mesmo tempo do simulador (simulador.js).
 *
 *  Energia potencial elástica:  Ep = ½·k·x²
 *                                  = ½·k·A²·cos²θ
 *
 *  Energia cinética:            Ec = ½·m·v²
 *                                  = ½·m·A²·ω²·sen²θ
 *                                  = ½·k·A²·sen²θ     (porque m·ω² = k)
 *
 *  Somando:  Ep + Ec = ½·k·A²·(cos²θ + sen²θ) = ½·k·A²
 *
 *  A soma não muda com o tempo graças à identidade sen²θ + cos²θ = 1.
 */

function energiaPotencial(t) {
  const x = posicao(t);
  return 0.5 * constanteMola * x * x;
}

function energiaCinetica(t) {
  const v = velocidade(t);
  return 0.5 * massa * v * v;
}

function desenharEnergia() {
  const { pincel, largura, altura } = prepararTela("energia");

  const E = energiaMecanica();
  const Ep = energiaPotencial(tempo);
  const Ec = energiaCinetica(tempo);

  const topo = 44;
  const base = altura - 30;
  const alturaUtil = base - topo;

  // Converte uma energia (em joules) em altura na tela.
  // A energia total E ocupa quase toda a altura do desenho.
  const energiaMaxima = E * 1.1;
  const energiaParaPixel = (energia) => base - (energia / energiaMaxima) * alturaUtil;

  /* ---------- Parte esquerda: três barras ---------- */

  const larguraDasBarras = Math.min(160, largura * 0.32);
  const barras = [
    { nome: "Ep", valor: Ep, corDaBarra: cor("--accent") },
    { nome: "Ec", valor: Ec, corDaBarra: cor("--orange") },
    { nome: "Ep+Ec", valor: Ep + Ec, corDaBarra: cor("--muted") },
  ];
  const espaco = larguraDasBarras / barras.length;

  barras.forEach((barra, i) => {
    const x = i * espaco + 6;
    const y = energiaParaPixel(barra.valor);
    pincel.fillStyle = barra.corDaBarra;
    pincel.fillRect(x, y, espaco - 12, base - y);
    texto(pincel, barra.nome, x, base + 16, cor("--text"), 12);
  });
  linha(pincel, 0, base, larguraDasBarras, base, cor("--line"));

  /* ---------- Parte direita: gráfico das energias no tempo ---------- */

  const inicioDoGrafico = larguraDasBarras + 24;
  const fimDoGrafico = largura - 10;
  const duracaoDoGrafico = 2 * periodo;
  const tempoNoGrafico = tempo % duracaoDoGrafico;
  const tempoParaPixel = (t) => inicioDoGrafico + ((fimDoGrafico - inicioDoGrafico) * t) / duracaoDoGrafico;

  linha(pincel, inicioDoGrafico, base, fimDoGrafico, base, cor("--line"));

  // Energia mecânica: uma linha reta, sempre igual a ½kA²
  linha(pincel, inicioDoGrafico, energiaParaPixel(E), fimDoGrafico, energiaParaPixel(E), cor("--muted"), 2, true);

  // Ep e Ec ao longo do tempo
  curva(pincel, energiaPotencial, 0, tempoNoGrafico, tempoParaPixel, energiaParaPixel, cor("--accent"));
  curva(pincel, energiaCinetica, 0, tempoNoGrafico, tempoParaPixel, energiaParaPixel, cor("--orange"));

  texto(pincel, "Ep = ½kA²·cos²θ", inicioDoGrafico, 14, cor("--accent"), 12);
  texto(pincel, "Ec = ½kA²·sen²θ", inicioDoGrafico, 32, cor("--orange"), 12);

  /* ---------- Os números de agora ---------- */

  const theta = angulo(tempo);
  const cos2 = Math.cos(theta) ** 2;
  const sen2 = Math.sin(theta) ** 2;
  escrever("eCos", formatar(cos2, 3));
  escrever("eSen", formatar(sen2, 3));
  escrever("eSoma", formatar(cos2 + sen2, 3));
  escrever("eEp", formatar(Ep, 3) + " J");
  escrever("eEc", formatar(Ec, 3) + " J");
  escrever("eE", formatar(Ep + Ec, 3) + " J");

  requestAnimationFrame(desenharEnergia);
}

requestAnimationFrame(desenharEnergia);
