class Juego {
  
  pixiApp;
  personas = [];
  personasAnim = []
  mira;
  width;
  height;

  constructor() {
    this.width = 1024;
    this.height = 1024;
    this.mouse = { posicion: { x: 0, y: 0 } };
    this.initPIXI();
  }


  //async indica q este metodo es asyncronico, es decir q puede usar "await"
  async initPIXI() {
    //creamos la aplicacion de pixi y la guardamos en la propiedad pixiApp
    this.pixiApp = new PIXI.Application();

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

    //cargamos la imagen bunny.png y la guardamos en la variable texture
    //const texture = await PIXI.Assets.load("bunny.png");

    const BrazucaAnim = await PIXI.Assets.load("Sprites/Personas/Brazuca/Correr/Correr.json");
    //const AfroAnim = await PIXI.Assets.load("Sprites/Afro/Correr/Correr.json");
    //const PayasoAnim = await PIXI.Assets.load("Sprites/Payaso/Correr/Correr.json");
    //const PunkAnim = await PIXI.Assets.load("Sprites/Punk/Correr/Correr.json");
    //const MagoAnim = await PIXI.Assets.load("Sprites/Mago/Correr/Correr.json");

    const miraAnim = await PIXI.Assets.load("Sprites/Mira/Mira.json");

    const mira = new Mira(miraAnim, 0.5 * this.width, 0.5 * this.height, this);
    this.mira = mira;
    
    const ciudadAnim = await PIXI.Assets.load("Sprites/Ciudad/Ciudad.png");

    const ciudad = new Ciudad(ciudadAnim, 0.5 * this.width, 0.5 * this.height, this);
    this.ciudad = ciudad;


    this.cargarPersonas();
    //console.log(mira);
    //for (let i = 0; i < 1; i++) {
    //  const x = 0.5 * this.width;
    //  const y = 0.5 * this.height;
    //  //crea una instancia de clase Conejito, el constructor de dicha clase toma como parametros la textura
    //  // q queremos usar,X,Y y una referencia a la instancia del juego (this)
    //  const conejito = new Persona(BrazucaAnim, x, y, this);
    //  this.personas.push(conejito);
    //  
    //}

    //agregamos el metodo this.gameLoop al ticker.
    //es decir: en cada frame vamos a ejecutar el metodo this.gameLoop
    this.pixiApp.ticker.add(this.gameLoop.bind(this));

    this.agregarInteractividadDelMouse();

    // this.asignarPerseguidorRandomATodos();
    // this.asignarTargets();
    //this.asignarElMouseComoTargetATodosLosConejitos();
  }

  listarPersonas(){

    // Ruta de la carpeta principal
    const personas = ["Brazuca","Afro"]
      return personas
  }

  async cargarPersonas(){
    const lista_personas = this.listarPersonas();
    const animacionesPersonas = {}
    for (const persona of lista_personas) {
      animacionesPersonas[persona] = await PIXI.Assets.load(`Sprites/Personas/${persona}/Correr/Correr.json`);
      const x = 0.5 * this.width;
      const y = 0.5 * this.height;
      const nuevaPersona = new Persona(animacionesPersonas[persona], x, y, this);
      this.personas.push(nuevaPersona);
    }
    
  }

  agregarInteractividadDelMouse() {
    // Escuchar el evento mousemove
   // this.pixiApp.canvas.onmousemove = (event) => {
   //   this.mouse.posicion = { x: event.x, y: event.y };
   // };

    this.pixiApp.canvas.onmousemove = (event) => {
    const rect = this.pixiApp.canvas.getBoundingClientRect();
    this.mouse.posicion = {
      x: (event.clientX - rect.left) * (this.pixiApp.renderer.width / rect.width),
      y: (event.clientY - rect.top) * (this.pixiApp.renderer.height / rect.height),
      };
    };
  }

  gameLoop(time) {
    //iteramos por todos los personas
      this.mira.render();
      this.mira.tick();
      this.ciudad.render();
    for (let unConejito of this.personas) {
      //ejecutamos el metodo tick de cada conejito
      unConejito.tick();
      unConejito.render();
    }
  }

  getConejitoRandom() {
    return this.personas[Math.floor(this.personas.length * Math.random())];
  }

  asignarTargets() {
    for (let cone of this.personas) {
      cone.asignarTarget(this.getConejitoRandom());
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
}
