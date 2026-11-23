# Movimento Harmônico Simples: aplicação em Python

**Site com simulador interativo:** https://ivnls.github.io/movimento-harmonico/

**Software:** Python 3 com as bibliotecas NumPy (cálculo) e Matplotlib (gráficos e animação).
Também roda no Google Colab, sem instalar nada: cole o código de `mhs.py` numa célula.

## Situação-problema
Um bloco de **0,5 kg** está preso a uma mola de constante **k = 50 N/m**. Ele é puxado
**10 cm** da posição de equilíbrio e solto. Como o bloco se move?

## Onde entra a trigonometria
| Grandeza | Fórmula |
|---|---|
| Posição | x(t) = A·cos(ωt + φ) |
| Velocidade | v(t) = −A·ω·sen(ωt + φ) |
| Aceleração | a(t) = −A·ω²·cos(ωt + φ) = −ω²·x |
| Frequência angular | ω = √(k/m) = 10 rad/s |
| Período | T = 2π/ω ≈ 0,628 s |

## Roteiro de apresentação (uma figura por etapa)
1. **Animação (`img/animacao_mhs.gif`)**: um ponto gira no **círculo trigonométrico** com ângulo θ = ωt.
   A "sombra" dele no eixo horizontal é **A·cos θ**, e ela se move igual ao bloco da mola.
   *O MHS é a projeção de um movimento circular uniforme.*
2. **Fig. 1**: os gráficos de x, v e a. A posição é um cosseno e a velocidade é um seno
   (defasada de π/2). A aceleração tem sempre o sinal oposto ao da posição.
3. **Tabela no terminal**: valores em t = 0, T/4, T/2, 3T/4 e T, que correspondem aos ângulos
   notáveis 0, π/2, π, 3π/2 e 2π do círculo trigonométrico.
4. **Fig. 2**: a energia. Ep = ½kA²·cos² e Ec = ½kA²·sen². A soma é constante porque
   **sen²θ + cos²θ = 1** (identidade fundamental da trigonometria).
5. **Fig. 3**: o que A, ω e φ mudam no gráfico: amplitude, rapidez de oscilação e deslocamento horizontal.
6. **Fig. 4**: no pêndulo, a equação real usa **sen θ**. O MHS usa a aproximação **sen θ ≈ θ**
   (com θ em radianos). Com 10° as duas curvas coincidem. Com 60° o erro é de cerca de 21%
   e as curvas se separam. Essa comparação usa uma solução numérica (Runge-Kutta).

## Resultados obtidos
- ω = 10 rad/s, T ≈ 0,628 s, f ≈ 1,59 Hz
- v_máx = A·ω = 1 m/s, a_máx = A·ω² = 10 m/s², E = 0,25 J
- Pêndulo de 1 m: T = 2π√(L/g) ≈ 2,006 s

## Como executar
```bash
pip install numpy matplotlib pillow
python mhs.py
```
As figuras são salvas na pasta `img/`. Para testar outros casos, mude `m`, `k`, `A` e `phi` no início do código.

## Estrutura
- `mhs.py`: código em Python que gera as figuras e a animação
- `img/`: figuras e animação geradas
- `index.html`: página do GitHub Pages, com um simulador interativo em JavaScript
