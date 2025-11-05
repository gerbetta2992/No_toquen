class Celebridad extends Persona {


  ansiedad = 0;
  acosadores = [];
  constructor(textureData, x, y, juego) {
    const escala = 2;
    const animInicial = "caminar";
    super(textureData, x, y, juego,animInicial, escala);
    this.distanciaPersonal = 100;
  }


  render(){
    super.render();
  }

  tick(){
    super.tick();
    this.calcularAnsiedad();
    this.enloquecer();
    this.limitarAnsiedad();
  }

  calcularAnsiedad(){
    for(let persona of this.juego.personas){
      if (calcularDistancia(this.posicion, persona.posicion) <= this.distanciaPersonal && persona != this && persona.estado == "comoLoquita"){
        this.acosadores.push(persona);
        //if (this.acosadores.length < 3)
          this.ansiedad += 0.1;
      }
      else{
        this.acosadores = this.acosadores.filter(p => p !== persona);
      }
    }
    if (this.acosadores.length == 0){
      this.ansiedad -= 0.1;
    }
  }

  enloquecer(){
    if (this.ansiedad <= 100)
      this.desquiciar = true;
  }
  
  huirDePos(pos){
    let distAlPuntoDeHuida = calcularDistancia(pos, this.posicion)
    if (distAlPuntoDeHuida < this.vision){
      
      this.miedo += 50/distAlPuntoDeHuida
      this.puntoDeHuida = pos;
    }
  }

  limitarAnsiedad(){
    this.ansiedad = Math.max(0, Math.min(this.ansiedad, 100));
  }
}

