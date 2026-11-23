"""
=====================================================================
 APLICAÇÃO: MOVIMENTO HARMÔNICO SIMPLES (MHS) com TRIGONOMETRIA
 Software: Python 3 + NumPy + Matplotlib
=====================================================================

Situação-problema (sistema massa-mola):
  Um bloco de massa m = 0,5 kg está preso a uma mola de constante
  k = 50 N/m. O bloco é puxado A = 0,10 m da posição de equilíbrio
  e solto do repouso. Descrever o movimento.

Modelo trigonométrico:
  x(t) = A·cos(ω·t + φ)            (posição)
  v(t) = -A·ω·sen(ω·t + φ)         (velocidade)
  a(t) = -A·ω²·cos(ω·t + φ) = -ω²·x (aceleração)

  ω = √(k/m)   T = 2π/ω   f = 1/T

Para rodar:
  pip install numpy matplotlib pillow
  python mhs.py
"""

import os
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation, PillowWriter

os.makedirs("img", exist_ok=True)  # pasta onde as figuras são salvas

# ------------------------------------------------------------------
# 1) Parâmetros do problema
# ------------------------------------------------------------------
m = 0.5      # massa (kg)
k = 50.0     # constante elástica (N/m)
A = 0.10     # amplitude (m)
phi = 0.0    # fase inicial (rad) -> solto do repouso em x = +A

w = np.sqrt(k / m)   # frequência angular (rad/s)
T = 2 * np.pi / w    # período (s)
f = 1 / T            # frequência (Hz)

print("=" * 55)
print(" MOVIMENTO HARMÔNICO SIMPLES - SISTEMA MASSA-MOLA")
print("=" * 55)
print(f" Frequência angular  ω = √(k/m) = {w:.3f} rad/s")
print(f" Período             T = 2π/ω   = {T:.4f} s")
print(f" Frequência          f = 1/T    = {f:.4f} Hz")
print(f" Velocidade máxima   v = A·ω    = {A*w:.3f} m/s")
print(f" Aceleração máxima   a = A·ω²   = {A*w**2:.3f} m/s²")
print(f" Energia mecânica    E = kA²/2  = {k*A**2/2:.4f} J")
print()

# ------------------------------------------------------------------
# 2) Funções trigonométricas do MHS
# ------------------------------------------------------------------
def x(t): return A * np.cos(w * t + phi)
def v(t): return -A * w * np.sin(w * t + phi)
def a(t): return -A * w**2 * np.cos(w * t + phi)

# Tabela de valores em instantes notáveis (frações do período)
print(" Tabela em instantes notáveis:")
print(f" {'t':>10} | {'ângulo ωt':>10} | {'x (m)':>8} | {'v (m/s)':>8} | {'a (m/s²)':>9}")
print(" " + "-" * 56)
for frac, nome in [(0, "0"), (0.25, "T/4"), (0.5, "T/2"), (0.75, "3T/4"), (1, "T")]:
    t = frac * T
    ang = ["0", "π/2", "π", "3π/2", "2π"][int(frac * 4)]
    print(f" {nome:>10} | {ang:>10} | {x(t):8.3f} | {v(t):8.3f} | {a(t):9.3f}")
print()

t = np.linspace(0, 2 * T, 1000)
plt.rcParams.update({"figure.dpi": 110, "axes.grid": True, "grid.alpha": 0.3})

# ------------------------------------------------------------------
# FIGURA 1: posição, velocidade e aceleração
# ------------------------------------------------------------------
fig, ax = plt.subplots(3, 1, figsize=(9, 8), sharex=True)
ax[0].plot(t, x(t), color="tab:blue", lw=2)
ax[0].set_ylabel("x (m)")
ax[0].set_title("x(t) = A·cos(ωt + φ)")
ax[1].plot(t, v(t), color="tab:orange", lw=2)
ax[1].set_ylabel("v (m/s)")
ax[1].set_title("v(t) = −Aω·sen(ωt + φ)")
ax[2].plot(t, a(t), color="tab:red", lw=2)
ax[2].set_ylabel("a (m/s²)")
ax[2].set_title("a(t) = −Aω²·cos(ωt + φ)")
ax[2].set_xlabel("tempo (s)")
for axis in ax:
    for n in range(1, 3):
        axis.axvline(n * T, color="gray", ls="--", lw=1)
ax[0].text(T, A * 0.75, "  T", color="gray")
fig.suptitle(f"MHS massa-mola: m={m} kg, k={k:.0f} N/m, A={A} m  →  T={T:.3f} s",
             fontweight="bold")
fig.tight_layout()
fig.savefig("img/fig1_posicao_velocidade_aceleracao.png")

# ------------------------------------------------------------------
# FIGURA 2: energia (identidade sen² + cos² = 1)
# ------------------------------------------------------------------
Ep = 0.5 * k * x(t) ** 2      # energia potencial = kA²/2 · cos²
Ec = 0.5 * m * v(t) ** 2      # energia cinética  = kA²/2 · sen²
Em = Ep + Ec                  # soma = kA²/2 · (sen² + cos²) = constante

fig, axis = plt.subplots(figsize=(9, 4.5))
axis.plot(t, Ep, label="Potencial  Ep = ½kA²·cos²(ωt)", lw=2)
axis.plot(t, Ec, label="Cinética   Ec = ½kA²·sen²(ωt)", lw=2)
axis.plot(t, Em, "k--", label="Mecânica  Ep + Ec = ½kA² (constante)", lw=2)
axis.set_xlabel("tempo (s)")
axis.set_ylabel("Energia (J)")
axis.set_title("Conservação de energia: consequência de sen²θ + cos²θ = 1",
               fontweight="bold")
axis.legend(loc="center right")
fig.tight_layout()
fig.savefig("img/fig2_energia.png")

# ------------------------------------------------------------------
# FIGURA 3: efeito de cada parâmetro (A, ω, φ) no gráfico
# ------------------------------------------------------------------
tt = np.linspace(0, 2, 800)
fig, ax = plt.subplots(1, 3, figsize=(14, 4), sharey=True)
for amp in [0.05, 0.10, 0.15]:
    ax[0].plot(tt, amp * np.cos(2 * np.pi * tt), label=f"A = {amp}")
ax[0].set_title("Amplitude A (altura da onda)")
for omega in [np.pi, 2 * np.pi, 4 * np.pi]:
    ax[1].plot(tt, 0.1 * np.cos(omega * tt), label=f"ω = {omega/np.pi:.0f}π rad/s")
ax[1].set_title("Frequência angular ω (rapidez)")
for fase, nome in [(0, "0"), (np.pi / 2, "π/2"), (np.pi, "π")]:
    ax[2].plot(tt, 0.1 * np.cos(2 * np.pi * tt + fase), label=f"φ = {nome}")
ax[2].set_title("Fase inicial φ (deslocamento)")
for axis in ax:
    axis.legend(fontsize=8, loc="lower left")
    axis.set_xlabel("tempo (s)")
ax[0].set_ylabel("x (m)")
fig.suptitle("x(t) = A·cos(ωt + φ): o papel de cada parâmetro", fontweight="bold")
fig.tight_layout()
fig.savefig("img/fig3_parametros.png")

# ------------------------------------------------------------------
# FIGURA 4: pêndulo simples e a aproximação sen θ ≈ θ
#   Equação real:      θ'' = -(g/L)·sen θ   (resolvida numericamente)
#   Aproximação MHS:   θ(t) = θ0·cos(√(g/L)·t)
# ------------------------------------------------------------------
g, L = 9.81, 1.0
w_p = np.sqrt(g / L)

def pendulo_numerico(theta0, t_final, dt=1e-4):
    """Runge-Kutta de 4ª ordem para θ'' = -(g/L) sen θ."""
    n = int(t_final / dt)
    th, om = theta0, 0.0
    ts, ths = np.zeros(n), np.zeros(n)
    acc = lambda th: -(g / L) * np.sin(th)
    for i in range(n):
        ts[i], ths[i] = i * dt, th
        k1t, k1w = om, acc(th)
        k2t, k2w = om + dt/2*k1w, acc(th + dt/2*k1t)
        k3t, k3w = om + dt/2*k2w, acc(th + dt/2*k2t)
        k4t, k4w = om + dt*k3w, acc(th + dt*k3t)
        th += dt/6 * (k1t + 2*k2t + 2*k3t + k4t)
        om += dt/6 * (k1w + 2*k2w + 2*k3w + k4w)
    return ts, ths

fig, ax = plt.subplots(1, 2, figsize=(13, 4.5))
for axis, graus in zip(ax, [10, 60]):
    th0 = np.radians(graus)
    ts, ths = pendulo_numerico(th0, 8)
    axis.plot(ts, np.degrees(ths), lw=2, label="Real: θ'' = −(g/L)·sen θ")
    axis.plot(ts, np.degrees(th0 * np.cos(w_p * ts)), "--", lw=2,
              label="MHS: θ0·cos(√(g/L)·t)")
    axis.set_title(f"Amplitude inicial θ0 = {graus}°   (sen θ0 = {np.sin(th0):.3f}, θ0 = {th0:.3f} rad)")
    axis.set_xlabel("tempo (s)")
    axis.set_ylabel("θ (graus)")
    axis.set_ylim(-1.15 * graus, 1.5 * graus)
    axis.legend(loc="upper center", fontsize=9, ncol=2)
fig.suptitle("Pêndulo simples (L = 1 m): a aproximação sen θ ≈ θ só vale para ângulos pequenos",
             fontweight="bold")
fig.tight_layout()
fig.savefig("img/fig4_pendulo.png")

print(" Pêndulo simples (L = 1 m):")
print(f"   Período pelo MHS: T = 2π√(L/g) = {2*np.pi/w_p:.4f} s")
print("   Comparação sen θ x θ (rad):")
for graus in [5, 10, 20, 30, 45, 60]:
    r = np.radians(graus)
    print(f"     {graus:>3}°: θ = {r:.4f}  sen θ = {np.sin(r):.4f}  erro = {100*(r-np.sin(r))/np.sin(r):.2f}%")
print()

# ------------------------------------------------------------------
# ANIMAÇÃO: MHS como projeção do movimento circular uniforme
#   Um ponto gira no círculo trigonométrico com velocidade angular ω.
#   Sua sombra no eixo horizontal (cosseno) faz exatamente o MHS.
# ------------------------------------------------------------------
fig = plt.figure(figsize=(11, 6.5))
ax_c = fig.add_axes([0.05, 0.38, 0.35, 0.57])   # círculo
ax_g = fig.add_axes([0.48, 0.38, 0.48, 0.57])   # gráfico x(t)
ax_m = fig.add_axes([0.05, 0.05, 0.35, 0.25])   # mola

R = A
ax_c.set_xlim(-1.4 * R, 1.4 * R); ax_c.set_ylim(-1.4 * R, 1.4 * R)
ax_c.set_aspect("equal")
ax_c.set_title("Círculo trigonométrico (ângulo θ = ωt)")
ang = np.linspace(0, 2 * np.pi, 200)
ax_c.plot(R * np.cos(ang), R * np.sin(ang), color="lightgray", lw=2)
ax_c.axhline(0, color="k", lw=0.8); ax_c.axvline(0, color="k", lw=0.8)
raio, = ax_c.plot([], [], color="tab:purple", lw=2)
ponto, = ax_c.plot([], [], "o", color="tab:purple", ms=10)
sombra, = ax_c.plot([], [], "o", color="tab:blue", ms=10)
proj, = ax_c.plot([], [], ":", color="gray")
txt = ax_c.text(-1.35 * R, 1.2 * R, "", fontsize=10)

ax_g.set_xlim(0, 2 * T); ax_g.set_ylim(-1.3 * A, 1.3 * A)
ax_g.set_title("x(t) = A·cos(ωt)  — a sombra do ponto")
ax_g.set_xlabel("tempo (s)"); ax_g.set_ylabel("x (m)")
curva, = ax_g.plot([], [], color="tab:blue", lw=2)

ax_m.set_xlim(-1.4 * R - 0.08, 1.4 * R); ax_m.set_ylim(-0.04, 0.04)
ax_m.set_yticks([]); ax_m.set_title("Sistema massa-mola equivalente")
ax_m.axvline(-1.4 * R - 0.08, color="k", lw=6)
mola, = ax_m.plot([], [], color="gray", lw=1.5)
bloco, = ax_m.plot([], [], "s", color="tab:blue", ms=22)
ax_m.axvline(0, color="k", ls="--", lw=0.8)

frames = 120
t_anim = np.linspace(0, 2 * T, frames)

def atualizar(i):
    ti = t_anim[i]
    th = w * ti
    cx, cy = R * np.cos(th), R * np.sin(th)
    raio.set_data([0, cx], [0, cy])
    ponto.set_data([cx], [cy])
    sombra.set_data([cx], [0])
    proj.set_data([cx, cx], [cy, 0])
    txt.set_text(f"θ = {np.degrees(th) % 360:5.0f}°\nx = A·cos θ = {cx:+.3f} m")
    curva.set_data(t_anim[: i + 1], x(t_anim[: i + 1]))
    # mola em zigue-zague da parede até o bloco
    x0 = -1.4 * R - 0.08
    xs = np.linspace(x0, cx - 0.012, 40)
    ys = 0.012 * np.sign(np.sin(np.linspace(0, 12 * np.pi, 40)))
    ys[0] = ys[-1] = 0
    mola.set_data(xs, ys)
    bloco.set_data([cx], [0])
    return raio, ponto, sombra, proj, txt, curva, mola, bloco

anim = FuncAnimation(fig, atualizar, frames=frames, interval=50, blit=True)
anim.save("img/animacao_mhs.gif", writer=PillowWriter(fps=20))

print(" Arquivos gerados:")
for nome in ["fig1_posicao_velocidade_aceleracao.png", "fig2_energia.png",
             "fig3_parametros.png", "fig4_pendulo.png", "animacao_mhs.gif"]:
    print("   - img/" + nome)

plt.show()
