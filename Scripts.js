const canvas = document.querySelector(".game");
const ctx = canvas.getContext("2d");

const button = document.querySelector(".left");

canvas.width = window.innerWidth*0.98;
canvas.height = window.innerHeight*0.984;

Canva_Centr = [canvas.width/2,canvas.height/2];
const Background = new Image();
Background.src = "background.png";
Background_Centr = [];

arraay=[];
arraay2=[];

Background.onload = () => {
    Background_Centr = [Background.width/2,Background.height/2];
    ctx.drawImage(Background, Canva_Centr[0]-Background_Centr[0], Canva_Centr[1]-Background_Centr[1]);
    button.value = "e";
    button.value = ctx.getImageData(568,396,1,1).data;
};

// player object
const player1 = {
    x: 100,
    y: 100,
    speed: 4,
    width:-7,
    height:-7
};
const Pl1_texture = new Image();
Pl1_texture.src = "player.png";
Pl1_texture.onload = () => {
    player1.width=Pl1_texture.width;
    player1.height=Pl1_texture.height;
};

const player2 = {
    x: 100,
    y: 100,
    size: 50,
    speed: 4
};

// keys state
const keys = {};

window.addEventListener("keydown", (e) => {
    keys[e.key.toLowerCase()] = true;
});

window.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
});

    

function Calcs() {
    //button.value = player1.x+", "+player1.y;
    // WASD movement
    if (keys["w"]) player1.y -= player1.speed;
    if (keys["s"]){
        colided = false;
        for (let i = player1.x; i < (player1.x+player1.width); i++) {
            /*
            if (Coliders.getImageData(i, player1.y+player1.height, 1, 1).data == [0, 0, 0, 255])
            {
                colided = true
            }*/
        }
        if (!(colided))
        {
            player1.y += player1.speed;
        }
    }

    if (keys["a"]) player1.x -= player1.speed;
    if (keys["d"]) player1.x += player1.speed;

    //playr 2 movement
    if (keys["i"]) player2.y -= player2.speed;
    if (keys["k"]) player2.y += player2.speed;
    if (keys["j"]) player2.x -= player2.speed;
    if (keys["l"]) player2.x += player2.speed;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(Background, Canva_Centr[0]-Background_Centr[0], Canva_Centr[1]-Background_Centr[1]);

    // draw player 1
    ctx.fillStyle = "red";
    ctx.drawImage(Pl1_texture, player1.x, player1.y);

    // draw player 2
    ctx.fillStyle = "yellow";
    ctx.fillRect(player2.x , player2.y, player2.size, player2.size);
}

function loop() {
    Calcs();
    draw();
    requestAnimationFrame(loop);
}

loop();

