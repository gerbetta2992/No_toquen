class Arbol extends GameObject {
  escala = 1;
  posMin = 525;
  posMax = 925;
  asesinado;
  intervalId;
  fanatismo;
  miedo = 0;
  constructor(textureData, x, y, juego) {
    const escala = 1;
    const velAnim = 1;
    const animInicial = "correr";
    super(textureData, x, y, juego,animInicial, escala);
    this.teclas = {};
    this.cargarSprites(textureData);
    //this.cambiarAnimacion(animInicial);
  }

// ----------------------------- Manejo del movimiento --------------------------


// ----------------------- Manejo de Renderizacion de los Sprites --------------------

  cargarSprites(textureData) {
    //console.log(textureData)
    this.sprite = new PIXI.Sprite(textureData);
    this.sprite.x = this.posicion.x;
    this.sprite.y = this.posicion.y;
    this.sprite.anchor.set(0.5, 1);
    this.sprite.scale.set(this.escala);
    this.container.addChild(this.sprite);
    
    }

// ----------------- Calculos de Variables -------------------------

  render(){
    this.container.zIndex = this.posicion.y;
    this.container.visible = true;
  }
  tick(){
    super.tick();
  }

}

