# 🎮 Game Hub

**20 mini-games in one mobile app**

![PWA](https://img.shields.io/badge/PWA-Ready-brightgreen)
![Mobile](https://img.shields.io/badge/Mobile-Ready-blue)
![Games](https://img.shields.io/badge/Games-20-orange)

## 📱 Instalación

### Opción 1: Navegador Web
1. Clona el repositorio: `git clone <repo-url>`
2. Ejecuta: `python3 app_runner.py`
3. Abre `http://localhost:8000`

### Opción 2: PWA (Instalar como app)
1. Abre el enlace en Chrome/Edge móvil
2. Selecciona "Añadir a pantalla de inicio"
3. Se instalará como app nativa sin barra del navegador

### Opción 3: APK con Capacitor
```bash
npm install -g @capacitor/cli
npx cap init
npx cap add android
npx cap build android
```

## 🎮 Juegos Disponibles

| # | Juego | Descripción |
|---|-------|-------------|
| 1 | Snake | Clásico juego de la serpiente |
| 2 | Pong | Tenis de mesa arcade |
| 3 | Breakout | Rompe ladrillos |
| 4 | Flappy Bird | Voltea el pájaro |
| 5 | Memory | Memoria y emparejamiento |
| 6 | Tetris | Rompecabezas de piezas |
| 7 | Space Invaders | Disparos espaciales |
| 8 | 2048 | Rompecabezas numérico |
| 9 | Whack-a-Mole | Golpea los topos |
| 10 | Asteroids | Asteroides espaciales |
| 11 | Racing | Carreras de obstáculos |
| 12 | Pool | Billar simplificado |
| 13 | Pac-Man | Laberinto y fantasmas |
| 14 | Tower Defense | Torres defensivas |
| 15 | Sudoku | Rompecabezas lógico |
| 16 | Candy Crush | Match-3 de dulces |
| 17 | Fighter | Lucha contra IA |
| 18 | Chess | Ajedrez contra IA |
| 19 | Solitaire | Solitario clásico |
| 20 | Trivia | Preguntas y respuestas |

## ⌨️ Controles

- **Teclado**: Flechas + WASD
- **Táctil**: Tocar y deslizar

## 🛠️ Desarrollo

### Compilar WASM (C++)
```bash
emcc wasm_bridge.cpp -o wasm_bridge.js \
  -s EXPORTED_RUNTIME_METHODS='["ccall","cwrap"]' \
  -s EXPORTED_FUNCTIONS='["_initScoreTable","_setHighScore","_getHighScore"]' \
  -s WASM=1
```

### Desplegar a GitHub
```bash
chmod +x deploy_github.sh
./deploy_github.sh
```

## 📂 Estructura

```
game-hub/
├── index.html          # App principal
├── style.css           # Estilos
├── main.js            # Lógica del hub
├── manifest.json      # Configuración PWA
├── service-worker.js  # Cache offline
├── package.json       # Metadatos npm
├── app_runner.py      # Servidor local
├── deploy_github.sh   # Script de despliegue
├── wasm_bridge.cpp    # Módulo C++/WASM
└── games/             # 20 juegos
    ├── snake.js
    ├── pong.js
    └── ...
```

## 📱 Características

- ✅ 100% funcional sin conexión
- ✅ Orientación vertical
- ✅ Sin barra del navegador (standalone)
- ✅ High scores guardados en localStorage
- ✅ Diseño responsivo
- ✅ Compatible con móvil y desktop

## 📄 Licencia

MIT © 2026 Game Hub Team
