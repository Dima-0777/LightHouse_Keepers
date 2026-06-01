const Scene = document.querySelector(".game"); //canvas
const graphic = Scene.getContext("2d"); //ctx

const buttonLeft = document.querySelector(".left");
const buttonRight = document.querySelector(".right");

Scene.width = window.innerWidth*0.98;
Scene.height = window.innerHeight*1;

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
                            speed: data[key].frames[data[key].frame*2+1],
                            relative: data[key].relative,
                            replay: data[key].replay
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
    x: 430,
    y: 410,
    speed: [3,0],
    acceleration: [0,-0.5],
    width:-7,
    height:-7,
    control_Delay:0,
    action_buffer:false,
    menu_pos: [15,15],

    idl:"player_1_Idl",
    runL:"player_1_RunL",
    runR:"player_1_RunR",
    wall:"player_1_Wall"
};

const player2 = {
    x: 922,
    y: 418,
    speed: [3,0],
    acceleration: [0,-0.5],
    width:-7,
    height:-7,
    control_Delay:0,
    action_buffer:false,
    menu_pos: [1060,0],

    idl:"player_2_Idl",
    runL:"player_2_RunL",
    runR:"player_2_RunR",
    wall:"player_2_Wall"
};

// menus

//sat menu
Satelite_Manu_Used_By=null;
Satelite_Manu_target = 0;
Satelite_Manu_progress = 0;



// keys state
const keys = {};

window.addEventListener("keydown", (e) => {
    keys[e.key.toLowerCase()] = true;
});

window.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
});

window.addEventListener("gamepadconnected", (e) => {
    ccc=true
    console.log("Controller connected!");
    console.log(e.gamepad);
});

    

function Calcs(player,controler,left,up,right,act,enter) {    
    // WASD movement
    const gamepads = navigator.getGamepads();

    const gp = gamepads[controler];

    let Player_Temp_Speed = player.speed[0];
    if (gp&&(Math.abs(gp.axes[0])>0.1))
    {
        player.speed[0] = player.speed[0]*Math.abs(gp.axes[0]);
    }
    if (player.action_buffer&&(!((keys[act])||((gp)&&(gp.buttons[1].pressed)))))
    {
        player.action_buffer=false;
    }

    if (player.control_Delay==0){
    Sget(player.idl).active = true;
    Sget(player.runL).active = false;
    Sget(player.runR).active = false;
    Sget(player.wall).active = false;
    if ((keys[up])||((gp)&&(gp.buttons[0].pressed))){
        if (Check_Collision(player.x,player.y+player.height,player.x-1+player.width,player.y+player.height))
        {
            player.speed[1]=8;
        }
    }
    if (((keys[left])||((gp)&&(gp.axes[0]<-0.1)))&&(!((keys[right])||((gp)&&(gp.axes[0]>0.1))))){     

        Sget(player.idl).active=false;
        Sget(player.runL).active=true;

        let step = player.speed[0];

        for (let i = 0; i < step; i++) {

            // try normal left move
            if (!Check_Collision(
                player.x - 1,
                player.y,
                player.x - 1,
                player.y + player.height-1
            )) {
                player.x--;
                continue;
            }

            // blocked → try step up
            let stepped = false;

            for (let h = 1; h <= player.height * 0.275; h++) {

                if (!Check_Collision(
                    player.x - 1,
                    player.y - h,
                    player.x - 1,
                    player.y + player.height - h
                )) {
                    player.x--;
                    player.y -= h;
                    stepped = true;
                    break;
                }
            }

            if (!stepped) break;
        }
    }
        
    if (((keys[right])||((gp)&&(gp.axes[0]>0.1)))&&(!((keys[left])||((gp)&&(gp.axes[0]<-0.1))))){        

        Sget(player.idl).active=false;
        Sget(player.runR).active=true;
        let step = player.speed[0];

        for (let i = 0; i < step; i++) {

            // try normal move
            if (!Check_Collision(
                player.x + 1,
                player.y,
                player.x + 1 + player.width,
                player.y + player.height-1
            )) {
                player.x++;
                continue;
            }

            // blocked → try step up
            let stepped = false;

            for (let h = 1; h <= player.height * 0.275; h++) {

                if (
                    !Check_Collision(
                        player.x + 1,
                        player.y - h,
                        player.x + 1 + player.width,
                        player.y - h + player.height
                    )
                ) {
                    player.x++;
                    player.y -= h;
                    stepped = true;
                    break;
                }
            }

            if (!stepped) break;
        }
    }
    if ((!player.action_buffer)&&((keys[act])||((gp)&&(gp.buttons[1].pressed))))
    {
        Action_Button_Pressed(player);
        player.action_buffer=true;
    }
    }
    else
    {
        player.control_Delay--;
    } 
    Sset(Sget(player.idl),player.x,player.y);
    Sset(Sget(player.runL),player.x,player.y);
    Sset(Sget(player.runR),player.x,player.y);
    Sset(Sget(player.wall),player.x,player.y);

    player.speed[1]=player.speed[1]+player.acceleration[1];
    
        for (let i =1; i<=Math.abs(player.speed[1]);i++)                      
        {
            collided = false;
            if(player.speed[1]>0){
                if (!(Check_Collision(player.x,player.y-i,player.x-1+player.width,player.y-i)))
                {
                    player.y--;
                }
                else
                {
                    collided=true;
                }
            }
            if(player.speed[1]<0){
                if (!(Check_Collision(player.x,player.y+player.height-1+i,player.x-1+player.width,player.y+player.height-1+i)))
                {
                    player.y++;
                }
                else
                {
                    collided=true;
                }
            }
            if (collided){
                i=Math.abs(player.speed[1])+1;
                player.speed[1] = 0;
            }
        }

    player.speed[0]=Player_Temp_Speed;

    
    if (player.control_Delay<0)
    {
        if ((Satelite_Manu_Used_By!=null)&&(Satelite_Manu_Used_By.idl==player.idl)){
            for (let i = 0;i<5;i++)
            {
                Sget((["SM Anten 0","SM Anten 1","SM Anten 2","SM Anten 3","SM Anten 4"])[i]).active=false;
            }
            if (((keys[up])||((gp)&&(gp.axes[1]<-0.8)&&(gp.axes[0]>-0.25)&&(gp.axes[0]<0.25)))&&(!((keys[left])||(keys[right]))))
            {
                Satelite_Manu_progress = 2;
            }
            else if (((keys[left])||((gp)&&(gp.axes[0]<-0.8)&&(gp.axes[1]>-0.25)))&&(!((keys[up])||(keys[right]))))
            {
                Satelite_Manu_progress = 0;
            }
            else if (((keys[right])||((gp)&&(gp.axes[0]>0.8)&&(gp.axes[1]>-0.25)))&&(!((keys[left])||(keys[up]))))
            {
                Satelite_Manu_progress = 4;
            }
            else if (((keys[left]&&keys[up])||((gp)&&(gp.axes[0]<-0.25)&&(gp.axes[1]<-0.25)))&&(!((keys[right]))))
            {
                Satelite_Manu_progress = 1;
            }
            else if (((keys[right]&&keys[up])||((gp)&&(gp.axes[0]>0.25)&&(gp.axes[1]<-0.25)))&&(!((keys[left]))))
            {
                Satelite_Manu_progress = 3;
            }    
            Sget((["SM Anten 0","SM Anten 1","SM Anten 2","SM Anten 3","SM Anten 4"])[Satelite_Manu_progress]).active=true;
            if (Satelite_Manu_target==Satelite_Manu_progress){
                Sget("SM Yes Signal").active=true;
                Sget("SM No Signal").active=false;
            }
            else
            {
                Sget("SM No Signal").active=true;
                Sget("SM Yes Signal").active=false;
            }
            if ((events[1].hp==0)||((!player.action_buffer)&&((keys[act])||((gp)&&(gp.buttons[1].pressed)))))
            {
                Satelite_Manu_Used_By=null;
                player.control_Delay=0;
                player.action_buffer=true;
                for (let i = 0;i<5;i++)
                {
                    Sget((["SM Signal 0","SM Signal 1","SM Signal 2","SM Signal 3","SM Signal 4"])[i]).active=false;
                }
                for (let i = 0;i<5;i++)
                {
                    Sget((["SM Anten 0","SM Anten 1","SM Anten 2","SM Anten 3","SM Anten 4"])[i]).active=false;
                }
                Sget("SM Yes Signal").active=false;
                Sget("SM No Signal").active=false;
                Sget("SM Base").active=false;
                if (Satelite_Manu_target==Satelite_Manu_progress)
                {
                    Reset_Event(events[1]);
                }
            }
        }
    }
}

function draw() {
    graphic.clearRect(0, 0, Scene.width, Scene.height);
    graphic.drawImage(Background, Scene.width/2-Background.width/2, Scene.height/2-Background.height/2);
    for (let i = 0; i<sprites.length;i++)
    {
        if (sprites[i].active){
            Temp_X = sprites[i].x;
            Temp_Y = sprites[i].y;
            if (sprites[i].relative)
            {
                Temp_X = Math.trunc(sprites[i].x+(Scene.width/2-Background.width/2));
                Temp_Y = Math.trunc(sprites[i].y+(Scene.height/2-Background.height/2));
                
            }
            graphic.drawImage(sprites[i].image, sprites[i].frames[sprites[i].frame*2]*sprites[i].width,0,sprites[i].width, sprites[i].height, Temp_X, Temp_Y,sprites[i].width, sprites[i].height);
        }
    }
}

function loop() {
    Calcs(player1,1,"a","w","d","r","shift");
    Calcs(player2,0,"j","i","l","p","enter");
    draw();
    Sprites_Update();
    Events_Update();
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
    Set_Events();
    loop();          
}

function Sprites_Update(){
    for (let i = 0; i<sprites.length;i++)
    {
        if (sprites[i].active){
            if (sprites[i].speed<=0)
            {
                sprites[i].frame++;
                sprites[i].speed=sprites[i].frames[sprites[i].frame*2+1];
                if (sprites[i].frame==sprites[i].frames.length/2)
                {
                    if (sprites[i].replay)
                    {
                        sprites[i].frame = 0;
                        sprites[i].speed=sprites[i].frames[sprites[i].frame*2+1];
                    }
                    else
                    {
                        sprites[i].frame--;
                    }
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

function Sget(sprite_name){
    if (sprites.find(s => s.name === sprite_name)!= null)
    {
        return sprites.find(s => s.name === sprite_name);
    }
    return false;
}

function randomInt(min, max) {
    max--;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

let events = []

function Set_Events()
{
    events=[
        {
            name:"Sea Wall",
            idl: "Sea Wall Undam", 
            dameged:"Sea Wall damaged", 
            destroyed:"Sea Wall Destroyed", 
            idl_ico:"Wall Ico", 
            dameged_ico:"Wall Ico Dam", 
            destroyed_ico:"Wall Ico Des", 
            high:"Sea Wall High", 
            active:false, 
            just_recovered:false,
            hp: 200,
            hp_def: 3600,
            recovered:0,
            Action_area: [Sget("Sea Wall Undam").x+Sget("Sea Wall Undam").width,Sget("Sea Wall Undam").y,Sget("Sea Wall Undam").x+(2*Sget("Sea Wall Undam").width),Sget("Sea Wall Undam").y+Sget("Sea Wall Undam").height]
        },

        {
            name:"Satelite",
            idl: "Sat", 
            dameged:"Sat Dam", 
            destroyed:"Sat Des", 
            idl_ico:"Sat Ico", 
            dameged_ico:"Sat Dam Ico", 
            destroyed_ico:"Sat Des Ico", 
            high:"Sat High", 
            active:false, 
            just_recovered:false,
            hp: 200,
            hp_def: 3600,
            recovered:0,
            Action_area: [Sget("Sat").x-(Sget("Sat").width/2),Sget("Sat").y,Sget("Sat").x,Sget("Sat").y+Sget("Sat").height]
        },
    ];
}

let Events_Update_cooldown = 100;

function Events_Update(){
    avaible_events = events.length;
    for (let i = 0; i< events.length;i++)
    {
        if (events[i].active==true)
        {
            if ((events[i].hp>0)&&(((player1.x>=events[i].Action_area[0])&&(player1.x<=events[i].Action_area[2])&&(player1.y>=events[i].Action_area[1])&&(player1.y<events[i].Action_area[3]))||((player2.x>=events[i].Action_area[0])&&(player2.x<=events[i].Action_area[2])&&(player2.y>=events[i].Action_area[1])&&(player2.y<events[i].Action_area[3]))))
            {
                HighLight_Event(events[i]);
            }
            else
            {
                Trigr_Event(events[i]);
            }
            avaible_events--;
            if(events[i].hp>0)
            {
                events[i].hp--;
            }
            else
            {
                Kill_Event(events[i]);
            }
        }
    }
    if (Events_Update_cooldown==0){
        if (avaible_events>0)
        {
            event_To_triger = events[randomInt(0,events.length)]
            while ((event_To_triger.active==true))
            {
                event_To_triger = events[randomInt(0,events.length)]
            }

            if (event_To_triger.just_recovered==false)
            {
                event_To_triger.active = true;
                Trigr_Event(event_To_triger);
            }
            else
            {
                event_To_triger.just_recovered=false;
            }
        }
        Events_Update_cooldown = 100;   
    }
    else
    {
        Events_Update_cooldown--;
    }
}

function Trigr_Event(event){
    Sget(event.high).active = false;
    Sget(event.idl).active = false;
    Sget(event.dameged).active = true;
    Sget(event.idl_ico).active = false;
    Sget(event.dameged_ico).active = true;
}

function Reset_Event(event){
    Sget(event.idl).active = true;
    Sget(event.high).active = false;
    Sget(event.dameged).active = false;
    Sget(event.destroyed).active = false;
    Sget(event.idl_ico).active = true;
    Sget(event.dameged_ico).active = false;
    Sget(event.destroyed_ico).active = false;
    
    event.recovered = 0;
    event.hp = event.hp_def;
    event.active = false;
    event.just_recovered = true;
}

function Kill_Event(event){
    Sget(event.dameged).active = false;
    Sget(event.destroyed).active = true;
    Sget(event.dameged_ico).active = false;
    Sget(event.destroyed_ico).active = true;
}

function HighLight_Event(event){
    Sget(event.dameged).active = false;
    Sget(event.high).active = true;
}

function Action_Button_Pressed(player)
{
    
    for (let i = 0; i< events.length;i++)
    {
        if (events[i].active==true)
        {
            if (((player.x>=events[i].Action_area[0])&&(player.x<=events[i].Action_area[2])&&(player.y>=events[i].Action_area[1])&&(player.y<events[i].Action_area[3])))
            {
                if (events[i].name=="Sea Wall")
                {
                    Sget(player.idl).active = false;
                    Sget(player.wall).active = true;
                    player.control_Delay=20;
                    events[i].recovered++;
                    if (events[i].recovered==10)
                    {
                        Reset_Event(events[i]);
                    }
                }
                else if ((events[i].name=="Satelite")&&(Satelite_Manu_Used_By==null))
                {
                    Sget("SM Base").active = true;
                    Sget("SM No Signal").active = true;

                    Sset(Sget("SM Base"),player.menu_pos[0],player.menu_pos[1]);
                    Sset(Sget("SM No Signal"),player.menu_pos[0],player.menu_pos[1]);
                    Sset(Sget("SM Yes Signal"),player.menu_pos[0],player.menu_pos[1]);
                    Sset(Sget("SM Anten 0"),player.menu_pos[0],player.menu_pos[1]);
                    Sset(Sget("SM Anten 1"),player.menu_pos[0],player.menu_pos[1]);
                    Sset(Sget("SM Anten 2"),player.menu_pos[0],player.menu_pos[1]);
                    Sset(Sget("SM Anten 3"),player.menu_pos[0],player.menu_pos[1]);
                    Sset(Sget("SM Anten 4"),player.menu_pos[0],player.menu_pos[1]);
                    Sset(Sget("SM Signal 0"),player.menu_pos[0],player.menu_pos[1]);
                    Sset(Sget("SM Signal 1"),player.menu_pos[0],player.menu_pos[1]);
                    Sset(Sget("SM Signal 2"),player.menu_pos[0],player.menu_pos[1]);
                    Sset(Sget("SM Signal 3"),player.menu_pos[0],player.menu_pos[1]);
                    Sset(Sget("SM Signal 4"),player.menu_pos[0],player.menu_pos[1]);
                    for (let i = 0;i<5;i++)
                    {
                        Sget((["SM Signal 0","SM Signal 1","SM Signal 2","SM Signal 3","SM Signal 4"])[i]).active=false;
                    }
                    for (let i = 0;i<5;i++)
                    {
                        Sget((["SM Anten 0","SM Anten 1","SM Anten 2","SM Anten 3","SM Anten 4"])[i]).active=false;
                    }
                    Satelite_Manu_Used_By = player;
                    player.control_Delay=-1;
                    Satelite_Manu_target = randomInt(0,5);
                    Sget((["SM Signal 0","SM Signal 1","SM Signal 2","SM Signal 3","SM Signal 4"])[Satelite_Manu_target]).active=true;
                    Satelite_Manu_progress = randomInt(0,5);
                    while(Satelite_Manu_progress==Satelite_Manu_target){
                        Satelite_Manu_progress = randomInt(0,5);
                    }
                    Sget((["SM Anten 0","SM Anten 1","SM Anten 2","SM Anten 3","SM Anten 4"])[Satelite_Manu_progress]).active=true;
                }
            }
        }
    }
}

startGame();