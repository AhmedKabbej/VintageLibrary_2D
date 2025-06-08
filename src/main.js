import './style.css'
import gsap from "gsap";


class SphereGallery {
  constructor({
    sphereId = "sphere",
    imageCount = 150,
    radius = 350,
    imagePattern = "/image", // base url + numéro + extension
    imageExtension = ".jpg",
    btnId = "tvNoiseBtn",
    soundId = "sound1",
    startBtnId = "startBtn",
    introScreenId = "introScreen",
    introVideoId = "introVideo",
  } = {}) {
    // DOM
    this.sphere = document.getElementById(sphereId);
    this.btn = document.getElementById(btnId);
    this.sound = document.getElementById(soundId);
    this.startBtn = document.getElementById(startBtnId);
    this.introScreen = document.getElementById(introScreenId);
    this.introVideo = document.getElementById(introVideoId);

    // Configuration
    this.imageCount = imageCount;
    this.radius = radius;
    this.imagePattern = imagePattern;
    this.imageExtension = imageExtension;

    // Données internes
    this.tiles = [];
    this.mouseX = 0;
    this.mouseY = 0;
    this.currentX = 0;
    this.currentY = 0;
    this.activeTile = null;

    // Initialisation
    this.createTiles();
    this.addTileClickListeners();
    this.addDocumentListeners();
    this.setupAnimationLoop();
    this.setupSoundToggle();
    this.setupStartButton();
  }

  createTiles() {
    for (let i = 0; i < this.imageCount; i++) {
      const tile = document.createElement("div");
      tile.className = "tile";
      tile.style.backgroundImage = `url(${this.imagePattern}${(i % 5) + 1}${this.imageExtension})`;

      const phi = Math.acos(-1 + (2 * i) / this.imageCount);
      const theta = Math.sqrt(this.imageCount * Math.PI) * phi;

      const x = this.radius * Math.cos(theta) * Math.sin(phi);
      const y = this.radius * Math.sin(theta) * Math.sin(phi);
      const z = this.radius * Math.cos(phi);

      tile.dataset.x = x;
      tile.dataset.y = y;
      tile.dataset.z = z;

      tile.style.pointerEvents = "auto";

      this.sphere.appendChild(tile);
      this.tiles.push(tile);
    }
  }

  addTileClickListeners() {
    this.tiles.forEach(tile => {
      tile.addEventListener("click", (e) => {
        e.stopPropagation();
        if (this.activeTile === tile) {
          this.activeTile = null;
          this.resetTiles();
        } else {
          this.activeTile = tile;
          this.highlightTile(tile);
        }
      });
    });
  }

  addDocumentListeners() {
    document.addEventListener("click", () => {
      if (this.activeTile !== null) {
        this.activeTile = null;
        this.resetTiles();
      }
    });

    document.addEventListener("mousemove", (e) => {
      this.mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      this.mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });
  }

  setupAnimationLoop() {
    gsap.ticker.add(() => {
      this.currentX += (this.mouseX - this.currentX) * 0.05;
      this.currentY += (this.mouseY - this.currentY) * 0.05;

      const rotationY = this.currentX * 180;
      const rotationX = this.currentY * 180;

      const radX = (rotationX * Math.PI) / 180;
      const radY = (rotationY * Math.PI) / 180;

      const cosY = Math.cos(radY);
      const sinY = Math.sin(radY);
      const cosX = Math.cos(radX);
      const sinX = Math.sin(radX);

      this.tiles.forEach(tile => {
        const x = parseFloat(tile.dataset.x);
        const y = parseFloat(tile.dataset.y);
        const z = parseFloat(tile.dataset.z);

        let dx = x * cosY - z * sinY;
        let dz = x * sinY + z * cosY;
        let dy = y * cosX - dz * sinX;
        dz = y * sinX + dz * cosX;

        const baseScale = 1 + dz / 800;
        const baseOpacity = 0.5 + dz / 800;

        if (this.activeTile) {
          if (tile === this.activeTile) {
            tile.style.transform = `translate3d(${dx}px, ${dy}px, ${dz}px) scale(1.3)`;
            tile.style.zIndex = 1000;
            tile.style.filter = "none";
            tile.style.opacity = 1;
          } else {
            tile.style.transform = `translate3d(${dx}px, ${dy}px, ${dz}px) scale(0.7)`;
            tile.style.zIndex = 0;
            tile.style.filter = "blur(1.2px)";
            tile.style.opacity = 0.4;
          }
        } else {
          tile.style.transform = `translate3d(${dx}px, ${dy}px, ${dz}px) scale(${baseScale})`;
          tile.style.zIndex = Math.floor(dz);
          tile.style.filter = "none";
          tile.style.opacity = baseOpacity;
        }
      });
    });
  }

  resetTiles() {
    this.tiles.forEach(tile => {
      gsap.to(tile, {
        scale: 1,
        filter: "none",
        opacity: 1,
        duration: 0.3,
        ease: "power3.out",
        onUpdate: () => {
          const x = parseFloat(tile.dataset.x);
          const y = parseFloat(tile.dataset.y);
          const z = parseFloat(tile.dataset.z);

          const radX = (this.currentY * 180 * Math.PI) / 180;
          const radY = (this.currentX * 180 * Math.PI) / 180;

          const cosY = Math.cos(radY);
          const sinY = Math.sin(radY);
          const cosX = Math.cos(radX);
          const sinX = Math.sin(radX);

          let dx = x * cosY - z * sinY;
          let dz = x * sinY + z * cosY;
          let dy = y * cosX - dz * sinX;
          dz = y * sinX + dz * cosX;

          const scale = 1 + dz / 800;

          tile.style.transform = `translate3d(${dx}px, ${dy}px, ${dz}px) scale(${scale})`;
          tile.style.zIndex = Math.floor(dz);
        }
      });
    });
  }

  highlightTile(tile) {
    // Fonction potentiellement étendue pour animations ponctuelles sur tile active
  }

  setupSoundToggle() {
    if (!this.btn || !this.sound) return;

    this.btn.addEventListener("click", () => {
      if (this.sound.paused) {
        this.sound.play();
        this.btn.textContent = "Stop Sound";
      } else {
        this.sound.pause();
        this.btn.textContent = "Play Sound";
      }
    });
  }

  setupStartButton() {
    if (!this.startBtn || !this.introScreen || !this.introVideo) return;

    this.startBtn.addEventListener("click", () => {
      this.introVideo.style.transition = "filter 1.5s ease-out, opacity 1.5s ease-out";
      this.introVideo.style.filter = "grayscale(1) contrast(0)";
      this.introVideo.style.opacity = "0";

      setTimeout(() => {
        this.introScreen.style.display = "none";
        this.sphere.style.visibility = "visible";
        this.sphere.style.opacity = "1";

        document.body.style.background = "transparent";
        document.body.style.overflow = "hidden";
      }, 1500);
    });
  }
}

// Instanciation de la classe (à faire dans ton fichier principal ou script)
const gallery = new SphereGallery();