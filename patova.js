class Patova extends GameObject {
  escala = 2;
  posMinX = 1090;
  posMaxX = 1755;
  posMinY = 1010;
  posMaxY = 1340;
  asesinado;
  intervalId;
  fanatismo;
  miedo = 0;
  balas;
  constructor(textureData, x, y, juego) {
    const escala = 2;
    const velAnim = 1;
    const animInicial = "correr";
    super(textureData, x, y, juego,animInicial, escala);
    this.teclas = {};
    this.balas = 10;
    this.vidas = 5;
    this.cargarSpritesAnimados(textureData, escala, velAnim);
    //this.cambiarAnimacion(animInicial);
  }

// ----------------------------- Manejo del movimiento --------------------------

  moverSegunVelocidad(){
    this.posicion.x += this.velocidad.x * this.juego.pixiApp.ticker.deltaTime;
    this.posicion.y += this.velocidad.y * this.juego.pixiApp.ticker.deltaTime;
    this.aceleracion.x = 0;
    this.aceleracion.y = 0;
  }

  moverConInputs(){
    
      window.addEventListener("keydown", (e) => this.teclas[e.key] = true);
      window.addEventListener("keyup", e => delete this.teclas[e.key]);
      if (this.teclas["w"]) this.aceleracion.y -= 1;
      if (this.teclas["s"]) this.aceleracion.y += 1;
      if (this.teclas["a"]) this.aceleracion.x -= 1;
      if (this.teclas["d"]) this.aceleracion.x += 1;
  }
  rebotarContraBordes() {
    if (!this.reboteCooldown){
      if (this.posicion.x >= 740) {
      console.log("borde derecho");

      } else if (this.posicion.x <= 300) {
        console.log("borde izquierdo");
      }
      this.reboteCooldown = true;
      setTimeout(() => {
        this.reboteCooldown = false;
      }, 50);
    }
   
  }


// ----------------------- Manejo de Renderizacion de los Sprites --------------------

  cargarSpritesAnimados(textureData, escala, velAnim) {

    for (let key of Object.keys(textureData.animations)) {
      this.spritesAnimados[key] = new PIXI.AnimatedSprite(textureData.animations[key]);

      this.spritesAnimados[key].loop = ["correr"].includes(key);

      this.spritesAnimados[key].animationSpeed = velAnim;
      this.spritesAnimados[key].scale.set(escala);
      this.spritesAnimados[key].anchor.set(0.5, 1);

      this.container.addChild(this.spritesAnimados[key]);
    }
    //console.log(textureData);
  }
  voltearPersona(escala) {
      //0 grados es a la izquierda, 180 a la derecha, 90 arriba, 270 abajo
      //const moving = calcularDistancia(this.posicion, this.target.posicion) > 200;

      if (this.juego.mira.globalPos.x > this.posicion.x){
        this.spritesAnimados[this.animacionActual].scale.x = escala;
      }
      else{
        this.spritesAnimados[this.animacionActual].scale.x = -escala;
      }
  }

  cambiarAnimacionSegunEvento(){
      let correr = (Object.keys(this.teclas).length > 0);
      let idle = (Object.keys(this.teclas).length <= 0);

      let animName, velAnim;
      if (this.disparar)
      {
        animName = "disparar"
        velAnim = 1;
      }
      else if (idle){
        animName = "idle";
      }
      else if (correr){
        animName = "correr";
        velAnim = 1;
      }
      
      this.cambiarAnimacion(animName, velAnim);
      this.disparar = false;
  }

  cancelarMovimiento(){
    this.velocidadMaxima = 0;
    this.aceleracion.x = 0;
    this.aceleracion.y = 0;
    this.velocidad.x = 0;
    this.velocidad.y = 0;
  }


// ----------------- Calculos de Variables -------------------------



  calcularEstado(){
    if (this.miedo > 9){
      
      this.cambiarEstado("asustado");
      //setTimeout(() => {
      //  if(calcularDistancia(this.puntoDeHuida, this.posicion) < )
      //  this.miedo = Math.random() * 3;
      //  this.puntoDeHuida = undefined;
      //}, Math.random() * 2000 + 5000);   
    }
    else if (this.estado != "asustado" && this.fanatismo >= 90)
      this.cambiarEstado("comoLoquita");
    else if (this.miedo < 3){
      this.puntoDeHuida = undefined;
      this.cambiarEstado("normal");
    }
  }

  cambiarEstado(estado){
    this.estado = estado;
  }

  asignarTarget(quien) {
    this.target = quien;
  }

  //------------------- Limitadores ----------------------------- 
  limitarPosicion(minX, maxX, minY, maxY){
    this.posicion.x = Math.max(0, Math.min(this.posicion.x, maxX));
    this.posicion.y = Math.max(minY, Math.min(this.posicion.y, maxY));
  }


  render(){
    super.render();
    this.cambiarAnimacionSegunEvento();
    this.voltearPersona(this.escala);
    
  }

  tick(){
        //console.log(this.posicion);
    this.container.zIndex = this.posicion.y;
    this.moverConInputs();
    super.tick();
    this.moverSegunVelocidad();
    this.limitarPosicion(this.posMinX,this.posMaxX, this.posMinY, this.posMaxY);
    //this.rebotarContraBordes();
    //this.calcularEstado();
 }


}

