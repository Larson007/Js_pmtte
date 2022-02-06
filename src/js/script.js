import Player from './class/Player';
import Round from './class/Round';
import toastr from 'toastr';

let self;

const game = {
  players: [],
  elConsole: document.getElementById('console'),
  elStart: document.getElementById('start'),

  init: function () {
    self = this;
    let buttonAdd = document.getElementsByClassName('player--add');

    this.elStart.addEventListener('click', self.start);

    for (let button = 0; button < buttonAdd.length; ++button) {
      buttonAdd[button].addEventListener('click', self.addPlayer);
    }
  },

  addPlayer: function () {
    let name = prompt('Nom du nouveau joueur ?', 'Player ' + (self.players.length + 1)),
      player = new Player(name, this);

    self.players.push(player);
    player.create();
    toastr.success('Welcome ' + name + '! Glad to see you again.');
    // On supprime l'écouteur sur la carte afin d'éviter la possibilité de créer plusieurs player d'affilé
    this.removeEventListener('click', self.addPlayer);
    // On supprime la  class .player--add de la carte, purement esthétique
    this.classList.remove('player--add');

    // Affiche la console avec le bouton start
    self.elConsole.style.display = 'block';
  },

  start: function () {
    let noPlayers = document.querySelectorAll('.player--add');
    
    for (let noPlayer = 0; noPlayer < noPlayers.length; noPlayer++) {
      noPlayers[noPlayer].remove();
    }

    new Round(self.players);
  }
}

game.init();