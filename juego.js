
class Juego {
  
  pixiApp;
  personas = [];
  personasAnim = []
  mira;
  width;
  height;
  celebridad;
  arboles = []
  luces = []
  personasMapRef = []
  startButton;
  title;

  constructor() {
    this.width = 2816;
    this.height = 1536;
    this.celebridad = { posicion: { x: this.width/2, y: this.height/2 } };
    this.patova = { posicion: { x: this.width/2, y: this.height/100} };
    this.mouse = { posicion: { x: 0, y: 0 } };
    this.botonMouse = {};
    this.balasHud = [];
    this.vidasHud = [];
    this.zonasBloqueadas = [
      { x: 375, y: 0, width: 2150, height: 540 },
      { x: 990, y: 935, width: 860, height: 500 },
      { x: 270, y: 1080, width: 480, height: 270 },
      { x: 720, y: 1160, width: 320, height: 185 },
      { x: 1810, y: 1160, width: 320, height: 185 },
      { x: 2080, y: 1080, width: 530, height: 270 },
      { x: 2650, y: 835, width: 560, height: 850 },
    ];
    this.oleada = 1;
    this.proximaOleada = Math.random() * 50000 + 10000 * this.oleada;
    this.cargarNuevaOleada();
    this.paused = true;
  }

  async iniciar(){
    this.initPIXI();
  }
// ------------------------ Zonas bloqueadas ------------------------
  dentroDeRect(pos, rect) {
    return (
      pos.x >= rect.x &&
      pos.x <= rect.x + rect.width &&
      pos.y >= rect.y &&
      pos.y <= rect.y + rect.height
    );
  }

  generarPuntosEnBorde(zonasBloqueadas, cantidad, anchoMapa, altoMapa) {
  const puntos = [];

  while (puntos.length < cantidad) {

    // Elegir aleatoriamente un borde
    const borde = Math.floor(Math.random() * 2); // 0=izq, 1=der, 2=arriba, 3=abajo
    let punto = { x: 0, y: 0 };

    switch (borde) {
      case 0: // IZQUIERDA
        punto.x = 0 - 10;
        punto.y = Math.random() * altoMapa;
        break;

      case 1: // DERECHA
        punto.x = anchoMapa + 25;
        punto.y = Math.random() * altoMapa;
        break;
    }

    // Revisar si cae dentro de una zona bloqueada
    const dentroDeZona = zonasBloqueadas.some(z =>
      punto.x >= z.x &&
      punto.x <= z.x + z.width &&
      punto.y >= z.y &&
      punto.y <= z.y + z.height
    );

    if (!dentroDeZona) {
      puntos.push(punto);
    }
  }

  return puntos;
  }

  generarPuntosNoBloqueados(zonasBloqueadas, cantidad, anchoMapa, altoMapa) {
  const puntos = [];

  while (puntos.length < cantidad) {
    const punto = {
      x: Math.random() * anchoMapa + 250,
      y: Math.random() * altoMapa + 250,
    };

    // Si el punto NO está dentro de ninguna zona bloqueada, lo agregamos
    const dentroDeZona = zonasBloqueadas.some(z =>
      punto.x >= z.x &&
      punto.x <= z.x + z.width &&
      punto.y >= z.y &&
      punto.y <= z.y + z.height
    );

    if (!dentroDeZona) {
      
      puntos.push(punto);
    }
  }
  return puntos;
  }



  //async indica q este metodo es asyncronico, es decir q puede usar "await"
  async initPIXI() {
    //creamos la aplicacion de pixi y la guardamos en la propiedad pixiApp
    this.pixiApp = new PIXI.Application();
    const startScreen = new PIXI.Container();
    this.pixiApp.stage.addChild(startScreen);

    // Fondo
    const texture = await PIXI.Assets.load("Sprites/Ciudad/Frente2.png");
    const bg = new PIXI.Sprite(texture);
    bg.scale.set(0.75, 0.6);
    bg.x = (this.width - bg.width) / 2;
    bg.y = (this.height - bg.height) / 2;
    startScreen.addChild(bg);


    this.currentColor = 0xFF0000; 
    this.targetColor = 0x00FF00; 
    this.t = 0;

    

    

    document.fonts.load("10pt NeonPixel").then(() => {
      this.title = new PIXI.Text("No toquen", {
        fontFamily: "NeonPixel",
        fontSize: 180,
        fill: 0xffffff,
        stroke: 0x000000,
        strokeThickness: 6
    });
    this.title.anchor.set(0.5);
    this.title.x = this.width / 2;
    this.title.y = this.height / 2 - 100;
    startScreen.addChild(this.title);


      this.startButton = new PIXI.Text("Empezar", {
        fontFamily: "NeonPixel",
        fontSize: 150,
        fill: 0xffffff,
        stroke: 0x000000,
        strokeThickness: 5
    });
    this.startButton.anchor.set(0.5);
    this.startButton.x = this.width / 2;
    this.startButton.y = this.height / 2 + 200;
    this.startButton.interactive = true;
    this.startButton.buttonMode = true;

    startScreen.addChild(this.startButton);
    });

    
    this.gameContainer = new PIXI.Container();
    
    this.pixiApp.stage.name = "el stage";
    
    //esto es para que funcione la extension de pixi
    globalThis.__PIXI_APP__ = this.pixiApp;

    const opcionesDePixi = {
      background: "#1099bb",
      width: this.width,
      height: this.height,
      antialias: false,
      SCALE_MODE: PIXI.SCALE_MODES.NEAREST,
    };
    //inicializamos pixi con las opciones definidas anteriormente
    //await indica q el codigo se frena hasta que el metodo init de la app de pixi haya terminado
    //puede tardar 2ms, 400ms.. no lo sabemos :O
    await this.pixiApp.init(opcionesDePixi);
    
    const startGame = () => {
      this.pixiApp.stage.removeChild(startScreen);
      this.pixiApp.stage.addChild(this.gameContainer);
      this.pixiApp.stage.setChildIndex(this.gameContainer, this.pixiApp.stage.children.length - 1);
      this.pixiApp.stage.setChildIndex(this.mira.container, this.pixiApp.stage.children.length - 1);
      const txt = new PIXI.Text("El juego empezó!", {
          fontFamily: "Arial",
          fontSize: 40,
          fill: 0xffffff
      });
      txt.x = 100;
      txt.y = 100;
      this.gameContainer.addChild(txt);
      this.paused = false;
      //stopMusic();
      //playNext();
    }
    this.startButton.on("pointerdown", startGame);
    
    this.mundoContainer = new PIXI.Container();
    this.gameContainer.addChild(this.mundoContainer);
    this.mundoContainer.sortableChildren = true;
    this.hudContainer = new PIXI.Container();
    this.gameContainer.addChild(this.hudContainer);

    document.body.appendChild(this.pixiApp.canvas);

    this.sonidoDisparo = new Audio('Sounds/disparo.mp3');
    this.sonidoDisparo.volume = 0.5;

    const ancho = 300;
    const alto = 20;

    // Fondo (gris)
    this.barraFondo = new PIXI.Graphics();
    this.barraFondo.beginFill(0x444444);
    this.barraFondo.drawRect(0, 0, ancho, alto);
    this.barraFondo.endFill();
    this.barraFondo.x = 700;
    this.barraFondo.y = 1200;

    // Barra de vida (verde)
    this.barra = new PIXI.Graphics();
    this.barra.beginFill(0x00ff00);
    this.barra.drawRect(0, 0, ancho, alto);
    this.barra.endFill();
    this.barra.x = 700;
    this.barra.y = 1200;

    // Añadir al HUD
    this.hudContainer.addChild(this.barraFondo);
    this.hudContainer.addChild(this.barra);

    // Crear Nodos
    let puntosNodos = this.generarPuntosPoisson(this.width, this.height, 50, this.zonasBloqueadas, 30);
    this.nodos = puntosNodos.map((p, i) => ({
      id: i,
      x: p.x,
      y: p.y,
      links: []
    }));
    this.conectarNodos(this.nodos, this.zonasBloqueadas);

    
    await this.cargarCiudad();
    await this.cargarPersonas(25).then(() => {
      //this.asignarElMouseComoPerseguidorATodosLosConejitos();
      this.agregarInteractividadDelMouse();
      this.dibujarMapa();
    });
    await this.cargarMira();
    await this.cargarPatova();
    await this.cargarCelebridad();
    await this.cargarArboles();
    await this.cargarLuces();
    
    //agregamos el metodo this.gameLoop al ticker.
    //es decir: en cada frame vamos a ejecutar el metodo this.gameLoop
    this.pixiApp.ticker.add(this.gameLoop.bind(this));

    //this.dibujarZonasBloqueadas();
    

  }

  lerp(a, b, t) {
    return a + (b - a) * t;
  }
  randomBrightColor(colorA, colorB, t){
    const aR = (colorA >> 16) & 0xFF;
    const aG = (colorA >> 8) & 0xFF;
    const aB = colorA & 0xFF;

    const bR = (colorB >> 16) & 0xFF;
    const bG = (colorB >> 8) & 0xFF;
    const bB = colorB & 0xFF;

    const r = Math.floor(this.lerp(aR, bR, t));
    const g = Math.floor(this.lerp(aG, bG, t));
    const b = Math.floor(this.lerp(aB, bB, t));

    return (r << 16) | (g << 8) | b;
  } 

  // ------------------------ Pathfinding ------------------------

  generarPuntosPoisson(ancho, alto, minDist, zonasBloqueadas, k = 30) {
  const gridSize = minDist / Math.sqrt(2);
  const cols = Math.ceil(ancho / gridSize);
  const rows = Math.ceil(alto / gridSize);

  const grid = new Array(cols * rows).fill(null);
  const puntos = [];
  const active = [];

  function dentroZonaBloqueada(x, y) {
    return zonasBloqueadas.some(z =>
      x >= z.x &&
      x <= z.x + z.width &&
      y >= z.y &&
      y <= z.y + z.height
    );
  }

  let p;
  do {
    p = {
      x: Math.random() * ancho,
      y: Math.random() * alto
    };
  } while (dentroZonaBloqueada(p.x, p.y));

  puntos.push(p);
  active.push(p);

  grid[Math.floor(p.x / gridSize) + Math.floor(p.y / gridSize) * cols] = p;

  while (active.length > 0) {
    const idx = Math.floor(Math.random() * active.length);
    const base = active[idx];
    let found = false;

    for (let i = 0; i < k; i++) {
      const ang = Math.random() * Math.PI * 2;
      const dist = minDist * (1 + Math.random());
      const x = base.x + Math.cos(ang) * dist;
      const y = base.y + Math.sin(ang) * dist;

      if (
        x >= 0 && x < ancho &&
        y >= 0 && y < alto &&
        !dentroZonaBloqueada(x, y)
      ) {
        const gx = Math.floor(x / gridSize);
        const gy = Math.floor(y / gridSize);

        let ok = true;

        // revisar vecinos
        for (let yy = -2; yy <= 2; yy++) {
          for (let xx = -2; xx <= 2; xx++) {
            const nx = gx + xx;
            const ny = gy + yy;

            if (nx >= 0 && ny >= 0 && nx < cols && ny < rows) {
              const vecino = grid[nx + ny * cols];
              if (vecino) {
                const d = Math.hypot(vecino.x - x, vecino.y - y);
                if (d < minDist) {
                  ok = false;
                  break;
                }
              }
            }
          }
          if (!ok) break;
        }

        if (ok) {
          const nuevo = { x, y };
          puntos.push(nuevo);
          active.push(nuevo);
          grid[gx + gy * cols] = nuevo;
          found = true;
          break;
        }
      }
    }

    if (!found) {
      active.splice(idx, 1);
    }
  }
  return puntos;
  }

  lineaCruzaZona(p1, p2, zona) {
    // Check sencillo: muestreo de puntos sobre la línea
    const steps = 10;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = p1.x + (p2.x - p1.x) * t;
      const y = p1.y + (p2.y - p1.y) * t;

      if (x >= zona.x &&
          x <= zona.x + zona.width &&
          y >= zona.y &&
          y <= zona.y + zona.height) {
        return true;
      }
    }
    return false;
  }

  lineaValida(p1, p2, zonasBloqueadas) {
    return !zonasBloqueadas.some(z => this.lineaCruzaZona(p1, p2, z));
  }

  conectarNodos(puntos, zonasBloqueadas) {
    const RADIO = 150;
    
    for (let i = 0; i < puntos.length; i++) {
      const nodo = puntos[i];
      nodo.links = [];

      for (let j = 0; j < puntos.length; j++) {
        if (i === j) continue;

        const otro = puntos[j];

        // Está dentro del radio de conexión?
        const dx = otro.x - nodo.x;
        const dy = otro.y - nodo.y;
        const dist = Math.sqrt(dx*dx + dy*dy);

        if (dist < RADIO) {
          // Verifico que la línea no cruce zonas bloqueadas
          if (this.lineaValida(nodo, otro, zonasBloqueadas)) {
            nodo.links.push(otro);
          }
        }
      }
    }
  }

  getNodoMasCercano(x, y, nodos) {
    let mejor = null;
    let mejorDist = Infinity;

    for (const n of nodos) {
      const dx = x - n.x;
      const dy = y - n.y;
      const d = dx*dx + dy*dy;

      if (d < mejorDist) {
        mejorDist = d;
        mejor = n;
      }
    }

    return mejor;
  }

  astar(inicio, fin) {
    const open = [];
    const closed = new Set();

    for (const n of this.nodos) {
      n.g = Infinity;
      n.h = 0;
      n.f = Infinity;
      n.parent = null;
    }

    inicio.g = 0;
    inicio.h = calcularDistancia(inicio, fin);
    inicio.f = inicio.h;

    open.push(inicio);

    while (open.length > 0) {
      open.sort((a, b) => a.f - b.f);
      const actual = open.shift();

      if (actual === fin) {
        return this.reconstruirCamino(fin);
      }

      closed.add(actual);

      for (const vecino of actual.links) {
        if (closed.has(vecino)) continue;

        const gNuevo = actual.g + calcularDistancia(actual, vecino);

        if (!open.includes(vecino) || gNuevo < vecino.g) {
          vecino.g = gNuevo;
          vecino.h = calcularDistancia(vecino, fin);
          vecino.f = vecino.g + vecino.h;
          vecino.parent = actual;

          if (!open.includes(vecino)) {
            open.push(vecino);
          }
        }
      }
    }

    return []; // si no hay camino
  }

  reconstruirCamino(nodo) {
    const camino = [];
    while (nodo) {
      camino.push({ x: nodo.x, y: nodo.y });
      nodo = nodo.parent;
    }
    return camino.reverse();
  }


  dibujarZonasBloqueadas(zonasBloqueadas){
    for (let zona of zonasBloqueadas){
      const graphics = new PIXI.Graphics();
      graphics.beginFill(0xff0000, 0.3); // rojo transparente
      graphics.drawRect(
        zona.x,
        zona.y,
        10, //zona.width,
        10 //zona.height
      );
      graphics.endFill();
      this.mundoContainer.addChild(graphics);
    }
  }
  agregarPersonaAlMapa(indice){
    const punto = new PIXI.Graphics()
        .drawCircle(this.minimapPosition.x + this.minimapSize.x *0.5, this.minimapPosition.y + this.minimapSize.y*0.5, 4) // Dibujá en 0,0
        .endFill();

      // Seteás la posición del punto en el minimapa
      punto.x = this.minimapPosition.x + this.minimapSize.x * 0.5;
      punto.y = this.minimapPosition.y + this.minimapSize.y * 0.5;

      this.personasMapRef.push(punto);
      this.hudContainer.addChild(this.personasMapRef[indice]);
  }

  // ------------- Cargar game objects ---------------
  dibujarMapa(){
    // Contenedor del minimapa
    this.minimapPosition = {x: 1900, y: 1000};
    this.minimapSize = {x:400, y:200};

    // Fondo del minimapa
    let map = new PIXI.Sprite(this.ciudad.spriteActual.texture);
    map.scale.set(0.141, 0.125);
    map.x = this.minimapPosition.x;
    map.y = this.minimapPosition.y;
    map.alpha = 0.75;
    this.hudContainer.addChild(map);

    const minimap = new PIXI.Graphics()
      .beginFill(0x000000, 0.5)
      .drawRect(this.minimapPosition.x, this.minimapPosition.y, this.minimapSize.x, this.minimapSize.y)
      .endFill();
    this.hudContainer.addChild(minimap);
    this.mapScale = {x: this.minimapSize.x / this.width, y: this.minimapSize.y / this.height};

    this.celebridadObjetivoMapRef = new PIXI.Graphics()
      .beginFill(0xffffff)
      .drawCircle(this.minimapPosition.x + this.minimapSize.x *0.5, this.minimapPosition.y + this.minimapSize.y*0.5, 6)
      .endFill();
    this.hudContainer.addChild(this.celebridadObjetivoMapRef);


    this.celebridadMapRef = new PIXI.Graphics()
      .drawCircle(this.minimapPosition.x + this.minimapSize.x *0.5, this.minimapPosition.y + this.minimapSize.y*0.5, 5)
      .endFill();
    this.hudContainer.addChild(this.celebridadMapRef);

    for (let i = 0; i < this.personas.length; i++) {
      this.agregarPersonaAlMapa(i);
    }
  }

  async cargarLuces(){
    const lista_luces = this.listarLuces();
    for (let i=0; i<3; i++) {
      const texture = await PIXI.Assets.load(`Sprites/Objetos/${lista_luces[i]}.png`);
        let x=0;
        let y=0;
      if (i==0){
        x = 1445;
        y = 1100;
      }
      else if (i == 1){
        x = 1400
        y = 590;
      }
      else{
        x = 1445;
        y = 290;
      }
      const nuevaLuz = new Luces(texture, x, y, this);
      this.luces.push(nuevaLuz);
      this.mundoContainer.addChild(nuevaLuz.container);
    }
  }


  async cargarArboles(){
    const lista_arboles = this.listarArboles();
    for (let i=0; i<3; i++) {
      const texture = await PIXI.Assets.load(`Sprites/Objetos/${lista_arboles[i]}.png`);

      let puntosLibres = [{x:150, y: Math.floor(Math.random() *350 + 80)}]
      let puntoRandom = puntosLibres[Math.floor(Math.random() * puntosLibres.length)];
      const x = 1000// puntoRandom.x;
      const y = 1100// puntoRandom.y;
      const nuevoArbol = new Arbol(texture, x, y, this);
      this.arboles.push(nuevoArbol);
      this.mundoContainer.addChild(nuevoArbol.container);
    }
  }

  async cargarVidas(){
    const lista_vidas = this.listarVidas();
    for (let cabeza=0; cabeza<5; cabeza++) {
      let cabezaTextura = await PIXI.Assets.load(`Sprites/Hud/${lista_vidas[cabeza]}.png`);
      const cabezaSprite = new PIXI.Sprite(cabezaTextura);
      cabezaSprite.x = 700 + (cabeza * 25)
      cabezaSprite.y = 500
      cabezaSprite.scale.set(2);
      this.hudContainer.addChild(cabezaSprite);
      this.vidasHud.push(cabezaSprite);
    }
  }
  async cargarBalas(){
    this.texturaBalas = await PIXI.Assets.load("Sprites/Hud/Balas.png");
    for(let bala=0; bala<this.patova.balas; bala++){
      const balaSprite = new PIXI.Sprite(this.texturaBalas);
      balaSprite.x = 700 + (bala * 10);
      balaSprite.y = 400;
      this.hudContainer.addChild(balaSprite);
      this.balasHud.push(balaSprite);
    }
  }
  async cargarPersonas(cantidad, puntosLibres = null){
    const lista_personas = this.listarPersonas();
    const animacionesPersonas = {}
    if (puntosLibres == null){
      puntosLibres = this.generarPuntosNoBloqueados(this.zonasBloqueadas, cantidad, 2500, 1200);
    }

    //for (let punto of puntosLibres){
    //  const graphics = new PIXI.Graphics();
    //  graphics.beginFill(0xff0000, 0.3); // rojo transparente
    //  graphics.drawRect(
    //    punto.x,
    //    punto.y,
    //    10,
    //    10
    //  );
    //  graphics.endFill();
    //  this.mundoContainer.addChild(graphics);
    //}
    
    for (const persona of lista_personas) {
      animacionesPersonas[persona] = await PIXI.Assets.load(`Sprites/Personas/${persona}/${persona}.json`);
    }
    
    for (let i = 0; i < cantidad; i++){
        let puntoRandom = puntosLibres[i];
        let x = puntoRandom.x; //0.5 * this.width;
        let y = puntoRandom.y; //0.5 * this.height;
        const personaRandom = this.getPersonaRandom();
        const nuevaPersona = new Persona(animacionesPersonas[personaRandom], x, y, this);
        this.personas.push(nuevaPersona);
        
        this.mundoContainer.addChild(nuevaPersona.container);
      }
  }

  async cargarCelebridad(){
    const celebridadAnim = await PIXI.Assets.load("Sprites/Personas/Rapero/Rapero.json");
    this.celebridad = new Celebridad(celebridadAnim, 0.5 * this.width, 0.5 * this.height, this);
    this.mundoContainer.addChild(this.celebridad.container);
    //this.personas.push(this.celebridad);
  }

  async cargarPatova(){
    const patovaAnim = await PIXI.Assets.load("Sprites/Personas/Patova/Patova.json");
    this.patova = new Patova(patovaAnim, 0.5 * this.width, 0.7 * this.height, this);
    this.mundoContainer.addChild(this.patova.container);
    this.cargarBalas();
    this.cargarVidas();
  }

  async cargarCiudad(){
    const ciudadAnim = await PIXI.Assets.load("Sprites/Ciudad/Ciudad.png");

    this.ciudad = new Ciudad(ciudadAnim, 0.5 * this.width, 0.5 * this.height, this);
    this.mundoContainer.addChild(this.ciudad.container);
  }

  async cargarMira(){
    const miraAnim = await PIXI.Assets.load("Sprites/Mira/Mira.json");

    this.mira = new Mira(miraAnim, 0.5 * this.width, 0.5 * this.height, this);
    this.pixiApp.stage.addChild(this.mira.container);
  }

  listarLuces(){
    const arboles = ["Luces 1", "Luces 2","Luces 3"]
      return arboles
  }

  listarArboles(){
    const arboles = ["Arbol1", "Arbol2","Arbol3", "Arbol4", "Arbol5","Arbol6"]
      return arboles
  }

  listarPersonas(){

    // Ruta de la carpeta principal
    const personas = ["Afro", "Brazuca","Mago", "Pelado", "Payaso", "Policia", "Punky"] // "Afro", "Brazuca", "Pelado","Policia", "Morocha", "Punky", "Payaso", "Mago", "Rapero", "Fisura"
      return personas
  }

  listarVidas(){
    // Ruta de la carpeta principal
    const vidas = ["Cabeza1", "Cabeza2","Cabeza3", "Cabeza4", "Cabeza5", "Cabeza6", "Cabeza7", "Cabeza8", "Cabeza9"] // "Afro", "Brazuca", "Pelado","Policia", "Morocha", "Punky", "Payaso", "Mago", "Rapero", "Fisura"
      return vidas
  }


  getPersonaRandom(){
    const lista_personas = this.listarPersonas();
    const index = Math.floor(Math.random() * lista_personas.length );
    return lista_personas[index]
  }


  actualizarTimer(){
    if (!this.textoTimer) {
    this.textoTimer = new PIXI.Text('', {
      fontFamily: 'NeonPixel',
      fontSize: 20,
      fill: 0xffffff,
      fontWeight: "bold",
      align: 'center',
    });
    this.hudContainer.addChild(this.textoTimer);
  }
    this.textoTimer.x = this.width * 0.5;
    this.textoTimer.y = 350;
    let valor = Math.floor(this.celebridad.timer);
    this.textoTimer.text = `Timer: ${valor}`;
  }
  actualizarBarra() {
  const porcentaje =  this.celebridad.ansiedad / 100;
  const anchoTotal = 300;
  

  this.barra.clear();
  let color = 0x00ff00;
  if (porcentaje < 0.3) color = 0x00ff00 ; // verde si < 30%
  else if (porcentaje < 0.75) color = 0xffff00; // amarillo si < 60%
  else color = 0xff0000 // rojo si > 60%
  this.barra.beginFill(color);
  this.barra.drawRect(0, 0, anchoTotal * porcentaje, 20);
  this.barra.endFill();

  if (!this.textoBarra) {
    this.textoBarra = new PIXI.Text('', {
      fontFamily: 'NeonPixel',
      fontSize: 20,
      fill: 0x000000,
      fontWeight: "bold",
      align: 'center',
    });
    this.barra.addChild(this.textoBarra);
  }
  this.textoBarra.x  = 25;
  // Actualizar texto
  const valor = Math.floor(this.celebridad.ansiedad);
  this.textoBarra.text = `Ansiedad: ${valor}%`;

}

  recargarBalas(totalBalasAntesDeCargar = this.patova.balas) {
    
    for(let bala=totalBalasAntesDeCargar; bala<this.patova.balas; bala++){
      const balaSprite = new PIXI.Sprite(this.texturaBalas);
      balaSprite.x = 700 + (bala * 10);
      balaSprite.y = 400;
      this.hudContainer.addChild(balaSprite);
      console.log(this.balasHud.length);
      this.balasHud.push(balaSprite);
      console.log(this.balasHud.length);
    }
  }
  gastarBalas() {
    
  this.hudContainer.removeChild(this.balasHud[this.patova.balas]);
  this.balasHud.pop();
  }

  actualizarVidas() {
  this.hudContainer.removeChild(this.vidasHud[this.patova.vidas]);
  }

  actualizarMapa(){
    if (this.personas == undefined) return;
    this.celebridadMapRef.x = (this.celebridad.posicion.x * this.mapScale.x) - this.minimapSize.x/2;
    this.celebridadMapRef.y = (this.celebridad.posicion.y * this.mapScale.y) - this.minimapSize.y/2;

      


    if (this.celebridad.obj){
      this.celebridadObjetivoMapRef.x = (this.celebridad.obj.x * this.mapScale.x) - this.minimapSize.x/2;
      this.celebridadObjetivoMapRef.y = (this.celebridad.obj.y * this.mapScale.y) - this.minimapSize.y/2;
      let factor = Math.max(100, Math.min(500, this.celebridad.timer)); 
      const time = performance.now();
      const phase = Math.floor(time / factor);
      const blink = (phase & 1) === 0 ? 0xffffff : 0x000000;
      this.celebridadObjetivoMapRef.tint = blink;
    }
    if (this.celebridad.ansiedad < 30){
        this.celebridadMapRef.tint = 0x00ff00;
    }
    else if (this.celebridad.ansiedad < 60){
      this.celebridadMapRef.tint = 0xffff00;
    }
    else{
      this.celebridadMapRef.tint = 0xff0000; 
    }

    for (let i=0; i < this.personas.length; i++){

      if (!this.personasMapRef[i]){
        this.agregarPersonaAlMapa(i);
      }
      this.personasMapRef[i].x = (this.personas[i].posicion.x * this.mapScale.x) - this.minimapSize.x/2;
      this.personasMapRef[i].y = (this.personas[i].posicion.y * this.mapScale.y) - this.minimapSize.y/2;
      if (this.personas[i].estado == "comoLoquita"){
        this.personasMapRef[i].tint = 0xaa0000;
      }
      else{
        this.personasMapRef[i].tint = 0xaaaaaa;
      }
    }
  }
// ---------------------- Mouse y otra yerbas -------------------------
  agregarInteractividadDelMouse() {
    // Escuchar el evento mousemove
    this.pixiApp.canvas.onmousemove = (event) => {
    const rect = this.pixiApp.view.getBoundingClientRect();
    this.mouse.posicion = {
     x: (event.clientX - rect.left) * (this.pixiApp.renderer.width / rect.width),
     y: (event.clientY - rect.top) * (this.pixiApp.renderer.height / rect.height),
      };
    this.mira.globalPos = this.mundoContainer.toLocal(this.mouse.posicion);
    };


    this.pixiApp.canvas.onmousedown = (event) => {
      this.botonMouse["click"] = true;
      const rect = this.pixiApp.view.getBoundingClientRect();
      // Transformar a coordenadas del mundo
      const mouseScreen = {
        x: (event.clientX - rect.left) * (this.pixiApp.renderer.width / rect.width),
        y: (event.clientY - rect.top) * (this.pixiApp.renderer.height / rect.height)
      };

      // Convertir a coordenadas globales del stage (considerando que el mundo se mueve)
      const clickPosGlobal = this.mundoContainer.toLocal(mouseScreen);
      

      this.disparar(clickPosGlobal);
      this.asesinarPersonaEn(mouseScreen);
    };
    this.pixiApp.canvas.onmouseup = (event) => {
      delete this.botonMouse["click"];
    }
  };
  
  ajustarCamaraAPosicionDelMouse() {
    //const mouseWorldX = this.mouse.posicion.x - this.mundoContainer.x;
    //const mouseWorldY = this.mouse.posicion.y - this.mundoContainer.y;

    if (this.mouse.posicion.x > 2000){this.mundoContainer.x -= 5;}
     
    else if (this.mouse.posicion.x < 1200){this.mundoContainer.x += 5;}
      

    if (this.mouse.posicion.y > 1200){this.mundoContainer.y -= 5;}
     
    else if (this.mouse.posicion.y < 350){this.mundoContainer.y += 5;}
      
    this.mundoContainer.x = Math.max(-448, Math.min(this.mundoContainer.x, 448));
    this.mundoContainer.y = Math.max(-120, Math.min(this.mundoContainer.y, 230));

  }

  disparar(pos){
    if (this.patova.balas <= 0) return;
    this.sonidoDisparo.currentTime = 0;
    this.sonidoDisparo.play();
    //const graphics = new PIXI.Graphics();
    //  graphics.beginFill(0xff0000, 0.3); // rojo transparente
    //  graphics.drawRect(
        pos.x,
        pos.y,
        10,
        10
    //  );
    //  graphics.endFill();
    //  this.mundoContainer.addChild(graphics);
    for (let persona of this.personas) {
      persona.huirDePos(pos);
    }
    this.patova.balas -= 1;
    this.gastarBalas();
    this.patova.disparar = true;
  }

  asesinarPersonaEn(pos){
    if (this.patova.balas <= 0) return;
    for (let persona of this.personas) {
      const bounds = persona.container.getBounds();
      
      const hitBox = {
        x: bounds.x + bounds.width * 0.45,
        y: bounds.y + bounds.height * 0.1,
        width: bounds.width * 0.1,
        height: bounds.height * 0.5
      };

      if (pos.x >= hitBox.x &&
          pos.x <= hitBox.x + hitBox.width &&
          pos.y >= hitBox.y &&
          pos.y <= hitBox.y + hitBox.height) 
      {
        persona.asesinado = true;
        this.patova.vidas -= 1;
        this.actualizarVidas();
        persona.cancelarMovimientoErratico();
        persona.cancelarMovimiento();
      }
    }
  }

  derrota(){
    if (this.patova.vidas <= 0){
      alert("¡Demasiados homicidios! Incluso para un patovica. Te rajaron.");
      window.location.reload();
    }
    if (this.celebridad.asesinado)
    {
      alert("¡Mataste a la celebridad! Espero que se te haya escapado el tiro. ¿No? ... ¿No?");
      window.location.reload();
    }
    if (this.celebridad.ansiedad >= 100){
      alert("Ay no, a la celebridad le dió mucha asiedad! Mala pata, a ver si conseguís laburo en Esperanto");
      window.location.reload();
    }
    
  }

  asignarElMouseComoTargetATodosLosConejitos() {
    for (let cone of this.personas) {
      cone.asignarTarget(this.mouse);
    }
  }

  asignarPerseguidorRandomATodos() {
    for (let cone of this.personas) {
      cone.perseguidor = this.getConejitoRandom();
    }
  }

  asignarElMouseComoPerseguidorATodosLosConejitos() {
    for (let cone of this.personas) {
      cone.perseguidor = this.mouse;
    }
  }

  cargarNuevaOleada(){
    
    setTimeout(() => {
          this.oleada += 1
          let puntosLibres;
          let cantidad = Math.floor(Math.random() * 5) + this.oleada * 10;
          puntosLibres = this.generarPuntosEnBorde(this.zonasBloqueadas, cantidad, this.width, this.height);
          this.cargarPersonas(cantidad, puntosLibres);
          this.proximaOleada = Math.random() * 50000 + 10000 * this.oleada;
          this.cargarNuevaOleada();
        }, this.proximaOleada);
  }

  gradiarColor(){
    this.t += 0.01;
    if (this.t >= 1) {
        this.t = 0;
        this.currentColor = this.targetColor;
        this.targetColor = Math.floor(Math.random() * 0xFFFFFF);

    }
  }


  gameLoop(time) {
    //iteramos por todos los personas
    let color = this.randomBrightColor(this.currentColor, this.targetColor, this.t);
    this.startButton.tint = color;
    this.title.tint = color;
    this.gradiarColor();
    this.mira.render();
    this.mira.tick();
    if (this.paused) return;
    this.derrota();
    this.valorBarra -= 0.1;
    if (this.valorBarra < 0) this.valorBarra = 0;
    this.actualizarBarra();
    this.actualizarMapa();
    this.actualizarTimer();
    this.ciudad.render();
    this.ajustarCamaraAPosicionDelMouse();
    this.patova.render();
    this.patova.tick();
    this.celebridad.render();
    this.celebridad.tick();

    for (let arbol of this.arboles){
      arbol.render();
    }
    for (let luces of this.luces){
      luces.render();
    }
      
    for (let persona of this.personas) {
      //ejecutamos el metodo tick de cada conejito
      persona.tick();
      persona.render();
    }
  }

  asignarTargets() {
    for (let cone of this.personas) {
      cone.asignarTarget(this.getConejitoRandom());
    }
  }

}
