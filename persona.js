class Persona extends GameObject {
  escala = 1;
  constructor(textureData, x, y, juego) {
    const escala = 1;
    const velAnim = 1;
    const animInicial = "correr";
    var intervalId;
    super(textureData, x, y, juego,animInicial, escala);
    this.cargarSpritesAnimados(textureData, escala, velAnim);
    this.cambiarAnimacion(animInicial);
    this.movimientoErratico();
  }

  getOtrosConejitos() {
    return this.juego.conejitos;
  }

  
  cargarSpritesAnimados(textureData, escala, velAnim) {

    for (let key of Object.keys(textureData.animations)) {
      this.spritesAnimados[key] = new PIXI.AnimatedSprite(
        textureData.animations[key]
      );

      this.spritesAnimados[key].play();
      this.spritesAnimados[key].loop = true;
      this.spritesAnimados[key].animationSpeed = velAnim;
      this.spritesAnimados[key].scale.set(escala);
      this.spritesAnimados[key].anchor.set(0.5, 0.5);

      this.container.addChild(this.spritesAnimados[key]);
    }
    //console.log(textureData);
  }

  movimientoErratico(){
    this.intervalId = setInterval(() => {
      // Velocidad aleatoria entre -2 y 2 en cada eje
    

    var direccionX =  Math.random() - Math.random();
    var direccionY =  Math.random() - Math.random();

    var difX = direccionX;
    var difY = direccionY;

    let vectorTemporal = {
      x: -difX,
      y: -difY,
    };
    vectorTemporal = limitarVector(vectorTemporal, 1);

    this.aceleracion.x += -vectorTemporal.x;
    this.aceleracion.y += -vectorTemporal.y;
    
    }, 2000); 
    
  }

  cancelarMovimientoErratico(){
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log("Movimiento errático detenido");
    }
  }

  limitarPosicion(minY, maxY){
    this.posicion.y = Math.max(minY, Math.min(this.posicion.y, maxY));
  }

  render(){
    super.render();
    this.juego.listarPersonas().forEach(persona => {
      this.cambiarDeSpriteAnimadoSegunAngulo(persona, this.escala);
    });
  }

  tick(){
    super.tick();
    this.limitarPosicion(600,780);
  }
}
