class GameObject {
  //defino las propiedades q tiene mi clase, aunq podria no definirlas
  sprite;
  id;
  x = 0;
  y = 0;
  target;
  puntoDeHuida;
  aceleracionMaxima = 0.2;
  velocidadMaxima = 3;
  spritesAnimados = {};
  radio = 10;
  distanciaPersonal = 20;
  distanciaParaLlegar = 300;   //HUI cambiar eso o el tint para variar de los tipitso
  // customizar velocidades, momento inicial de animacion, escala, etc
  spriteActual = null;
  reboteCooldown = false;

  constructor(textureData, x, y, juego, animInicial,escala) {
    this.container = new PIXI.Container();
    this.animaciones = null;

    this.textureData = textureData;
    this.container.name = "container";
    this.vision = Math.random() * 250 + 100;
    //guarda una referencia a la instancia del juego
    this.posicion = { x: x, y: y };
    this.velocidad = { x: Math.random() * 10, y: Math.random() * 10 };
    this.aceleracion = { x: 0, y: 0 };

    this.juego = juego;
    //generamos un ID para este conejito
    this.id = Math.floor(Math.random() * 99999999);

    // tomo como parametro la textura y creo un sprite

    

    // this.sprite.play();
    // this.sprite.loop = true;
    // this.sprite.animationSpeed = 0.1;
    // this.sprite.scale.set(2);

    // //le asigno x e y al sprite
    // this.sprite.x = x;
    // this.sprite.y = y;

    // //establezco el punto de pivot en el medio:
    // this.sprite.anchor.set(0.5);

    // //agrego el sprite al stage
    // //this.juego es una referencia a la instancia de la clase Juego
    // //a su vez el juego tiene una propiedad llamada pixiApp, q es la app de PIXI misma,
    // //q a su vez tiene el stage. Y es el Stage de pixi q tiene un metodo para agregar 'hijos'
    // //(el stage es como un container/nodo)
    // this.juego.pixiApp.stage.addChild(this.sprite);

    this.juego.pixiApp.stage.addChild(this.container);
  }

// ------------------------ Manejo de Renderizacion de los Sprites --------------------
  cambiarAnimacion(cual, velAnim = 1) {
    if (this.animacionActual === cual) return;

    for (let key of Object.keys(this.spritesAnimados)) {
      this.spritesAnimados[key].visible = false;
      this.spritesAnimados[key].stop();
      this.spritesAnimados[key].gotoAndStop(0);
      
    }
    if (cual == "caminar"){
      const totalFrames = this.spritesAnimados[cual].totalFrames;
      const frameInicial = Math.floor(Math.random() * totalFrames);
      this.spritesAnimados[cual].gotoAndStop(frameInicial);
    }
      
    this.spritesAnimados[cual].visible = true;
    this.spritesAnimados[cual].animationSpeed = velAnim;
    this.spritesAnimados[cual].play();
    this.animacionActual = cual;
  }

  cargarSpritesAnimados(textureData, scale, velAnim) {

    for (let key of Object.keys(textureData.animations)) {
      this.spritesAnimados[key] = new PIXI.AnimatedSprite(
        textureData.animations[key]
      );

      this.spritesAnimados[key].play();
      this.spritesAnimados[key].loop = true;
      this.spritesAnimados[key].animationSpeed = velAnim;
      this.spritesAnimados[key].scale.set(0.1);
      this.spritesAnimados[key].anchor.set(0.5, 0.5);

      this.container.addChild(this.spritesAnimados[key]);
    }
    
  }

  cambiarVelocidadDeAnimacionSegunVelocidadLineal() {
    const keys = Object.keys(this.spritesAnimados);
    for (let key of keys) {
      this.spritesAnimados[key].animationSpeed =
        this.velocidadLineal * 0.05 * this.juego.pixiApp.ticker.deltaTime;
    }
  }


// ----------------------- Limitadores -------------------
  limitarAceleracion() {
    this.aceleracion = limitarVector(this.aceleracion, this.aceleracionMaxima);
  }




  // -------------------------- Fisicas ------------------
  aplicarFriccion() {
    const friccion = Math.pow(0.95, this.juego.pixiApp.ticker.deltaTime);
    this.velocidad.x *= friccion;
    this.velocidad.y *= friccion;
  }

  asignarVelocidad(x, y) {
    this.velocidad.x = x;
    this.velocidad.y = y;
  }

  limitarVelocidad() {
    this.velocidad = limitarVector(this.velocidad, this.velocidadMaxima);
  }

  render() {
    this.container.x = this.posicion.x;
    this.container.y = this.posicion.y;
    
    //this.cambiarVelocidadDeAnimacionSegunVelocidadLineal();
  }

  tick() {
    //TODO: hablar de deltatime
    //this.aceleracion.x = 0;
    //this.aceleracion.y = 0;
    if (this.asesinado) return;
    this.limitarAceleracion();
    this.velocidad.x += this.aceleracion.x * this.juego.pixiApp.ticker.deltaTime;
    this.velocidad.y += this.aceleracion.y * this.juego.pixiApp.ticker.deltaTime;
    this.limitarVelocidad();
    //variaciones de la velocidad
    this.aplicarFriccion();
    


    //guardamos el angulo
    this.angulo =
      radianesAGrados(Math.atan2(this.velocidad.y, this.velocidad.x)) + 180;

    this.velocidadLineal = Math.sqrt(
      this.velocidad.x * this.velocidad.x + this.velocidad.y * this.velocidad.y
    );
  }

}
