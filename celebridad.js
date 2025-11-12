class Celebridad extends Persona {


  ansiedad = 0;
  acosadores = [];
  objetivo;
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

  separacion() {
    if (this.asesinado)
      return;

    let promedioDePosicionDeAquellosQEstanMuyCercaMio = { x: 0, y: 0 };
    let contador = 0;

    for (let persona of this.juego.personas) {
      if (this != persona) {
        if (
          calcularDistancia(this.posicion, persona.posicion) < this.distanciaPersonal
        ) {
          contador++;
          promedioDePosicionDeAquellosQEstanMuyCercaMio.x += persona.posicion.x;
          promedioDePosicionDeAquellosQEstanMuyCercaMio.y += persona.posicion.y;
        }
      }
    }

    if (contador == 0) return;

    promedioDePosicionDeAquellosQEstanMuyCercaMio.x /= contador;
    promedioDePosicionDeAquellosQEstanMuyCercaMio.y /= contador;

    let vectorQueSeAlejaDelPromedioDePosicion = {
      x: this.posicion.x - promedioDePosicionDeAquellosQEstanMuyCercaMio.x,
      y: this.posicion.y - promedioDePosicionDeAquellosQEstanMuyCercaMio.y,
    };

    vectorQueSeAlejaDelPromedioDePosicion = limitarVector(
      vectorQueSeAlejaDelPromedioDePosicion, 1
    );

    const factor = 1;
    if (this.estado == "asustado") {

      let dir = {
        x: vectorQueSeAlejaDelPromedioDePosicion.x,
        y: vectorQueSeAlejaDelPromedioDePosicion.y
      };
      let dist = Math.hypot(dir.x, dir.y);
      
      const radioDeseado = 100;
      if (dist < radioDeseado) {
        // Vector perpendicular a la dirección hacia el objetivo (para orbitar)
        const sentido = (this.posicion.x < vectorQueSeAlejaDelPromedioDePosicion.x) ? 1 : -1;
        const tangente = { x: -dir.y * sentido, y: dir.x * sentido };
        const tangenteNorm = limitarVector(tangente, 1);
        
        this.aceleracion.x += tangenteNorm.x * factor;
        this.aceleracion.y += tangenteNorm.y * factor;
      } 
    } else {
      this.aceleracion.x += vectorQueSeAlejaDelPromedioDePosicion.x * factor;
      this.aceleracion.y += vectorQueSeAlejaDelPromedioDePosicion.y * factor;
    }
    
  }

  rebotarContraBordes(){

  }

  movimientoContrario(direccionX,direccionY){
      clearTimeout(this.intervalId);
      var difX = direccionX;
      var difY = direccionY;

      let vectorTemporal = {
        x: -difX,
        y: -difY,
      };
      vectorTemporal = limitarVector(vectorTemporal, 1);

      this.aceleracion.x += -vectorTemporal.x;
      this.aceleracion.y += -vectorTemporal.y;

    const duracionMovimiento = Math.random() * 1000;
        this.intervalId = setTimeout(() => {
          this.ciclo(); 
        }, duracionMovimiento);

  }

  ciclo() {
    if (this.objetivo){
    }
    else{
      this.intervalId = undefined;
      const puntosLibres = this.juego.generarPuntosNoBloqueados(this.juego.zonasBloqueadas, 1, 2500, 1200);
      this.objetivo = {posicion: { x: puntosLibres[0].x, y: puntosLibres[0].y }};
      console.log(this.objetivo.posicion);
    }
    
    const graphics = new PIXI.Graphics();
    graphics.beginFill(0xff0000, 0.3); // rojo transparente
    graphics.drawRect(
      this.objetivo.posicion.x,
      this.objetivo.posicion.y,
      100,
      100
    );
    graphics.endFill();
    this.juego.mundoContainer.addChild(graphics);

    const dx = this.objetivo.posicion.x - this.posicion.x;
    const dy = this.objetivo.posicion.y - this.posicion.y;

    const distancia = Math.hypot(dx, dy);

    let direccion = { x: dx / distancia, y: dy / distancia };

    direccion = limitarVector(direccion, 1);

    this.aceleracion.x += direccion.x * 10000;
    this.aceleracion.y += direccion.y * 10000;
    
    if (calcularDistancia(this.posicion, this.objetivo.posicion) < 1){
      this.aceleracion.x = 0;
      this.aceleracion.y = 0;
      this.velocidad.x = 0;
      this.velocidad.y = 0;
      const duracionPausa = Math.random() *2000 + 2000;
      this.intervalId = setTimeout(() => {
        this.objetivo = undefined;
        this.ciclo();
      }, duracionPausa);
    }
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
    if (this.ansiedad >= 100)
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

