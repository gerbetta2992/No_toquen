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
    this.timer -= this.juego.pixiApp.ticker.deltaTime;
    this.recrearObjetivo();
    this.moverAlObjetivo();
  }

  moverAlObjetivo(){
    if (!this.intervalId)
        this.ciclo();
  }

   moverSegunVelocidad(){
    const newPosX = this.velocidad.x * this.juego.pixiApp.ticker.deltaTime;
    const newPosY = this.velocidad.y * this.juego.pixiApp.ticker.deltaTime;
    let newPos = {x: newPosX + this.posicion.x, y: newPosY + this.posicion.y}
    for (let zona of this.juego.zonasBloqueadas){
      if (this.juego.dentroDeRect(newPos, zona)) {
        if (this.posicion.x < zona.x && newPos.x >= zona.x) {
          this.movimientoContrario(0, (Math.random() * 2 - 1));
          newPos.x = zona.x - 1;
        } else if (this.posicion.x > zona.x + zona.width && newPos.x <= zona.x + zona.width) {
          this.movimientoContrario(0, (Math.random() * 2 - 1));
          newPos.x = zona.x + zona.width + 1;
        }
        if (this.posicion.y < zona.y && newPos.y >= zona.y) {
          this.movimientoContrario((Math.random() * 2 - 1), 0);
          newPos.y = zona.y - 1;
        }
        else if (this.posicion.y > zona.y + zona.height && newPos.y <= zona.y + zona.height){
          this.movimientoContrario((Math.random() * 2 - 1), 0);
          newPos.y = zona.y + zona.height + 1;
        }
      }
    }
    this.posicion = newPos;
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

    const duracionMovimiento = Math.random() * 1000 + 1000;
    this.intervalId = setTimeout(() => {
      this.ciclo();
      this.intervalId = undefined;
    }, duracionMovimiento);
  }




  separacion() {
    if (this.asesinado)
      return;

    let promedioDePosicionDeAquellosQEstanMuyCercaMio = { x: 0, y: 0 };
    let contador = 0;

    for (let persona of this.juego.personas) {
      if (this != persona && !persona.asesinado) {
        if (calcularDistancia(this.posicion, persona.posicion) < this.distanciaPersonal) {
          this.desviado = true;
          contador++;
          promedioDePosicionDeAquellosQEstanMuyCercaMio.x += persona.posicion.x;
          promedioDePosicionDeAquellosQEstanMuyCercaMio.y += persona.posicion.y;
        }
      }
    }

    if (contador == 0){
      if (this.desviado){
        this.objetivoTemporal = this.juego.getNodoMasCercano(this.posicion.x, this.posicion.y, this.juego.nodos);
        if (this.obj && calcularDistancia(this.posicion, this.camino[this.caminoIndex]) < 100){
          this.calcularCamino(this.obj);
        }
        this.desviado = false;
      }
      return;
    } 
    
    promedioDePosicionDeAquellosQEstanMuyCercaMio.x /= contador;
    promedioDePosicionDeAquellosQEstanMuyCercaMio.y /= contador;

    let vectorQueSeAlejaDelPromedioDePosicion = {
      x: this.posicion.x - promedioDePosicionDeAquellosQEstanMuyCercaMio.x,
      y: this.posicion.y - promedioDePosicionDeAquellosQEstanMuyCercaMio.y,
    };

    vectorQueSeAlejaDelPromedioDePosicion = limitarVector(
      vectorQueSeAlejaDelPromedioDePosicion, 1
    );

    const factor = 10;

      let dir = {
        x: vectorQueSeAlejaDelPromedioDePosicion.x,
        y: vectorQueSeAlejaDelPromedioDePosicion.y
      };
      let dist = Math.hypot(dir.x, dir.y);
      
      if (dist < this.distanciaPersonal*2) {
        // Vector perpendicular a la dirección hacia el objetivo (para orbitar)
        const sentido = (this.posicion.x < vectorQueSeAlejaDelPromedioDePosicion.x) ? 1 : -1;
        const tangente = { x: -dir.y * sentido, y: dir.x * sentido };
        const tangenteNorm = limitarVector(tangente, 1);

        this.aceleracion.x += tangenteNorm.x  * factor;
        this.aceleracion.y += tangenteNorm.y * factor;
        
        const radial = limitarVector(dir, 1); 

        this.aceleracion.x += vectorQueSeAlejaDelPromedioDePosicion.x * factor*2;
        this.aceleracion.y += vectorQueSeAlejaDelPromedioDePosicion.y * factor*2;
      }  
  }

  recrearObjetivo(){
    if (this.timer <= 0){
      this.camino = undefined;
    }
  }

  
  calcularCamino(destino){
    const inicioNodo  = this.juego.getNodoMasCercano(this.posicion.x, this.posicion.y, this.juego.nodos);
    const destinoNodo = this.juego.getNodoMasCercano(destino.x, destino.y, this.juego.nodos);
    this.obj = destino;
    this.camino = this.juego.astar(inicioNodo, destinoNodo);

    if (!this.camino || this.camino.length === 0) return;
    this.caminoIndex = 0;

    //for (let i=0; i<this.camino.length; i++){
    //  const graphics = new PIXI.Graphics();
    //  graphics.beginFill(0xff0000, 0.3);
    //  graphics.drawRect(
    //    this.camino[i].x,
    //    this.camino[i].y,
    //    10,
    //    10
    //  );
    //  graphics.endFill();
    //  this.juego.mundoContainer.addChild(graphics);
    //}
  }

  generarPuntosNoBloqueados(zonasBloqueadas, cantidad, anchoMapa, altoMapa) {
  const puntos = [];

  while (puntos.length < cantidad) {
    const punto = {
      x: Math.random() * anchoMapa + 350,
      y: Math.random() * altoMapa + 350,
    };

    // Si el punto NO está dentro de ninguna zona bloqueada, lo agregamos
    const dentroDeZona = zonasBloqueadas.some(z =>
      punto.x >= z.x &&
      punto.x <= z.x + z.width &&
      punto.y >= z.y &&
      punto.y <= z.y + z.height
    );

    if (!dentroDeZona) {
      
      puntos.push(punto);
    }
  }
  return puntos;
  }

  ciclo() {
    
    if (!this.camino || this.camino.length === 0) {
      this.intervalId = undefined;
      this.timer = Math.random() * 500 + 5000;
      let condicion = true;
      let destino = {x:0,y:0};
      while(condicion){
        let puntosLibres = this.juego.generarPuntosNoBloqueados(
        this.juego.zonasBloqueadas, 1, 2200, 1100
        );
        destino = puntosLibres[0];
        if (calcularDistancia(this.posicion, destino) > 800){
          condicion = false;
        }
      }
      this.calcularCamino(destino);
      
    }
    
    this.proximoObjetivo = this.objetivoTemporal ?? this.camino[this.caminoIndex];
    
    const dx = this.proximoObjetivo.x - this.posicion.x;
    const dy = this.proximoObjetivo.y - this.posicion.y;

    const distancia = Math.hypot(dx, dy);

    let direccion = { x: dx / distancia, y: dy / distancia };

    direccion = limitarVector(direccion, 1);
    let factor = 1;
    this.aceleracion.x += direccion.x * factor;
    this.aceleracion.y += direccion.y * factor;
    if (distancia < 10) {
       if (this.objetivoTemporal && this.proximoObjetivo === this.objetivoTemporal) {
        this.objetivoTemporal = undefined;
        if (this.caminoIndex >= this.camino.length-1) 
          return;
    }
      this.caminoIndex++;

      if (this.caminoIndex >= this.camino.length) {
        // el NPC llegó al destino final
        this.caminoIndex = 0;
        this.obj = undefined;
        this.aceleracion.x = 0;
        this.aceleracion.y = 0;
        this.velocidad.x = 0;
        this.velocidad.y = 0;

        const pausa = Math.random() * 2000 + 3000;
        this.intervalId = setTimeout(() => {
          this.camino = undefined;
          console.log("balas ant", this.juego.patova.balas);
          let balasAntesDeCargar = this.juego.patova.balas;
          this.juego.patova.balas += Math.floor(Math.random() * 10 + 3);
          this.juego.recargarBalas(balasAntesDeCargar);
          console.log("balas dsp", this.juego.patova.balas); 
          this.ciclo();
        }, pausa);
      }
  }
}



  calcularAnsiedad(){
    for(let persona of this.juego.personas){
      if (calcularDistancia(this.posicion, persona.posicion) <= this.distanciaPersonal + 100 && persona != this && persona.estado == "comoLoquita"){
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

