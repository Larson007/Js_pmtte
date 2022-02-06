import toastr from 'toastr';
import { sounds } from '../data/sounds'

export default class {
  constructor(name, elCard) {
    this.name = name || 'Anonyme';
    this.elCard = elCard;
    this.score = 0;
    this.time = 0;
    this.timeMin = 0.5;
    this.timeMax = 1.75;
    this.currentTime = 0;
    this.frameRate = 24;
    this.buff = null;
    this.multiplicator = 1;
    this.canPlay = true;
  }

  // Génère le code html d'un Player
  create() {
    // On change le code HTML de la carte par une carte player
    this.elCard.innerHTML = '';
    this.elCard.innerHTML += '<h2>' + this.name + '</h2>';
    this.elCard.innerHTML += '<div class="time" style="display: none;">' + this.time + '</div>';
    this.elCard.innerHTML += '<div class="loader"><div class="load"><div class="currentTime">0</div></div></div>';
    this.elCard.innerHTML += '<button class="push btn btn--bordered" style="display: none;">Push and hold me!</button>';
    this.elCard.innerHTML += '<div>Score: <span class="score">' + this.score + 'pts</span></div>';
    this.elCard.innerHTML += '<div class="scoreLoad"></div>';


    // On stocke les nouveaux éléments HTML dans des propriétés de l'objet pour pouvoir jouer avec par la suite
    this.elTime = this.elCard.querySelector('.time');
    this.elLoader = this.elCard.querySelector('.loader');
    this.elLoad = this.elCard.querySelector('.load');
    this.elCurrentTime = this.elCard.querySelector('.currentTime');
    this.elPush = this.elCard.querySelector('.push');
    this.elScore = this.elCard.querySelector('.score');
    this.elScoreLoad = this.elCard.querySelector('.scoreLoad');

    this.elPush.addEventListener('mousedown', this.push.bind(this));
    this.elPush.addEventListener('mouseup', this.release.bind(this));
  }

  // Met à jour les données sur l'interface utilisateur
  render() {
    // Utilisation du shorcut pour remplacer la propriété innerHTML de l'élément avec l'ID "time"
    this.elTime.innerText = this.time + 's';
    // Utilisation du shorcut pour remplacer la propriété innerHTML de l'élément avec l'ID "currentTime"
    this.elCurrentTime.innerText = this.currentTime + 's';
    // Utilisation du shorcut pour remplacer la propriété innerHTML de l'élément avec l'ID "score"
    this.elScore.innerText = this.score + 'pts';
  }

  // Animations CSS des cartes
  animate(name, duration, timingFunction, delay, iterationCount, direction, fillMode) {
    let fName = name || 'shake',
      fDuration = duration || '1s',
      fTimingFunction = timingFunction || 'linear',
      fDelay = delay || '0s',
      fIterationCount = iterationCount || '1',
      fDirection = direction || 'normal',
      fFillMode = fillMode || 'both';

    this.elCard.style.animation = fName + ' ' + fDuration + ' ' + fTimingFunction + ' ' + fDelay + ' ' + fIterationCount + ' ' + fDirection + ' ' + fFillMode;
  }

  // Gère la pression sur le bouton de la souris
  push() {
    let self = this;
    this.counter = setInterval(function () {
      // Mise à jour du compteur
      self.currentTime = Math.round((self.currentTime + self.frameRate / 1000) * 100) / 100;

      // Mise à jour de la hauteur de la barre
      if (self.elLoad.offsetHeight < self.elLoader.offsetHeight) {
        self.elLoad.style.height = self.elLoader.offsetHeight / self.time * self.currentTime + 'px';
      }

      // Mise à jour de l'interface utilisateur
      self.render();
    }, this.frameRate);
  }

  // Gère le relâchement de la pression sur le bouton de la souris
  release() {
    clearInterval(this.counter);

    if (this.currentTime > this.time) {
      toastr.info('Too far!');
    }
    else {
      toastr.info('You won but you could\'ve stand ' + (Math.round((this.time - this.currentTime) * 100) / 100) + ' more seconds !');
    }

    this.points();
  }

  // Calcul des points à la fin d'un tour
  points() {
    let roundScore = 0;

    if (this.currentTime <= this.time / 2) {
      roundScore = 10;
    } else {
      if (this.currentTime > this.time) {
        roundScore = this.score / -2;
        this.animate();
      }
      else {
        if (this.currentTime === this.time) {
          roundScore = 200;
          toastr.info('P.E.R.F.E.C.T.!');
          sounds.perfect.play();
          this.animate('bounce');
        }
        else {
          let loadHeight = parseInt(this.elLoad.offsetHeight);
          let loaderHeight = parseInt(this.elLoader.offsetHeight);
          let x = (loadHeight - (loaderHeight / 2)) / (loaderHeight / 2) * 100;

          roundScore = Math.round(Math.exp((0.0460509) * x) * 100) / 100;
          roundScore = (roundScore <= 90) ? roundScore + 10 : roundScore;
        }
      }
    }

    this.score += roundScore * this.multiplicator;
    this.score = Math.round(this.score);

    this.render();
  }

  // Calcul la hauteur de la barre de score en fonction de la taille de la carte et des points maximum
  pointsLoad(maxScore) {
    this.maxScore = maxScore;

    this.elScoreLoad.style.minHeight = (this.elCard.offsetHeight / maxScore * this.score) + 'px';
  }

  // Définit le temps max pour chaque player par tour
  setTime() {
    this.time = Math.round((Math.random() * (this.timeMax - this.timeMin) + this.timeMin) * 100) / 100;
    this.elTime.style.display = 'block';
    this.render();
  }

  applyBuff() {
    if (this.buff === null) return;

    switch (this.buff.id) {
      case 0:
        this.time /= 2;
        break;

      case 1:
        this.time *= 2;
        break;

      case 2:
        this.animate('flash', '1s', 'linear', '0s', 'infinite');
        break;

      case 3:
        this.multiplicator = 2;
        break;
      
      case 4:
        this.score += 50;
        this.pointsLoad(this.maxScore);
        break;
        
      case 5:
        this.score -= 50;
        this.pointsLoad(this.maxScore);
        break;
      
      case 6:
          this.canPlay = false;
          break;
    }

    if (this.buff.bonus) {
      toastr.success('You got a buff!', this.buff.infos, { timeOut: 120000 });
    }
    else {
      toastr.error('You got a debuff!', this.buff.infos, { timeOut: 120000 });
    }

    this.render();
  }

  // Réinitialise les données pour un nouveau Round
  reset() {
    this.currentTime = 0;
    this.elLoad.style.height = 0;
    this.multiplicator = 1;
    this.canPlay = true;
    this.animate('none');
    this.render();
  }
}