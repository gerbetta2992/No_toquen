class Persona extends GameObject {

  constructor(textureData, x, y, juego) {
    const escala = 1;
    const animInicial = "correr";
    super(textureData, x, y, juego,animInicial, escala);
    this.cargarSpritesAnimados(textureData, escala);
    this.cambiarAnimacion(animInicial);
  }

  getOtrosConejitos() {
    return this.juego.conejitos;
  }

  
  cargarSpritesAnimados(textureData, scale) {

    for (let key of Object.keys(textureData.animations)) {
      this.spritesAnimados[key] = new PIXI.AnimatedSprite(
        textureData.animations[key]
      );

      this.spritesAnimados[key].play();
      this.spritesAnimados[key].loop = true;
      this.spritesAnimados[key].animationSpeed = 1;
      this.spritesAnimados[key].scale.set(scale);
      this.spritesAnimados[key].anchor.set(0.5, 0.5);

      this.container.addChild(this.spritesAnimados[key]);
    }
  }
}
