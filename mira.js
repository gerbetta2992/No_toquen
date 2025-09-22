class Mira extends GameObject {

  constructor(textureData, x, y, juego) {
    const escala = 0.2;
    const animInicial = "apuntar";
    super(textureData, x, y, juego, animInicial, escala);
    this.cargarSpritesAnimados(textureData, escala);
    this.cambiarAnimacion(animInicial);
  }

  tick() {
    //TODO: hablar de deltatime
    this.posicion.x = this.juego.mouse.posicion.x;
    this.posicion.y = this.juego.mouse.posicion.y;
  }

  cargarSpritesAnimados(textureData, scale) {


    for (let key of Object.keys(textureData.animations)) {
      this.spritesAnimados[key] = new PIXI.AnimatedSprite(
        textureData.animations[key]
      );

      this.spritesAnimados[key].play();
      this.spritesAnimados[key].loop = true;
      this.spritesAnimados[key].animationSpeed = 0.05;
      this.spritesAnimados[key].scale.set(scale);
      this.spritesAnimados[key].anchor.set(0.5, 0.5);

      this.container.addChild(this.spritesAnimados[key]);
    }
  }

  cambiarDeSpriteAnimadoSegunAngulo(){

  }
}
