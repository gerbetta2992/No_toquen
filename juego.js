
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
      { x: 2650, y: 835, width: 160, height: 550 },
    ];
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

  generarPuntosNoBloqueados(zonasBloqueadas, cantidad, anchoMapa, altoMapa) {
  const puntos = [];

  while (puntos.length < cantidad) {
    const punto = {
      x: Math.random() * anchoMapa,
      y: Math.random() * altoMapa,
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
    this.mundoContainer = new PIXI.Container();
    this.pixiApp.stage.addChild(this.mundoContainer);
    this.mundoContainer.sortableChildren = true;
    this.hudContainer = new PIXI.Container();
    this.pixiApp.stage.addChild(this.hudContainer);
    
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

    // //agregamos el elementos canvas creado por pixi en el documento html
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

    


    
    await this.cargarCiudad();
    await this.cargarPersonas().then(() => {
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

    for (let zona of this.zonasBloqueadas){
      //const graphics = new PIXI.Graphics();
      //graphics.beginFill(0xff0000, 0.3); // rojo transparente
      //graphics.drawRect(
      //  zona.x,
      //  zona.y,
      //  zona.width,
      //  zona.height
      //);
      //graphics.endFill();
      //this.mundoContainer.addChild(graphics);
    }
  }

  // ------------- Cargar game objects ---------------
  dibujarMapa(){
    // Contenedor del minimapa
    this.minimapPosition = {x: 1900, y: 1000};
    this.minimapSize = {x:400, y:200};

    // Fondo del minimapa
    const minimap = new PIXI.Graphics()
      .beginFill(0x000000, 0.5)
      .drawRect(this.minimapPosition.x, this.minimapPosition.y, this.minimapSize.x, this.minimapSize.y)
      .endFill();
    this.hudContainer.addChild(minimap);
    this.mapScale = {x: this.minimapSize.x / this.width, y: this.minimapSize.y / this.height};

    this.celebridadMapRef = new PIXI.Graphics()
      .beginFill(0x00ff00)
      .drawCircle(this.minimapPosition.x + this.minimapSize.x *0.5, this.minimapPosition.y + this.minimapSize.y*0.5, 5)
      .endFill();
    this.hudContainer.addChild(this.celebridadMapRef);

    for (let i = 0; i < this.personas.length; i++) {
      const punto = new PIXI.Graphics()
        .beginFill(0xFFFF00)
        .drawCircle(this.minimapPosition.x + this.minimapSize.x *0.5, this.minimapPosition.y + this.minimapSize.y*0.5, 4) // Dibujá en 0,0
        .endFill();

      // Seteás la posición del punto en el minimapa
      punto.x = this.minimapPosition.x + this.minimapSize.x * 0.5;
      punto.y = this.minimapPosition.y + this.minimapSize.y * 0.5;

      this.personasMapRef.push(punto);
      this.hudContainer.addChild(this.personasMapRef[i]);
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
      cabezaSprite.x = 700 + (cabeza * 50)
      cabezaSprite.y = 500
      cabezaSprite.scale.set(2);
      this.hudContainer.addChild(cabezaSprite);
      this.vidasHud.push(cabezaSprite);
    }
  }
  async cargarBalas(){
    const texturaBalas = await PIXI.Assets.load("Sprites/Hud/Balas.png");
    for(let bala=0; bala<this.patova.balas; bala++){
      const balaSprite = new PIXI.Sprite(texturaBalas);
      balaSprite.x = 700 + (bala * 10);
      balaSprite.y = 400;
      this.hudContainer.addChild(balaSprite);
      this.balasHud.push(balaSprite);
    }
  }
  async cargarPersonas(){
    const lista_personas = this.listarPersonas();
    const animacionesPersonas = {}
    const puntosLibres = this.generarPuntosNoBloqueados(this.zonasBloqueadas, 50, 2500, 1200);
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
    
    for (let i = 0; i < 50; i++){
        let puntoRandom = puntosLibres[i];
        let x = puntoRandom.x; //0.5 * this.width;
        let y = puntoRandom.y; //0.5 * this.height;
        const personaRandom = this.getPersonaRandom();
        const nuevaPersona = new Persona(animacionesPersonas[personaRandom], x, y, this);
        this.personas.push(nuevaPersona);
        
        console.log(nuevaPersona,nuevaPersona.posicion);
        console.log(puntosLibres[i]);
        this.mundoContainer.addChild(nuevaPersona.container);
      }
  }

  async cargarCelebridad(){
    const celebridadAnim = await PIXI.Assets.load("Sprites/Personas/Rapero/Rapero.json");
    this.celebridad = new Celebridad(celebridadAnim, 0.5 * this.width, 0.5 * this.height, this);
    this.mundoContainer.addChild(this.celebridad.container);
    this.personas.push(this.celebridad);
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
      fontFamily: 'Arial',
      fontSize: 20,
      fill: 0x000000,
      align: 'center',
    });
    this.barra.addChild(this.textoBarra);
  }

  // Actualizar texto
  const valor = Math.floor(this.celebridad.ansiedad);
  this.textoBarra.text = `Ansiedad: ${valor}%`;

}

  actualizarBalas() {
  this.hudContainer.removeChild(this.balasHud[this.patova.balas]);
}

  actualizarVidas() {
  this.hudContainer.removeChild(this.vidasHud[this.patova.vidas]);
}

actualizarMapa(){
  if (this.personas == undefined) return;
  this.celebridadMapRef.x = (this.celebridad.posicion.x * this.mapScale.x) - this.minimapSize.x/2;
  this.celebridadMapRef.y = (this.celebridad.posicion.y * this.mapScale.y) - this.minimapSize.y/2;

  for (let i=0; i < this.personasMapRef.length; i++){
    this.personasMapRef[i].x = (this.personas[i].posicion.x * this.mapScale.x) - this.minimapSize.x/2;
    this.personasMapRef[i].y = (this.personas[i].posicion.y * this.mapScale.y) - this.minimapSize.y/2;
    if (this.personas[i].estado == "comoLoquita"){
      this.personasMapRef[i].tint = 0xFF0000;
    }
    else{
      this.personasMapRef[i].tint = 0xFFFF00;
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
    console.log(this.mouse.posicion);
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
    this.actualizarBalas();
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


  gameLoop(time) {
    //iteramos por todos los personas
    this.derrota();
    this.valorBarra -= 0.1;
    if (this.valorBarra < 0) this.valorBarra = 0;
    this.actualizarBarra();
    this.actualizarMapa();
    this.mira.render();
    this.mira.tick();
    this.ciudad.render();
    this.ajustarCamaraAPosicionDelMouse();
    this.patova.render();
    this.patova.tick();
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
