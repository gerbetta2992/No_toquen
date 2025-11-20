class Ciudad extends GameObject {

  constructor(textureData, x, y, juego) {
    const escala = 1;
    const animInicial = "ciudad";
    super(textureData, x, y, juego, animInicial, escala);
    this.cargarSprite(textureData, escala)
    
  }

  tick() {
    this.container.zIndex = -1000;
  }

  cargarSprite(textureData, scale) {
    const sprite = new PIXI.Sprite(textureData);
    sprite.scale.set(scale);
    sprite.anchor.set(0.5); 
    this.container.addChild(sprite);
    this.spriteActual = sprite;
  }
}
