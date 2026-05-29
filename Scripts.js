const Scene = document.querySelector(".game"); //canvas
const graphic = Scene.getContext("2d"); //ctx

const buttonLeft = document.querySelector(".left");
const buttonRight = document.querySelector(".right");

Scene.width = window.innerWidth*0.98;
Scene.height = window.innerHeight*0.984;

const Background = new Image();
Background.src = "Textures/Map/background.png";

const Coliders = document.createElement("canvas");
const Coliders_graphic = Coliders.getContext("2d");

Coliders.width = Scene.width;
Coliders.height = Scene.height;

const colImg = new Image();
colImg.src = "Textures/Map/Coliders.png";

Coliders_array=[];

colImg.onload = () => {
    Coliders_graphic.drawImage(colImg, Coliders.width/2-colImg.width/2, Coliders.height/2-colImg.height/2);
    Temp_Array1 = Coliders_graphic.getImageData(0,0,Coliders.width,Coliders.height).data;

    for (let y=0;y<Coliders.height;y++)
    {
        Temp_Array2 = [];
        for (let x=0;x<Coliders.width;x++)
        {
            Temp_Array2.push([Temp_Array1[(x*4+(y*Coliders.width*4))],Temp_Array1[(x*4+1+(y*4*Coliders.width))],Temp_Array1[(x*4+2+(y*4*Coliders.width))],Temp_Array1[(x*4+3+(y*Coliders.width*4))]]);
        }
        Coliders_array.push(Temp_Array2);
    }
};

const sprites = [];

function loadSprites() {

    return fetch("Textures/Sprites/sprites.json")
        .then(res => res.json())
        .then(data => {

            const keys = Object.keys(data);
            let loaded = 0;

            return new Promise((resolve) => {

                for (const key of keys) {
                    const img = new Image();

                    img.onload = () => {

                        sprites.push({
                            name: data[key].name,
                            active: data[key].active,
                            image: img,
                            width: data[key].frameWidth,
                            height: data[key].frameHeight,
                            x: data[key].x,
                            y: data[key].y,
                            frame: data[key].frame,
                            frames: data[key].frames,
                            speed: data[key].frames[data[key].frame*2+1]
                        });

                        loaded++;

                        if (loaded === keys.length) {
                            resolve();
                        }
                    };

                    img.onerror = () => {
                        console.log("FAILED:", data[key].image);

                        loaded++;
                        if (loaded === keys.length) {
                            resolve();
                        }
                    };

                    img.src = data[key].image;
                }
            });
        });

}

// player object
const player1 = {
    x: 100,
    y: 100,
    speed: [3,0],
    acceleration: [0,-1],
    width:-7,
    height:-7
};

const player2 = {
    x: 100,
    y: 100,
    speed: [3,0],
    acceleration: [0,-1],
    width:-7,
    height:-7
};

// keys state
const keys = {};

window.addEventListener("keydown", (e) => {
    keys[e.key.toLowerCase()] = true;
});

window.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
});

ccc=false

window.addEventListener("gamepadconnected", (e) => {
    ccc=true
    console.log("Controller connected!");
    console.log(e.gamepad);
});

    

function Calcs() {    
    // WASD movement
    const gamepads = navigator.getGamepads();

    const gp = gamepads[0];
    const gp_2 = gamepads[1];

    if ((keys["w"])||((gp)&&(gp.buttons[0].pressed))){
        if (Check_Collision(player1.x,player1.y+player1.height,player1.x-1+player1.width,player1.y+player1.height))
        {
            player1.speed[1]=20;
        }
    }
    if ((keys["a"])||((gp)&&(gp.axes[0]<-0.1))){     

        sprites.find(s => s.name === "player_1_Idl").active=false;
        sprites.find(s => s.name === "player_1_RunL").active=true;

        let step = player1.speed[0];

        for (let i = 0; i < step; i++) {

            // try normal left move
            if (!Check_Collision(
                player1.x - 1,
                player1.y,
                player1.x - 1,
                player1.y + player1.height-1
            )) {
                player1.x--;
                continue;
            }

            // blocked → try step up
            let stepped = false;

            for (let h = 1; h <= player1.height * 0.2; h++) {

                if (!Check_Collision(
                    player1.x - 1,
                    player1.y - h,
                    player1.x - 1,
                    player1.y + player1.height - h
                )) {
                    player1.x--;
                    player1.y -= h;
                    stepped = true;
                    break;
                }
            }

            if (!stepped) break;
        }
    }
        
    if ((keys["d"])||((gp)&&(gp.axes[0]>0.1))){        

        sprites.find(s => s.name === "player_1_Idl").active=false;
        sprites.find(s => s.name === "player_1_RunR").active=true;
        let step = player1.speed[0];

        for (let i = 0; i < step; i++) {

            // try normal move
            if (!Check_Collision(
                player1.x + 1,
                player1.y,
                player1.x + 1 + player1.width,
                player1.y + player1.height-1
            )) {
                player1.x++;
                continue;
            }

            // blocked → try step up
            let stepped = false;

            for (let h = 1; h <= player1.height * 0.2; h++) {

                if (
                    !Check_Collision(
                        player1.x + 1,
                        player1.y - h,
                        player1.x + 1 + player1.width,
                        player1.y - h + player1.height
                    )
                ) {
                    player1.x++;
                    player1.y -= h;
                    stepped = true;
                    break;
                }
            }

            if (!stepped) break;
        }
    }

    //playr 2 movement

    if ((keys["i"])||((gp_2)&&(gp_2.buttons[0].pressed))){
        if (Check_Collision(player2.x,player2.y+player2.height,player2.x-1+player2.width,player2.y+player2.height))
        {
            player2.speed[1]=20;
        }
    }
    if ((keys["j"])||((gp_2)&&(gp_2.axes[0]<-0.1))){          

        sprites.find(s => s.name === "player_2_Idl").active=false;
        sprites.find(s => s.name === "player_2_RunL").active=true;

        let step = player2.speed[0];

        for (let i = 0; i < step; i++) {

            // try normal left move
            if (!Check_Collision(
                player2.x - 1,
                player2.y,
                player2.x - 1,
                player2.y + player2.height-1
            )) {
                player2.x--;
                continue;
            }

            // blocked → try step up
            let stepped = false;

            for (let h = 1; h <= player2.height * 0.2; h++) {

                if (!Check_Collision(
                    player2.x - 1,
                    player2.y - h,
                    player2.x - 1,
                    player2.y + player2.height - h
                )) {
                    player2.x--;
                    player2.y -= h;
                    stepped = true;
                    break;
                }
            }

            if (!stepped) break;
        }
    }
        
    if ((keys["l"])||((gp_2)&&(gp_2.axes[0]>0.1))){        

        sprites.find(s => s.name === "player_2_Idl").active=false;
        sprites.find(s => s.name === "player_2_RunR").active=true;

        let step = player2.speed[0];

        for (let i = 0; i < step; i++) {

            // try normal move
            if (!Check_Collision(
                player2.x + 1,
                player2.y,
                player2.x + 1 + player2.width,
                player2.y + player2.height-1
            )) {
                player2.x++;
                continue;
            }

            // blocked → try step up
            let stepped = false;

            for (let h = 1; h <= player2.height * 0.2; h++) {

                if (
                    !Check_Collision(
                        player2.x + 1,
                        player2.y - h,
                        player2.x + 1 + player2.width,
                        player2.y - h + player2.height
                    )
                ) {
                    player2.x++;
                    player2.y -= h;
                    stepped = true;
                    break;
                }
            }

            if (!stepped) break;
        }
    }

    if (((keys["a"])&&(keys["d"]))||((!keys["a"])&&(!keys["d"])))
    {
        sprites.find(s => s.name === "player_1_Idl").active=true;
        sprites.find(s => s.name === "player_1_RunR").active=false;
        sprites.find(s => s.name === "player_1_RunL").active=false;
    }
    if (((keys["j"])&&(keys["l"]))||((!keys["j"])&&(!keys["l"])))
    {
        sprites.find(s => s.name === "player_2_Idl").active=true;
        sprites.find(s => s.name === "player_2_RunR").active=false;
        sprites.find(s => s.name === "player_2_RunL").active=false;
    }
    

    player1.speed[1]=player1.speed[1]+player1.acceleration[1];
    player2.speed[1]=player2.speed[1]+player2.acceleration[1];
    
        for (let i =1; i<=Math.abs(player1.speed[1]);i++)                      
        {
            collided = false;
            if(player1.speed[1]>0){
                if (!(Check_Collision(player1.x,player1.y-i,player1.x-1+player1.width,player1.y-i)))
                {
                    player1.y--;
                }
                else
                {
                    collided=true;
                }
            }
            if(player1.speed[1]<0){
                if (!(Check_Collision(player1.x,player1.y+player1.height-1+i,player1.x-1+player1.width,player1.y+player1.height-1+i)))
                {
                    player1.y++;
                }
                else
                {
                    collided=true;
                }
            }
            if (collided){
                i=Math.abs(player1.speed[1])+1;
                player1.speed[1] = 0;
            }
        }
        
        for (let i =1; i<=Math.abs(player2.speed[1]);i++)                      
        {
            collided = false;
            if(player2.speed[1]>0){
                if (!(Check_Collision(player2.x,player2.y-i,player2.x-1+player2.width,player2.y-i)))
                {
                    player2.y--;
                }
                else
                {
                    collided=true;
                }
            }
            if(player2.speed[1]<0){
                if (!(Check_Collision(player2.x,player2.y+player2.height-1+i,player2.x-1+player2.width,player2.y+player2.height-1+i)))
                {
                    player2.y++;
                }
                else
                {
                    collided=true;
                }
            }
            if (collided){
                i=Math.abs(player2.speed[1])+1;
                player2.speed[1] = 0;
            }
        }
    
    Sset(sprites.find(s => s.name === "player_1_Idl"),player1.x,player1.y);
    Sset(sprites.find(s => s.name === "player_1_RunR"),player1.x,player1.y);
    Sset(sprites.find(s => s.name === "player_1_RunL"),player1.x,player1.y);

    Sset(sprites.find(s => s.name === "player_2_Idl"),player2.x,player2.y);
    Sset(sprites.find(s => s.name === "player_2_RunR"),player2.x,player2.y);
    Sset(sprites.find(s => s.name === "player_2_RunL"),player2.x,player2.y);
}

function draw() {
    graphic.clearRect(0, 0, Scene.width, Scene.height);
    graphic.drawImage(Background, Scene.width/2-Background.width/2, Scene.height/2-Background.height/2);
    for (let i = 0; i<sprites.length;i++)
    {
        if (sprites[i].active){
            graphic.drawImage(sprites[i].image, sprites[i].frames[sprites[i].frame*2]*sprites[i].width,0,sprites[i].width, sprites[i].height,sprites[i].x, sprites[i].y,sprites[i].width, sprites[i].height);
        }
    }
}

function loop() {
    Calcs();
    draw();
    Sprites_Update();
    requestAnimationFrame(loop);
}

function Check_Collision(x1,y1,x2,y2){
    if ((x1<0)||(x2<0)||(x1>=Coliders.width)||(x2>=Coliders.width)||(y1<0)||(y2<0)||(y1>=Coliders.height)||(y2>=Coliders.height))
    {
        return true
    }
    for (let y = y1; y <= y2; y++) {
        for (let x = x1;x <= x2; x++) {
            if ((Coliders_array[y][x][0]===0)&&(Coliders_array[y][x][1]===0)&&(Coliders_array[y][x][2]===0)&&(Coliders_array[y][x][3]===255))
            {
                return true;
            }
        }
    }
    return false;
}

async function startGame() {

    await loadSprites();
    
    player1.width = sprites.find(s => s.name === "player_1_Idl").width;
    player1.height = sprites.find(s => s.name === "player_1_Idl").height;
    player2.width = sprites.find(s => s.name === "player_2_Idl").width;
    player2.height = sprites.find(s => s.name === "player_2_Idl").height;
    loop();          
}

function Sprites_Update(){
    for (let i = 0; i<sprites.length;i++)
    {
        if (sprites[i].active){
            if (sprites[i].speed<=0)
            {
                if(sprites[i].name=="player_2_Idl")
                {
                    buttonRight.value +=", "+sprites[i].frame;
                }
                sprites[i].frame++;
                sprites[i].speed=sprites[i].frames[sprites[i].frame*2+1];
                if (sprites[i].frame==sprites[i].frames.length/2)
                {
                    sprites[i].frame = 0;
                    sprites[i].speed=sprites[i].frames[sprites[i].frame*2+1];
                    buttonRight.value +=", #";
                }
            }
            sprites[i].speed--;
        }
    }
}

function Sset(sprite,x,y){
    sprite.x = x;
    sprite.y=y;
}


let Rock_Wall_Hp = 100
let Rock_Wall_damaged = false;

function Rock_Builder(){

}

startGame();