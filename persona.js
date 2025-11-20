class Persona extends GameObject {
  escala = 1.5;
  posMin = 525;
  posMax = 925;
  asesinado;
  intervalId;
  fanatismo;
  miedo = 0;
  
  constructor(textureData, x, y, juego) {
    const escala = 1;
    const velAnim = Math.floor(Math.random() +1);;
    const animInicial = "correr";
    super(textureData, x, y, juego,animInicial, escala);
    this.cargarSpritesAnimados(textureData, escala, velAnim);
    this.cambiarAnimacion(animInicial, velAnim);
    this.movimientoErratico();
    this.inicializarFanatismo();
    this.distanciaPersonal = 20;
  }

// ----------------------------- Manejo del movimiento --------------------------


  moverSegunVelocidad(){
    const newPosX = this.velocidad.x * this.juego.pixiApp.ticker.deltaTime;
    const newPosY = this.velocidad.y * this.juego.pixiApp.ticker.deltaTime;

    let newPos = {x: newPosX + this.posicion.x, y: newPosY + this.posicion.y}

      for (let zona of this.juego.zonasBloqueadas){
        if (this.juego.dentroDeRect(newPos, zona)) {
          if (this.estado != "asustado"){
            if (this.posicion.x < zona.x && newPos.x >= zona.x) {
              this.movimientoContrario(-1, (Math.random() * 2 - 1));
              newPos.x = zona.x - 1;
            } else if (this.posicion.x > zona.x + zona.width && newPos.x <= zona.x + zona.width) {
              this.movimientoContrario(1, (Math.random() * 2 - 1));
              newPos.x = zona.x + zona.width + 1;
            }

            if (this.posicion.y < zona.y && newPos.y >= zona.y) {
              this.movimientoContrario((Math.random() * 2 - 1), -1);
              newPos.y = zona.y - 1;
            }
            else if (this.posicion.y > zona.y + zona.height && newPos.y <= zona.y + zona.height){
              this.movimientoContrario((Math.random() * 2 - 1), 1);
              newPos.y = zona.y + zona.height + 1;
            }
          }
          else{
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
    }
    this.posicion = newPos;
  }

  ciclo(){
      if (Math.random() > 0.6) {

        let direccion = {
          x: Math.random() * 2 - 1,
          y: Math.random() * 2 - 1
        };
        direccion = limitarVector(direccion, 1);

        this.aceleracion.x = direccion.x;
        this.aceleracion.y = direccion.y;

        const duracionMovimiento = Math.random() * 3000 + 5000;
        this.intervalId = setTimeout(() => {
         this.ciclo(); 
        }, duracionMovimiento);

      } 
      else {
        this.aceleracion.x = 0;
        this.aceleracion.y = 0;
        this.velocidad.x = 0;
        this.velocidad.y = 0;

        const duracionPausa = Math.random() * 2000 + 1000;
        this.intervalId = setTimeout(() => {
         this.ciclo(); 
        }, duracionPausa);
      }
  };

  movimientoErratico() {
    if (this.asesinado || this.intervalId) return;
    this.ciclo();
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

    const duracionMovimiento = Math.random() * 3000 + 5000;
        this.intervalId = setTimeout(() => {
          this.ciclo(); 
        }, duracionMovimiento);

  }

  cancelarMovimientoErratico(){
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      //console.log("Movimiento errático detenido" + this.intervalId);
    }
  }

  rebotarContraBordes() {
    if (!this.reboteCooldown){
      if (this.posicion.x >= this.juego.width - 50) {
        this.movimientoContrario(-1, (Math.random() - Math.random()));

      } else if (this.posicion.x <= 0 + 50) {
        this.movimientoContrario(1, (Math.random() - Math.random()));
      }
      if (this.posicion.y >= this.juego.height - 100) {
        this.movimientoContrario( (Math.random() - Math.random()), -1);

      } else if (this.posicion.y <= 0 + 100) {
        this.movimientoContrario((Math.random() - Math.random()), 1);
      }
      this.reboteCooldown = true;
      setTimeout(() => {
        this.reboteCooldown = false;
      }, 50);
    }
   
  }

  huirDeMuerto(){
    if(this.asesinado)
      return;
    for (let persona of this.juego.personas) {
      if (this != persona) {
        if (
          calcularDistancia(this.posicion, persona.posicion) < this.vision && persona.asesinado == true
        ) {
          huirDePos(persona.posicion);
        }
      }
    }
  }

  huirDePos(pos){
    let distAlPuntoDeHuida = calcularDistancia(pos, this.posicion)
    if (distAlPuntoDeHuida < this.vision){
      
      this.miedo += 2000/distAlPuntoDeHuida
      this.puntoDeHuida = pos;
      
    }
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

  perseguir() {
    if (this.estado != "comoLoquita") return;
    
    const dist = calcularDistancia(this.posicion, this.juego.celebridad.posicion);
    if (dist > this.vision) return;
    //this.distanciaPersonal = 10;
    // Decaimiento exponencial: va de 1 a 0 a medida que se acerca
    let factor = Math.pow(dist / this.distanciaParaLlegar, 3);

    const difX = this.juego.celebridad.posicion.x - this.posicion.x;
    const difY = this.juego.celebridad.posicion.y - this.posicion.y;

    let vectorTemporal = {
      x: -difX,
      y: -difY,
    };
    vectorTemporal = limitarVector(vectorTemporal, 1);

    this.aceleracion.x += -vectorTemporal.x * factor;
    this.aceleracion.y += -vectorTemporal.y * factor;
  }

  escapar() {
    if (this.asesinado) return;
    
    if (!this.puntoDeHuida || this.estado != "asustado") {
      return;
    }
    let dist = calcularDistancia(this.posicion, this.puntoDeHuida)
    if (this.puntoDeHuida != undefined)
      
    this.miedo -= dist*0.00001;
    let factor = 1;

    const difX = this.puntoDeHuida.x - this.posicion.x;
    const difY = this.puntoDeHuida.y - this.posicion.y;

    let vectorTemporal = {
      x: -difX,
      y: -difY,
    };
    vectorTemporal = limitarVector(vectorTemporal, 1);

    this.aceleracion.x += vectorTemporal.x * factor;
    this.aceleracion.y += vectorTemporal.y * factor;

  }



// ----------------------- Manejo de Renderizacion de los Sprites --------------------
  randomPastelColor() {
    const r = 225 + Math.floor(Math.random() * 30); // 200–255
    const g = 225 + Math.floor(Math.random() * 30);
    const b = 225 + Math.floor(Math.random() * 30);
    return (r << 16) + (g << 8) + b;
  }
  cargarSpritesAnimados(textureData, escala, velAnim) {

    for (let key of Object.keys(textureData.animations)) {
      this.spritesAnimados[key] = new PIXI.AnimatedSprite(textureData.animations[key]);

      this.spritesAnimados[key].loop = ["correr","caminar"].includes(key);

      this.spritesAnimados[key].animationSpeed = velAnim;
      this.spritesAnimados[key].scale.set(escala);
      this.spritesAnimados[key].anchor.set(0.5, 1);

      this.spritesAnimados[key].tint = this.randomPastelColor();
      this.container.addChild(this.spritesAnimados[key]);

    }
    //console.log(textureData);
  }
  voltearPersona(escala) {
      //0 grados es a la izquierda, 180 a la derecha, 90 arriba, 270 abajo
      //const moving = calcularDistancia(this.posicion, this.target.posicion) > 200;
      
      if (this.angulo > 90 && this.angulo < 270){
        this.spritesAnimados[this.animacionActual].scale.x = escala;
      }
      else{
        this.spritesAnimados[this.animacionActual].scale.x = -escala;
      }
  }

  escalarPorPerspectiva(){
    for (let persona of this.juego.personas) {
      
      persona.container.scale.y = persona.posicion.y / this.posMax;
      persona.container.scale.x = persona.posicion.y / this.posMax;

      persona.container.scale.x = Math.max(0.5, Math.min(persona.container.scale.x, 0.7));
      persona.container.scale.y = Math.max(0.5, Math.min(persona.container.scale.y, 0.7));
    }

  }

  cambiarAnimacionSegunEvento(){
      let correr = (this.target || this.perseguido || this.estado == "asustado") && !this.asesinado;
      let caminar = !this.target && !this.perseguido && this.estado != "asustado" && !this.asesinado;
      let idle = this.aceleracion.x == 0 && this.aceleracion.y == 0 && this.estado != "asustado" && !this.asesinado;
      let saltar = false;
      let muerte = this.asesinado;
      let animName, velAnim;
      
      if (muerte){
        animName = "muerte"
      }
      else if (idle){
        animName = "idle";
      }
      else if (caminar){
        if (this.intervalId == null)
          this.movimientoErratico();
        animName = "caminar";
        velAnim = 0.5;
      }
      else if (correr){
        this.cancelarMovimientoErratico();
        animName = "correr";
        velAnim = 1;
      }
      else if (saltar){
        animName = "saltar";
        velAnim = 1;
      }
      
      this.cambiarAnimacion(animName, velAnim);
  }

  cancelarMovimiento(){
    this.velocidadMaxima = 0;
    this.aceleracion.x = 0;
    this.aceleracion.y = 0;
    this.velocidad.x = 0;
    this.velocidad.y = 0;
  }


// ----------------- Calculos de Variables -------------------------
  inicializarFanatismo(){
    this.fanatismoInicial = Math.min(Math.random() * 100, 50);
    this.fanatismo = this.fanatismoInicial;
  }

  calcularFanatismo(){
    if (calcularDistancia(this.posicion, this.juego.celebridad.posicion) < this.vision){
      this.fanatismo += 0.1;
    }
    else{
      this.fanatismo -= 0.1;
    }
    //console.log("Fanatismo:", this.fanatismo);
    this.limitarFanatismo();
  }

  reducirMiedoConElTiempo(){
    this.miedo -= 0.01
  }

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
  limitarPosicion(minY, maxY){
    this.posicion.y = Math.max(minY, Math.min(this.posicion.y, maxY));
  }

  limitarVelocidad() {
    this.velocidad = limitarVector(this.velocidad, this.velocidadMaxima);
    if (this.spritesAnimados["caminar"].visible == true){
      this.velocidadMaxima = 1;
    }
    else if (this.spritesAnimados["correr"].visible == true){
      this.velocidadMaxima = 3;
    }
  }

  limitarFanatismo(){
    this.fanatismo = Math.max(this.fanatismoInicial, Math.min(this.fanatismo, 100));
  }

  limitarMiedo(){
    this.miedo = Math.max(Math.random() * 2, Math.min(this.miedo, 10));
  }


  render(){
    super.render();
    this.cambiarAnimacionSegunEvento();
    this.voltearPersona(this.escala);
    
  }

  tick(){
    super.tick();
    this.limitarVelocidad();
    //this.limitarPosicion(this.posMin,this.posMax);
    this.moverSegunVelocidad();
    this.rebotarContraBordes();
    this.separacion();
    this.escapar();
    this.perseguir();
    this.reducirMiedoConElTiempo();
    //this.escalarPorPerspectiva();
    this.calcularFanatismo();
    this.calcularEstado();
    this.limitarMiedo();
    this.container.zIndex = this.posicion.y;
  }


}

