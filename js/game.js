const KEY_MAP = {
    W: 87,
    S: 83,
    D: 68,
};

const ENEMY1_VEL_X = 5;
const ENEMY2_VEL_X = 3;
const FRIEND_VEL_X = 1;

function start() {
    $("#menu").hide();

    $("#background").append("<div id='player' class='anima1'></div>");
    $("#background").append("<div id='enemy1'  class='anima2'></div>");
    $("#background").append("<div id='enemy2'></div>");
    $("#background").append("<div id='friend'  class='anima3'></div>");

    $("#background").append("<div id='score'></div>");
    $("#background").append("<div id='energy'></div>");

    const game = {
        enemy1: { velocityX: ENEMY1_VEL_X },
        timer: setInterval(loop, 30),
        enemyPosY: getRandomYPosition(),
        canShoot: true,
        ended: false,
        timerExplosion: [],
        score: 0,
        friends: { lost: 0, saved: 0 },
        energy: 3,
        somDisparo: document.getElementById("somDisparo"),
        somExplosao: document.getElementById("somExplosao"),
        musica: document.getElementById("musica"),
        somGameover: document.getElementById("somGameover"),
        somPerdido: document.getElementById("somPerdido"),
        somResgate: document.getElementById("somResgate"),
    };

    // Listen to key press
    game.keyPressed = [];
    $(document).keydown(function(e) {
        game.keyPressed[e.which] = true;
    });

    $(document).keyup(function(e) {
        game.keyPressed[e.which] = false;
    });

    game.somGameover.pause();
    game.musica.play();
    // Game Loop

    function loop() {
        moveBackground();
        movePlayer(game);
        moveEnemy1(game);
        moveEnemy2();
        moveFriend();
        detectCollisions(game);
        score(game);
        energy(game);
    }
}

function playAgain() {
    $("#end").remove();
    start();
}

function energy(game) {
    const image = `imgs/energia${game.energy}.png`;
    $("#energy").css("background-image", `url(${image})`);
    if (game.energy === 0) {
        gameOver(game);
    }
}

function gameOver(game) {
    game.ended = true;
    game.musica.pause();
    game.somGameover.play();

    window.clearInterval(game.timer);
    game.timer = null;

    $("#player").remove();
    $("#enemy1").remove();
    $("#enemy2").remove();
    $("#friend").remove();

    $("#background").append("<div id='end'></div>");

    $("#end").html(
        "<h1> Game Over </h1><p>Sua pontuação foi: " +
        game.score +
        "</p>" +
        "<p id='play-again' class='button' onClick=playAgain()>Jogar Novamente</p>"
    );
}

function score(game) {
    $("#score").html(
        "<h2> Pontos: " +
        game.score +
        " Salvos: " +
        game.friends.saved +
        " Perdidos: " +
        game.friends.lost +
        "</h2>"
    );
}

function moveBackground() {
    const left = parseInt($("#background").css("background-position"));
    $("#background").css("background-position", left - 1);
}

function movePlayer(game) {
    if (game.keyPressed[KEY_MAP.W]) {
        const top = parseInt($("#player").css("top"));
        $("#player").css("top", top - 10);
        if (top <= 0) {
            $("#player").css("top", top + 10);
        }
    }

    if (game.keyPressed[KEY_MAP.S]) {
        const top = parseInt($("#player").css("top"));
        $("#player").css("top", top + 10);
        if (top >= 460) {
            $("#player").css("top", top - 10);
        }
    }

    if (game.keyPressed[KEY_MAP.D]) {
        if (!game.canShoot) {
            return;
        }
        shoot(game);
    }
}

function shoot(game) {
    game.canShoot = false;
    const top = parseInt($("#player").css("top"));
    const posX = parseInt($("#player").css("left"));
    const shootX = posX + 190;
    const shootY = top + 37;
    $("#background").append("<div id='shoot'></div");
    $("#shoot").css("top", shootY);
    $("#shoot").css("left", shootX);
    game.somDisparo.play();
    game.timerShoot = window.setInterval(moveShoot, 30);

    function moveShoot() {
        const posX = parseInt($("#shoot").css("left"));
        $("#shoot").css("left", posX + 15);

        if (posX > 900) {
            window.clearInterval(game.timerShoot);
            game.timerShoot = null;
            $("#shoot").remove();
            game.canShoot = true;
        }
    }
}

function moveEnemy1(game) {
    const posX = parseInt($("#enemy1").css("left"));
    $("#enemy1").css("left", posX - game.enemy1.velocityX);
    if (posX <= -256) {
        game.enemyPosY = getRandomYPosition();
        $("#enemy1").css("left", 694 + 256);
    }
    $("#enemy1").css("top", game.enemyPosY);
}

function moveEnemy2() {
    const posX = parseInt($("#enemy2").css("left"));
    $("#enemy2").css("left", posX - ENEMY2_VEL_X);

    if (posX <= -165) {
        $("#enemy2").css("left", 775 + 165);
    }
}

function moveFriend() {
    const posX = parseInt($("#friend").css("left"));
    $("#friend").css("left", posX + FRIEND_VEL_X);
    if (posX > 906) {
        $("#friend").css("left", 0);
    }
}

function detectCollisions(game) {
    const collisionEnemy1 = $("#player").collision($("#enemy1"));
    const collisionEnemy2 = $("#player").collision($("#enemy2"));
    const collisionShootEnemy1 = $("#shoot").collision($("#enemy1"));
    const collisionShootEnemy2 = $("#shoot").collision($("#enemy2"));
    const collisionEnemy2Friend = $("#enemy2").collision($("#friend"));
    const collisionFriend = $("#player").collision($("#friend"));

    // Enemy1
    if (collisionEnemy1.length > 0 || collisionShootEnemy1.length > 0) {
        const enemy1X = parseInt($("#enemy1").css("left"));
        const enemy1Y = parseInt($("#enemy1").css("top"));
        explosion(1, enemy1X, enemy1Y, game);
        changeEnemy1Position(game);
        game.somExplosao.play();
    }

    // Enemy 2
    if (collisionEnemy2.length > 0 || collisionShootEnemy2.length > 0) {
        const enemy2X = parseInt($("#enemy2").css("left"));
        const enemy2Y = parseInt($("#enemy2").css("top"));
        explosion(2, enemy2X, enemy2Y, game);
        $("#enemy2").remove();
        changeEnemy2Position(game);
        game.somExplosao.play();
    }

    if (collisionEnemy1.length > 0 || collisionEnemy2.length > 0) {
        game.energy--;
    }

    if (collisionShootEnemy1.length > 0) {
        $("#shoot").css("left", 950);
        game.score = game.score + 100;
        game.enemy1.velocityX = game.enemy1.velocityX + 0.3;
    }
    if (collisionShootEnemy2.length > 0) {
        $("#shoot").css("left", 950);
        game.score = game.score + 50;
    }

    if (collisionFriend.length > 0) {
        $("#friend").remove();
        game.friends.saved++;
        changeFriendPosition(game);
        game.somResgate.play();
    }

    if (collisionEnemy2Friend.length > 0) {
        const friendX = parseInt($("#friend").css("left"));
        const friendY = parseInt($("#friend").css("top"));
        explosion(3, friendX, friendY, game);
        $("#friend").remove();
        game.friends.lost++;
        changeFriendPosition(game);
        game.somPerdido.play();
    }
}

function explosion(type, posX, posY, game) {
    const divID = `explosion${type}`;
    const image = type === 3 ? "imgs/amigo_morte.png" : "imgs/explosao.png";
    const className = type === 3 ? "anima4" : "";
    $("#background").append(`<div id='${divID}' class='${className}'></div`);

    const div = $(`#${divID}`);
    div.css("background-image", `url(${image})`);
    div.css("top", posY);
    div.css("left", posX + 40);
    if (type !== 3) {
        div.animate({ width: 200, opacity: 0 }, "slow");
    }

    game.timerExplosion[type] = window.setInterval(removeExplosion, 1000);

    function removeExplosion() {
        div.remove();
        window.clearInterval(game.timerExplosion[type]);
        game.timerExplosion[type] = null;
    }
}

function changeEnemy1Position(game) {
    game.enemyPosY = getRandomYPosition();
    $("#enemy1").css("left", 694 + 256);
    $("#enemy1").css("top", game.enemyPosY);
}

function changeEnemy2Position(game) {
    game.timerEnemy2 = window.setInterval(changePosition2, 5000);

    function changePosition2() {
        window.clearInterval(game.timerEnemy2);
        game.timerEnemy2 = null;
        if (game.ended === false) {
            $("#background").append("<div id='enemy2'></div");
        }
    }
}

function changeFriendPosition(game) {
    game.timerFriend = window.setInterval(changePositionF, 6000);

    function changePositionF() {
        window.clearInterval(game.timerFriend);
        game.timerFriend = null;
        if (game.ended === false) {
            $("#background").append("<div id='friend' class='anima3'></div>");
        }
    }
}

function getRandomYPosition() {
    return parseInt(Math.random() * 320);
}