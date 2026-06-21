const Scene = document.querySelector(".game"); //canvas
const graphic = Scene.getContext("2d"); //ctx

const buttonLeft = document.querySelector(".left");
const buttonRight = document.querySelector(".right");

Scene.width = window.innerWidth*0.98;
Scene.height = window.innerHeight*1.01;

const Background = new Image();
Background.src = "Textures/Map/background.png";

X_Skift = 0;
Y_Skift = 0;

Background.onload = () =>
{
    graphic.scale((Math.trunc((Scene.width/Background.width)*1000)/1000),(Math.trunc((Scene.height/Background.height)*1000)/1000));
    buttonRight.value = (Math.trunc((Scene.height/Background.height)*100)/100)
    X_Skift = Math.trunc((Scene.width/2-((Background.width*(Math.trunc((Scene.width/Background.width)*1000)/1000))/2)));
    Y_Skift = Math.trunc((Scene.height/2-((Background.height*(Math.trunc((Scene.height/Background.height)*1000)/1000))/2)));/*
    X_Skift = Math.trunc((Scene.width/2-((Background.width)/2)));
    Y_Skift = Math.trunc((Scene.height/2-((Background.height)/2)));*/
}


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

Sprites_Ready = false;

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
                            replay: data[key].replay,
                            priority:data[key].priority
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
                Sprites_Ready = true;
            });
        });

}

function Prioritise_Sprites()
{
    swaped = true;
    while (swaped==true)
    {
        swaped = false;
        for (let i =0; i<sprites.length-1;i++)
        {
            if (sprites[i].priority>sprites[i+1].priority){
                tepm_srpite = sprites[i+1];
                sprites[i+1]=sprites[i];
                sprites[i] = tepm_srpite;
                swaped=true;
            }
        }
    }
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
    effects:[],

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
    menu_pos: [835,15],
    effects:[],

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

//fish menu
Fish_Menu_Used_By=null;
Fish_Menu_progress = 0;

//Comp menu
Comp_Menu_Used_By=null;
Comp_Menu_progress = 0;
Comp_Menu_progs = [];

//Electro menu
Electro_Menu_Used_By=null;
Electro_Menu_progress = 0;
Electro_Menu_Buffer = false;
Electro_Menu_BX =0;
Electro_Menu_BY =0;
Electro_Menu_SX =0;
Electro_Menu_SY =0;
Electro_Menu_Selected = 0;


//Cabel Menu
Cabel_Menu_Used_By = null;
Cabel_Menu_progress = [];
Cabel_Menu_selected = false;
Cabel_Menu_selected_2= false;
Cabel_Menu_In_Wire = false;


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

    

function Calcs(player,controler,left,up,right,act,enter,down) {    
    // WASD movement
    const gamepads = navigator.getGamepads();

    const gp = gamepads[controler];
    
    for (let i =0;i<player.effects.length;i++)
    {
        if ((player.effects[i][0]=="Speed2")&&(player.effects[i][2]==false))
        {
            player.speed[0]=5;
            player.effects[i][2]=true;
        }
    }
    
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
        player.action_buffer=true;
        Action_Button_Pressed(player);
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

    for (let i =0;i<player.effects.length;i++)
    {
        if (player.effects[i][1]<=0)
        {
            if ((player.effects[i][0]=="Speed2")&&(player.effects[i][2]))
            {
                player.speed[0]=3;
            }
            player.effects.splice(i, 1);
        }
        else
        {
            player.effects[i][1]--;
        }
    }
    
    if (player.control_Delay<0)
    {
        Menu_pos = [player.menu_pos[0],player.menu_pos[1]];
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
        else if ((Fish_Menu_Used_By!=null)&&(Fish_Menu_Used_By.idl==player.idl))
        {
            Fish_array = ["FM Fish 0","FM Fish 1","FM Fish 2","FM Fish 3","FM Fish 4","FM Fish 5","FM Fish 6","FM Fish 7"];
            FishSpeed = 2;
            FishX=0;
            FishY=0;
            if (player.idl=="player_2_Idl")
            {
                Menu_pos[0]+=350-Sget("FM Base").width;
            }
            if (((keys[up])||((gp)&&(gp.axes[1]<-0.8)&&(gp.axes[0]>-0.25)&&(gp.axes[0]<0.25)))&&(!((keys[left])||(keys[right])||(keys[down]))))
            {
                for (let i = 0;i<8;i++)
                {
                    Sget(Fish_array[i]).active=false;
                }
                Sget(Fish_array[2]).active=true;
                FishY-=FishSpeed;
            }
            else if (((keys[left])||((gp)&&(gp.axes[0]<-0.8)&&(gp.axes[1]>-0.25)))&&(!((keys[up])||(keys[right])||(keys[down]))))
            {
                for (let i = 0;i<8;i++)
                {
                    Sget(Fish_array[i]).active=false;
                }
                Sget(Fish_array[0]).active=true;
                FishX-=FishSpeed;
            }
            else if (((keys[right])||((gp)&&(gp.axes[0]>0.8)&&(gp.axes[1]>-0.25)))&&(!((keys[left])||(keys[up])||(keys[down]))))
            {
                for (let i = 0;i<8;i++)
                {
                    Sget(Fish_array[i]).active=false;
                }
                Sget(Fish_array[4]).active=true;
                FishX+=FishSpeed;
            }
            else if (((keys[left]&&keys[up])||((gp)&&(gp.axes[0]<-0.25)&&(gp.axes[1]<-0.25)))&&(!((keys[right])||(keys[down]))))
            {
                for (let i = 0;i<8;i++)
                {
                    Sget(Fish_array[i]).active=false;
                }
                Sget(Fish_array[1]).active=true;
                FishY-=FishSpeed*0.5;
                FishX-=FishSpeed*0.5;
            }
            else if (((keys[right]&&keys[up])||((gp)&&(gp.axes[0]>0.15)&&(gp.axes[1]<-0.15)))&&(!((keys[left])||(keys[down]))))
            {
                for (let i = 0;i<8;i++)
                {
                    Sget(Fish_array[i]).active=false;
                }
                Sget(Fish_array[3]).active=true;
                FishY-=FishSpeed*0.5;
                FishX+=FishSpeed*0.5;
            }  
            else if (((keys[left]&&keys[down])||((gp)&&(gp.axes[0]<-0.15)&&(gp.axes[1]>0.15)))&&(!((keys[right])||(keys[up]))))
            {
                for (let i = 0;i<8;i++)
                {
                    Sget(Fish_array[i]).active=false;
                }
                Sget(Fish_array[7]).active=true;
                FishY+=FishSpeed*0.5;
                FishX-=FishSpeed*0.5;
            }
            else if (((keys[right]&&keys[down])||((gp)&&(gp.axes[0]>0.15)&&(gp.axes[1]>0.15)))&&(!((keys[left])||(keys[up]))))
            {
                for (let i = 0;i<8;i++)
                {
                    Sget(Fish_array[i]).active=false;
                }
                Sget(Fish_array[5]).active=true;
                FishY+=FishSpeed*0.5;
                FishX+=FishSpeed*0.5;
            }  
            else if (((keys[down])||((gp)&&(gp.axes[1]>0.8)&&(gp.axes[0]>-0.15)&&(gp.axes[0]<0.15)))&&(!((keys[left])||(keys[right])||(keys[up]))))
            {
                for (let i = 0;i<8;i++)
                {
                    Sget(Fish_array[i]).active=false;
                }
                Sget(Fish_array[6]).active=true;
                FishY+=FishSpeed;
            }
            if (!((Sget(Fish_array[0]).x+FishX>=Menu_pos[0]+6)&&(Sget(Fish_array[0]).y+FishY>=Menu_pos[1]+6)&&(Sget(Fish_array[0]).x+FishX<Menu_pos[0]+216)&&(Sget(Fish_array[0]).y+FishY<Menu_pos[1]+197)))
            {
                FishX=0;
                FishY=0;
            }  
            
            for (let i = 0;i<8;i++)
            {
                Current_Sprite = Sget(Fish_array[i]);
                Sset(Current_Sprite,Current_Sprite.x+FishX,Current_Sprite.y+FishY);
            }
            for (let i=0;i<12;i++)
            {
                Current_Sprite = Sget(Fish_array[0]);
                Other_Sprite = Sget((["FM Food 0","FM Food 1","FM Food 2","FM Food 3","FM Food 4","FM Food 5","FM Enemy 0","FM Enemy 1","FM Enemy 2","FM Enemy 3","FM Enemy 4","FM Enemy 5"])[i]);
                if ((Other_Sprite.active)&&(Other_Sprite.y!=null)&&(((Current_Sprite.y<Other_Sprite.y+Other_Sprite.height)&&(Current_Sprite.y+Current_Sprite.height>Other_Sprite.y)&&(Current_Sprite.x<Other_Sprite.x+Other_Sprite.width)&&(Current_Sprite.x+Current_Sprite.width>Other_Sprite.x))))
                {
                    if (Other_Sprite.name.substring(3, 7)=="Food")
                    {
                        Sget((["FM HP 0","FM HP 1","FM HP 2","FM HP 3","FM HP 4","FM HP 5","FM HP 6"])[Fish_Menu_progress]).active=false;
                        Fish_Menu_progress++;
                        Other_Sprite.active=false;
                    }                    
                    else
                    {
                        Fish_Menu_progress--;
                        if (Fish_Menu_progress>=0)
                        {
                            Sget((["FM HP 0","FM HP 1","FM HP 2","FM HP 3","FM HP 4","FM HP 5","FM HP 6"])[Fish_Menu_progress]).active=true;

                            
                            for (let k=0;k<6;k++)
                            {
                                New_Food=Sget((["FM Food 0","FM Food 1","FM Food 2","FM Food 3","FM Food 4","FM Food 5"])[k]);
                                if (New_Food.active==false)
                                {
                                    k=6;
                                    Norm = true;
                                    while(Norm)
                                    {
                                        Norm=false;
                                        Sset(New_Food,randomInt(Menu_pos[0]+6,Menu_pos[0]+216),randomInt(Menu_pos[1]+6,Menu_pos[1]+197));
                                        for (let j=0;j<13;j++)
                                        {
                                            Other_Sprite1 = Sget((["FM Fish 0","FM Food 0","FM Food 1","FM Food 2","FM Food 3","FM Food 4","FM Food 5","FM Enemy 0","FM Enemy 1","FM Enemy 2","FM Enemy 3","FM Enemy 4","FM Enemy 5"])[j]);
                                            if ((New_Food.name!=Other_Sprite1.name)&&(Other_Sprite1.y!=null)&&(((New_Food.y<Other_Sprite1.y+Other_Sprite1.height)&&(New_Food.y+New_Food.height>Other_Sprite1.y)&&(New_Food.x<Other_Sprite1.x+Other_Sprite1.width)&&(New_Food.x+New_Food.width>Other_Sprite1.x))))
                                            {
                                                Norm=true;
                                                j=13;
                                            }
                                        }
                                    }
                                    New_Food.active=true;
                                }
                            }
                        }
                        Other_Sprite.active=false;
                        if (Fish_Menu_progress<0)
                        {
                            Fish_Menu_progress=0;
                            
                        }
                        Norm = true;
                        while(Norm)
                        {
                            Norm=false;
                            Sset(Other_Sprite,randomInt(Menu_pos[0]+6,Menu_pos[0]+216),randomInt(Menu_pos[1]+6,Menu_pos[1]+197));
                            for (let j=0;j<13;j++)
                            {
                                Other_Sprite1 = Sget((["FM Fish 0","FM Food 0","FM Food 1","FM Food 2","FM Food 3","FM Food 4","FM Food 5","FM Enemy 0","FM Enemy 1","FM Enemy 2","FM Enemy 3","FM Enemy 4","FM Enemy 5"])[j]);
                                if ((Other_Sprite.name!=Other_Sprite1.name)&&(Other_Sprite1.y!=null)&&(((Other_Sprite.y<Other_Sprite1.y+Other_Sprite1.height)&&(Other_Sprite.y+Other_Sprite.height>Other_Sprite1.y)&&(Other_Sprite.x<Other_Sprite1.x+Other_Sprite1.width)&&(Other_Sprite.x+Other_Sprite.width>Other_Sprite1.x))))
                                {
                                    Norm=true;
                                    j=13;
                                }
                            }
                        }
                        Other_Sprite.active=true;
                    }
                }
            }
            
            if ((events[2].hp==0)||((!player.action_buffer)&&((keys[act])||((gp)&&(gp.buttons[1].pressed)))))
            {
                Fish_Menu_Used_By=null;
                player.control_Delay=0;
                player.action_buffer=true;
                Temp_array = ["FM Food 0","FM Food 1","FM Food 2","FM Food 3","FM Food 4","FM Food 5","FM Enemy 0","FM Enemy 1","FM Enemy 2","FM Enemy 3","FM Enemy 4","FM Enemy 5","FM Fish 0","FM Fish 1","FM Fish 2","FM Fish 3","FM Fish 4","FM Fish 5","FM Fish 6","FM Fish 7","FM HP 6","FM HP 5","FM HP 4","FM HP 3","FM HP 2","FM HP 1","FM HP 0","FM Base",];
                for (let i=0;i<Temp_array.length;i++)
                {
                    Sget((Temp_array)[i]).active=false;
                }
                if(Fish_Menu_progress==6)
                {
                    Reset_Event(events[2]);
                }
            }
        }
        else if ((Comp_Menu_Used_By!=null)&&(Comp_Menu_Used_By.idl==player.idl))
        {
            Comp_array = ["CM Virus 0","CM Virus 1","CM Virus 2","CM Virus 3","CM Virus 4","CM Virus 5","CM App 0","CM App 1","CM App 2","CM App 3","CM App 4","CM App 5",];
            CompSpeed = 3;
            CompX=0;
            CompY=0;
            if (((keys[up])||((gp)&&(gp.axes[1]<-0.8)&&(gp.axes[0]>-0.25)&&(gp.axes[0]<0.25)))&&(!((keys[left])||(keys[right])||(keys[down]))))
            {
                CompY-=CompSpeed;
            }
            else if (((keys[left])||((gp)&&(gp.axes[0]<-0.8)&&(gp.axes[1]>-0.25)))&&(!((keys[up])||(keys[right])||(keys[down]))))
            {
                CompX-=CompSpeed;
            }
            else if (((keys[right])||((gp)&&(gp.axes[0]>0.8)&&(gp.axes[1]>-0.25)))&&(!((keys[left])||(keys[up])||(keys[down]))))
            {
                CompX+=CompSpeed;
            }
            else if (((keys[left]&&keys[up])||((gp)&&(gp.axes[0]<-0.25)&&(gp.axes[1]<-0.25)))&&(!((keys[right])||(keys[down]))))
            {
                CompY-=CompSpeed*0.5;
                CompX-=CompSpeed*0.5;
            }
            else if (((keys[right]&&keys[up])||((gp)&&(gp.axes[0]>0.15)&&(gp.axes[1]<-0.15)))&&(!((keys[left])||(keys[down]))))
            {
                CompY-=CompSpeed*0.5;
                CompX+=CompSpeed*0.5;
            }  
            else if (((keys[left]&&keys[down])||((gp)&&(gp.axes[0]<-0.15)&&(gp.axes[1]>0.15)))&&(!((keys[right])||(keys[up]))))
            {
                CompY+=CompSpeed*0.5;
                CompX-=CompSpeed*0.5;
            }
            else if (((keys[right]&&keys[down])||((gp)&&(gp.axes[0]>0.15)&&(gp.axes[1]>0.15)))&&(!((keys[left])||(keys[up]))))
            {
                CompY+=CompSpeed*0.5;
                CompX+=CompSpeed*0.5;
            }  
            else if (((keys[down])||((gp)&&(gp.axes[1]>0.8)&&(gp.axes[0]>-0.15)&&(gp.axes[0]<0.15)))&&(!((keys[left])||(keys[right])||(keys[up]))))
            {
                CompY+=CompSpeed;
            }
            if (!((Sget("CM Cursor").x+CompX>=Menu_pos[0]+6)&&(Sget("CM Cursor").y+CompY>=Menu_pos[1]+6)&&(Sget("CM Cursor").x+CompX<Menu_pos[0]+329)&&(Sget("CM Cursor").y+CompY<Menu_pos[1]+220)))
            {
                CompX=0;
                CompY=0;
            }  
            else
            {
                Sset(Sget("CM Cursor"),Sget("CM Cursor").x+CompX,Sget("CM Cursor").y+CompY);
            }
            for (let i = 0; i< Comp_Menu_progs.length;i++)
            {
                Comp_Menu_progs[i].x+=Comp_Menu_progs[i].speed[0];
                Comp_Menu_progs[i].y+=Comp_Menu_progs[i].speed[1];
                Sset(Comp_Menu_progs[i].sprite,Math.round(Comp_Menu_progs[i].x),Math.round(Comp_Menu_progs[i].y))
                if ((Comp_Menu_progs[i].sprite.x<=6+Menu_pos[0])||(Comp_Menu_progs[i].sprite.x>=309+Menu_pos[0]))
                {
                    Comp_Menu_progs[i].speed[0] = -Comp_Menu_progs[i].speed[0];
                    Comp_Menu_progs[i].sprite.x +=(2*Math.round(Comp_Menu_progs[i].speed[0]))
                }
                if ((Comp_Menu_progs[i].sprite.y<=6+Menu_pos[1])||((Comp_Menu_progs[i].sprite.y>=197+Menu_pos[1])))
                {
                    Comp_Menu_progs[i].speed[1] = -Comp_Menu_progs[i].speed[1];
                    Comp_Menu_progs[i].sprite.y +=(2*Math.round(Comp_Menu_progs[i].speed[1]))
                }

                Current_Sprite = Sget("CM Cursor");
                Other_Sprite = Comp_Menu_progs[i].sprite;
                if ((Other_Sprite.active)&&(Other_Sprite.y!=null)&&(((Current_Sprite.y<Other_Sprite.y+Other_Sprite.height)&&(Current_Sprite.y+Current_Sprite.height>Other_Sprite.y)&&(Current_Sprite.x<Other_Sprite.x+Other_Sprite.width)&&(Current_Sprite.x+Current_Sprite.width>Other_Sprite.x))))
                {
                    if (Other_Sprite.name.substring(3, 7)=="Viru")
                    {
                        Comp_Menu_progress++;
                        Other_Sprite.active=false;
                    }                    
                    else
                    {
                        Comp_Menu_progress--;
                        if (Comp_Menu_progress>=0)
                        {
                            //new vir in
                            for (let k =0;k<Comp_Menu_progs.length;k++)
                            {
                                if ((Comp_Menu_progs[k].sprite.name.substring(3, 7)=="Viru")&&(!Comp_Menu_progs[k].sprite.active))
                                {
                                    New_Food = Comp_Menu_progs[k].sprite;
                                    Norm = true;
                                    while(Norm)
                                    {
                                        Norm=false;
                                        Sset(New_Food,randomInt(Menu_pos[0]+6,Menu_pos[0]+316),randomInt(Menu_pos[1]+6,Menu_pos[1]+197));
                                        for (let j=0;j<13;j++)
                                        {
                                            Other_Sprite1 = Sget((["CM Cursor","CM Virus 0","CM Virus 1","CM Virus 2","CM Virus 3","CM Virus 4","CM Virus 5","CM App 0","CM App 1","CM App 2","CM App 3","CM App 4","CM App 5",])[j]);
                                            if ((New_Food.name!=Other_Sprite1.name)&&(Other_Sprite1.y!=null)&&(((New_Food.y<Other_Sprite1.y+Other_Sprite1.height)&&(New_Food.y+New_Food.height>Other_Sprite1.y)&&(New_Food.x<Other_Sprite1.x+Other_Sprite1.width)&&(New_Food.x+New_Food.width>Other_Sprite1.x))))
                                            {
                                                Norm=true;
                                                j=13;
                                            }
                                        }
                                    }
                                    New_Food.active=true;
                                    Comp_Menu_progs[k].x = New_Food.x;
                                    Comp_Menu_progs[k].y = New_Food.y;
                                    Comp_Menu_progs[k].speed[0]=randomInt(-10,11)/10;
                                    Comp_Menu_progs[k].speed[1]=randomInt(-10,11)/10;
                                    k=Comp_Menu_progs.length;
                                }
                            }
                        }
                        if (Comp_Menu_progress<0)
                        {
                            Comp_Menu_progress=0;                              
                        }
                        Norm = true;
                        while(Norm)
                        {
                            Norm=false;
                            Sset(Other_Sprite,randomInt(Menu_pos[0]+6,Menu_pos[0]+316),randomInt(Menu_pos[1]+6,Menu_pos[1]+197));
                            for (let j=0;j<13;j++)
                            {
                                Other_Sprite1 = Sget((["CM Cursor","CM Virus 0","CM Virus 1","CM Virus 2","CM Virus 3","CM Virus 4","CM Virus 5","CM App 0","CM App 1","CM App 2","CM App 3","CM App 4","CM App 5",])[j]);
                                if ((Other_Sprite.name!=Other_Sprite1.name)&&(Other_Sprite1.y!=null)&&(((Other_Sprite.y<Other_Sprite1.y+Other_Sprite1.height)&&(Other_Sprite.y+Other_Sprite.height>Other_Sprite1.y)&&(Other_Sprite.x<Other_Sprite1.x+Other_Sprite1.width)&&(Other_Sprite.x+Other_Sprite.width>Other_Sprite1.x))))
                                {
                                    Norm=true;
                                    j=13;
                                }
                            }
                        }
                        Comp_Menu_progs[i].x = Other_Sprite.x;
                        Comp_Menu_progs[i].y = Other_Sprite.y;
                        Comp_Menu_progs[i].speed[0]=randomInt(-10,11)/10;
                        Comp_Menu_progs[i].speed[1]=randomInt(-10,11)/10;
                    }
                }
            }
            if ((events[3].hp==0)||((!player.action_buffer)&&((keys[act])||((gp)&&(gp.buttons[1].pressed)))))
            {
                Comp_Menu_Used_By=null;
                player.control_Delay=0;
                player.action_buffer=true;
                Temp_array = ["CM Cursor","CM Virus 0","CM Virus 1","CM Virus 2","CM Virus 3","CM Virus 4","CM Virus 5","CM App 0","CM App 1","CM App 2","CM App 3","CM App 4","CM App 5","CM Base",];
                for (let i=0;i<Temp_array.length;i++)
                {
                    Sget((Temp_array)[i]).active=false;
                }
                if(Comp_Menu_progress==6)
                {
                    Reset_Event(events[3]);
                }
            }
        }
        else if ((Electro_Menu_Used_By!=null)&&(Electro_Menu_Used_By.idl==player.idl))
        {
            if (player.idl=="player_2_Idl")
            {
                Menu_pos[0]+=350-Sget("EM Base").width;
            }
            if (Electro_Menu_Buffer&&(!((((keys[up])||((gp)&&(gp.axes[1]<-0.8)&&(gp.axes[0]>-0.15)&&(gp.axes[0]<0.15)))&&(!((keys[left])||(keys[right])||(keys[down]))))||(((keys[down])||((gp)&&(gp.axes[1]>0.8)&&(gp.axes[0]>-0.15)&&(gp.axes[0]<0.15)))&&(!((keys[left])||(keys[right])||(keys[up])))))))
            {
                Electro_Menu_Buffer=false;
            }
            if ((!Electro_Menu_Buffer)&&(((keys[up])||((gp)&&(gp.axes[1]<-0.8)&&(gp.axes[0]>-0.15)&&(gp.axes[0]<0.15)))&&(!((keys[left])||(keys[right])||(keys[down])))))
            {
                if (Electro_Menu_Selected>0)
                {
                    Electro_Menu_Selected--
                }
                else
                {
                    Electro_Menu_Selected=3;
                }
                Electro_Menu_Buffer=true;
            }
            else if (((keys[left])||((gp)&&(gp.axes[0]<-0.8)&&(gp.axes[1]>-0.25)))&&(!((keys[up])||(keys[right])||(keys[down]))))
            {
                if(Electro_Menu_Selected==0)
                {
                    if (Electro_Menu_BX>0)
                    {
                        Electro_Menu_BX--;
                    }
                }
                else if(Electro_Menu_Selected==1)
                {
                    if (Electro_Menu_BY>0)
                    {
                        Electro_Menu_BY--;
                    }
                }
                else if(Electro_Menu_Selected==2)
                {
                    if (Electro_Menu_SX>0)
                    {
                        Electro_Menu_SX--;
                    }
                }
                else if(Electro_Menu_Selected==3)
                {
                    if (Electro_Menu_SY>0)
                    {
                        Electro_Menu_SY--;
                    }
                }
            }
            else if (((keys[right])||((gp)&&(gp.axes[0]>0.8)&&(gp.axes[1]>-0.25)))&&(!((keys[left])||(keys[up])||(keys[down]))))
            {
                if(Electro_Menu_Selected==0)
                {
                    if (Electro_Menu_BX<100)
                    {
                        Electro_Menu_BX++;
                    }
                }
                else if(Electro_Menu_Selected==1)
                {
                    if (Electro_Menu_BY<100)
                    {
                        Electro_Menu_BY++;
                    }
                }
                else if(Electro_Menu_Selected==2)
                {
                    if (Electro_Menu_SX<100)
                    {
                        Electro_Menu_SX++;
                    }
                }
                else if(Electro_Menu_Selected==3)
                {
                    if (Electro_Menu_SY<100)
                    {
                        Electro_Menu_SY++;
                    }
                }
            }
            else if ((!Electro_Menu_Buffer)&&(((keys[down])||((gp)&&(gp.axes[1]>0.8)&&(gp.axes[0]>-0.15)&&(gp.axes[0]<0.15)))&&(!((keys[left])||(keys[right])||(keys[up])))))
            {
                if (Electro_Menu_Selected<3)
                {
                    Electro_Menu_Selected++
                }
                else
                {
                    Electro_Menu_Selected=0;
                }
                Electro_Menu_Buffer=true;
            }
            Sset(Sget("EM Select"),Menu_pos[0],Menu_pos[1]+(Electro_Menu_Selected*32));
            Sget("EM Heals BX").width = Math.round((Electro_Menu_BX/100)*71);
            Sget("EM Heals BY").width = Math.round((Electro_Menu_BY/100)*71);
            Sget("EM Heals SX").width = Math.round((Electro_Menu_SX/100)*71);
            Sget("EM Heals SY").width = Math.round((Electro_Menu_SY/100)*71);
            Sget("EM Heals D").width = Math.round((Electro_Menu_progress/100)*75);
            Sset(Sget("EM Big"),89+Math.round(Menu_pos[0]+(82*(Electro_Menu_BX/100))),6+Math.round(Menu_pos[1]+(81*((100-Electro_Menu_BY)/100))));
            Sset(Sget("EM Small"),Sget("EM Big").x+Math.round((53*(Electro_Menu_SX/100))),Sget("EM Big").y+Math.round((51*((100-Electro_Menu_SY)/100))));
            Other_Sprite = Sget("EM Small");
            Current_Sprite = Sget("EM Light");
            if ((Other_Sprite.y!=null)&&(((Current_Sprite.y>=Other_Sprite.y)&&(Current_Sprite.y+Current_Sprite.height<Other_Sprite.height+Other_Sprite.y)&&(Current_Sprite.x>=Other_Sprite.x)&&(Current_Sprite.x+Current_Sprite.width<=Other_Sprite.width+Other_Sprite.x))))
            {
                if (Electro_Menu_progress<100)
                {
                    Electro_Menu_progress++;
                }
            }
            else
            {
                if (Electro_Menu_progress>0)
                {
                    Electro_Menu_progress--;
                }
            }
            if ((events[4].hp==0)||(Electro_Menu_progress==100)||((!player.action_buffer)&&((keys[act])||((gp)&&(gp.buttons[1].pressed)))))
            {
                Electro_Menu_Used_By=null;
                player.control_Delay=0;
                player.action_buffer=true;
                Temp_array = ["EM Heals D","EM Heals BX","EM Heals BY","EM Heals SX","EM Heals SY","EM Light","EM Small","EM Big","EM Select","EM Base",];
                for (let i=0;i<Temp_array.length;i++)
                {
                    Sget((Temp_array)[i]).active=false;
                }
                if(Electro_Menu_progress==100)
                {
                    Reset_Event(events[4]);
                }
            }
        }
        else if ((Cabel_Menu_Used_By!=null)&&(Cabel_Menu_Used_By.idl==player.idl))
        {
            Wires_Array = [["CaM G 0","CaM G 1","CaM G 2"],["CaM B 0","CaM B 1","CaM B 2"],["CaM O 0","CaM O 1","CaM O 2"]];
            Sget(Wires_Array[Cabel_Menu_selected][Cabel_Menu_selected_2]).active = false;
            Sget((["CaM G Selected","CaM B Selected","CaM O Selected"])[Cabel_Menu_selected]).active = true;
            for (let i =0;i<3;i++)
            {
                if (Cabel_Menu_progress[i*2]==Cabel_Menu_selected_2)
                {
                    Sget((["CaM G Selected 2","CaM B Selected 2","CaM O Selected 2"])[i]).active = true;
                    Sget((["CaM G Selected","CaM B Selected","CaM O Selected"])[i]).active = true;
                    Sget(Wires_Array[i][Cabel_Menu_progress[i*2]]).active = false;
                }
            }
            Sset(Sget("CaM G Selected 2"),player.menu_pos[0],player.menu_pos[1]+(Cabel_Menu_progress[0]*68));
            Sset(Sget("CaM B Selected 2"),player.menu_pos[0],player.menu_pos[1]+(Cabel_Menu_progress[2]*68));
            Sset(Sget("CaM O Selected 2"),player.menu_pos[0],player.menu_pos[1]+(Cabel_Menu_progress[4]*68));
            Sset(Sget("CaM G Selected"),player.menu_pos[0],player.menu_pos[1]);
            Sset(Sget("CaM B Selected"),player.menu_pos[0],player.menu_pos[1]+(1*68))
            Sset(Sget("CaM O Selected"),player.menu_pos[0],player.menu_pos[1]+(2*68));
            Sset(Sget((["CaM G Selected","CaM B Selected","CaM O Selected"])[Cabel_Menu_selected]),player.menu_pos[0]+20,Sget((["CaM G Selected","CaM B Selected","CaM O Selected"])[Cabel_Menu_selected]).y);
            if (Electro_Menu_Buffer&&(!((((keys[up])||((gp)&&(gp.axes[1]<-0.8)&&(gp.axes[0]>-0.15)&&(gp.axes[0]<0.15)))&&(!((keys[left])||(keys[right])||(keys[down]))))||((((keys[right])||((gp)&&(gp.axes[0]>0.8)&&(gp.axes[1]>-0.25)))&&(!((keys[left])||(keys[up])||(keys[down])))))||((((keys[left])||((gp)&&(gp.axes[0]<-0.8)&&(gp.axes[1]>-0.25)))&&(!((keys[up])||(keys[right])||(keys[down])))))||(((keys[down])||((gp)&&(gp.axes[1]>0.8)&&(gp.axes[0]>-0.15)&&(gp.axes[0]<0.15)))&&(!((keys[left])||(keys[right])||(keys[up])))))))
            {
                Electro_Menu_Buffer=false;
            }
            if ((!Electro_Menu_Buffer)&&(((keys[up])||((gp)&&(gp.axes[1]<-0.8)&&(gp.axes[0]>-0.15)&&(gp.axes[0]<0.15)))&&(!((keys[left])||(keys[right])||(keys[down])))))
            {
                if (Cabel_Menu_In_Wire)
                {
                    Cabel_Menu_selected_2--;
                    if (Cabel_Menu_selected_2==-1)
                    {
                        Cabel_Menu_selected_2=2;
                    }
                    for (let i=0;i<3;i++)
                    {
                        if ((Cabel_Menu_progress[i*2]==Cabel_Menu_selected_2)&&(Cabel_Menu_progress[(i*2)+1]==Cabel_Menu_selected_2))
                        {
                            Cabel_Menu_progress[(i*2)+1]=-1;
                            break;
                        }
                    }
                }
                else
                {
                    Cabel_Menu_selected--;
                    if (Cabel_Menu_selected==-1)
                    {
                        Cabel_Menu_selected=2;
                    }
                    for (let i=0;i<3;i++)
                    {
                        if ((Cabel_Menu_progress[i*2]==Cabel_Menu_progress[(i*2)+1])&&(i==Cabel_Menu_selected))
                        {
                            Cabel_Menu_progress[(i*2)+1]=-1;
                            break;
                        }
                    }
                }
                Electro_Menu_Buffer=true;
            }
            else if ((!Electro_Menu_Buffer)&&((keys[left])||((gp)&&(gp.axes[0]<-0.8)&&(gp.axes[1]>-0.25)))&&(!((keys[up])||(keys[right])||(keys[down]))))
            {
                Cabel_Menu_In_Wire = false;
                for (let i = 0; i <3;i++)
                {
                    if (Cabel_Menu_progress[i*2]!=Cabel_Menu_progress[(i*2)+1])
                    {
                        Cabel_Menu_selected = i;
                        break;
                    }
                }
                Electro_Menu_Buffer=true;
            }
            else if ((!Electro_Menu_Buffer)&&((keys[right])||((gp)&&(gp.axes[0]>0.8)&&(gp.axes[1]>-0.25)))&&(!((keys[left])||(keys[up])||(keys[down]))))
            {
                Cabel_Menu_In_Wire = true;
                Cabel_Menu_selected_2=0;
                for (let i = 0; i <3;i++)
                {
                    if ((Cabel_Menu_progress[i*2]!=Cabel_Menu_progress[(i*2)+1])&&(Cabel_Menu_progress[i*2]>Cabel_Menu_selected_2))
                    {
                        Cabel_Menu_selected_2 = Cabel_Menu_progress[i*2];
                    }
                }
                Electro_Menu_Buffer=true;
            }
            else if ((!Electro_Menu_Buffer)&&(((keys[down])||((gp)&&(gp.axes[1]>0.8)&&(gp.axes[0]>-0.15)&&(gp.axes[0]<0.15)))&&(!((keys[left])||(keys[right])||(keys[up])))))
            {
                if (Cabel_Menu_In_Wire)
                {
                    Cabel_Menu_selected_2++;
                    if (Cabel_Menu_selected_2==3)
                    {
                        Cabel_Menu_selected_2=0;
                    }
                    for (let i=0;i<3;i++)
                    {
                        if ((Cabel_Menu_progress[i*2]==Cabel_Menu_selected_2)&&(Cabel_Menu_progress[(i*2)+1]==Cabel_Menu_selected_2))
                        {
                            Cabel_Menu_progress[(i*2)+1]=-1;
                            break;
                        }
                    }
                }
                else
                {
                    Cabel_Menu_selected++;
                    if (Cabel_Menu_selected==3)
                    {
                        Cabel_Menu_selected=0;
                    }
                    for (let i=0;i<3;i++)
                    {
                        if ((Cabel_Menu_progress[i*2]==Cabel_Menu_progress[(i*2)+1])&&(i==Cabel_Menu_selected))
                        {
                            Cabel_Menu_progress[(i*2)+1]=-1;
                            break;
                        }
                    }
                }
                Electro_Menu_Buffer=true;
            }
            if (Cabel_Menu_In_Wire)
            {                
                Cabel_Menu_progress[(Cabel_Menu_selected*2)+1]=Cabel_Menu_selected_2;
                Sget(Wires_Array[Cabel_Menu_selected][Cabel_Menu_selected_2]).active = true;
                Sget((["CaM G Selected","CaM B Selected","CaM O Selected"])[Cabel_Menu_selected]).active = false;
                for (let i =0;i<3;i++)
                {
                    if (Cabel_Menu_progress[i*2]==Cabel_Menu_selected_2)
                    {
                        Sget((["CaM G Selected 2","CaM B Selected 2","CaM O Selected 2"])[i]).active = false;
                    }
                }
            }
            is_Done = true;
            for (let i =0;i<3;i++)
            {
                if (Cabel_Menu_progress[i*2]==Cabel_Menu_progress[(i*2)+1])
                {
                    Sget((["CaM G Selected","CaM B Selected","CaM O Selected"])[i]).active = false;
                    Sget((["CaM G Selected 2","CaM B Selected 2","CaM O Selected 2"])[i]).active = false;
                    Sget(Wires_Array[i][Cabel_Menu_progress[i*2]]).active = true;
                }
                else
                {                    
                    is_Done = false;
                }
            }
            if ((events[5].hp==0)||(is_Done)||((!player.action_buffer)&&((keys[act])||((gp)&&(gp.buttons[1].pressed)))))
            {
                Cabel_Menu_Used_By=null;
                player.control_Delay=0;
                player.action_buffer=true;
                Temp_array = ["CaM G Selected","CaM B Selected","CaM O Selected","CaM G Selected 2","CaM B Selected 2","CaM O Selected 2","CaM Base","CaM G","CaM B","CaM O","CaM G 0","CaM B 0","CaM O 0","CaM G 1","CaM B 1","CaM O 1","CaM G 2","CaM B 2","CaM O 2",];
                for (let i=0;i<Temp_array.length;i++)
                {
                    Sget((Temp_array)[i]).active=false;
                }
                if(is_Done)
                {
                    Reset_Event(events[5]);
                }
            }
        }
    }
}

function draw() {
    graphic.clearRect(0, 0, Scene.width, Scene.height);
    graphic.drawImage(Background, X_Skift, Y_Skift);
    for (let i = 0; i<sprites.length;i++)
    {
        if (sprites[i].active){
            Temp_X = sprites[i].x;
            Temp_Y = sprites[i].y;
            if (sprites[i].relative)
            {
                Temp_X = sprites[i].x+X_Skift;
                Temp_Y = sprites[i].y+Y_Skift;
            }
            buttonRight.value = sprites[i].frames[sprites[i].frame*2]*sprites[i].width;
            graphic.drawImage(sprites[i].image,sprites[i].frames[sprites[i].frame*2]*sprites[i].width,0,sprites[i].width, sprites[i].height, Temp_X, Temp_Y,sprites[i].width, sprites[i].height);
        }
    }
}

function loop() {
    //buttonRight.value = player1.speed[0];
    Calcs(player1,1,"a","w","d","r","shift","s");
    Calcs(player2,0,"j","i","l","p","enter","k");
    Cocktail_Update();
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
    
    if(Sprites_Ready) {
        player1.width = sprites.find(s => s.name === "player_1_Idl").width;
        player1.height = sprites.find(s => s.name === "player_1_Idl").height;
        player2.width = sprites.find(s => s.name === "player_2_Idl").width;
        player2.height = sprites.find(s => s.name === "player_2_Idl").height;
        Prioritise_Sprites();
    Set_Events();
    loop(); 
    }         
}

function Sprites_Update(){
    for (let i = 0; i<sprites.length;i++)
    {
        if (sprites[i].active){
            if (sprites[i].speed<=0)
            {
                sprites[i].frame++;
                if (sprites[i].frame==sprites[i].frames.length/2)
                {
                    if (sprites[i].replay)
                    {
                        sprites[i].frame = 0;
                    }
                    else
                    {
                        sprites[i].frame--;
                    }
                }
                sprites[i].speed=sprites[i].frames[sprites[i].frame*2+1];
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
            hp: 3600,
            hp_def: 3600,
            recovered:0,
            Action_area: [Sget("Sea Wall Undam").x+Sget("Sea Wall Undam").width-1,Sget("Sea Wall Undam").y,Sget("Sea Wall Undam").x+(2*Sget("Sea Wall Undam").width),Sget("Sea Wall Undam").y+Sget("Sea Wall Undam").height]
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
            hp: 3600,
            hp_def: 3600,
            recovered:0,
            Action_area: [Sget("Sat").x-(Sget("Sat").width/2),Sget("Sat").y,Sget("Sat").x,Sget("Sat").y+Sget("Sat").height]
        },

        {
            name:"Fish",
            idl: "Fish", 
            dameged:"Fish Dam", 
            destroyed:"Fish Des", 
            idl_ico:"Fish Ico", 
            dameged_ico:"Fish Ico Dam", 
            destroyed_ico:"Fish Ico Des", 
            high:"Fish High", 
            active:false, 
            just_recovered:false,
            hp: 3600,
            hp_def: 3600,
            recovered:0,
            Action_area: [Sget("Fish").x-(Sget("Fish").width),Sget("Fish").y-20,Sget("Fish").x+(Sget("Fish").width),Sget("Fish").y+Sget("Fish").height]
        },

        {
            name:"Comp",
            idl: "Comp", 
            dameged:"Comp Dam", 
            destroyed:"Comp Des", 
            idl_ico:"Comp Ico", 
            dameged_ico:"Comp Ico Dam", 
            destroyed_ico:"Comp Ico Des", 
            high:"Comp High", 
            active:false, 
            just_recovered:false,
            hp: 3600,
            hp_def: 3600,
            recovered:0,
            Action_area: [Sget("Comp").x,Sget("Comp").y-20,Sget("Comp").x+(Sget("Comp").width),Sget("Comp").y+Sget("Comp").height]
        },

        {
            name:"Electro",
            idl: "Electro", 
            dameged:"Electro Dam", 
            destroyed:"Electro Des", 
            idl_ico:"Electro Ico", 
            dameged_ico:"Electro Ico Dam", 
            destroyed_ico:"Electro Ico Des", 
            high:"Electro High", 
            active:false, 
            just_recovered:false,
            hp: 3600,
            hp_def: 3600,
            recovered:0,
            Action_area: [Sget("Electro").x+20,Sget("Electro").y,Sget("Electro").x+(Sget("Electro").width)-40,Sget("Electro").y+Sget("Electro").height]
        },

        {
            name:"Cabel",
            idl: "Cabel", 
            dameged:"Cabel Dam", 
            destroyed:"Cabel Des", 
            idl_ico:"Cabel Ico", 
            dameged_ico:"Cabel Ico Dam", 
            destroyed_ico:"Cabel Ico Des", 
            high:"Cabel High", 
            active:false, 
            just_recovered:false,
            hp: 1400,
            hp_def: 1400,
            recovered:0,
            Action_area: [Sget("Cabel").x-(Sget("Cabel").width*2),Sget("Cabel").y-Sget("Cabel").height*2,Sget("Cabel").x,Sget("Cabel").y+Sget("Cabel").height]
        }
    ];
}

let Events_Update_cooldown = 100;

function Events_Update(){
    avaible_events = events.length;
    for (let i = 0; i< events.length;i++)
    {
        if (events[i].active==true)
        {
            if ((events[i].hp>0)&&(((player1.x>=(X_Skift+events[i].Action_area[0]))&&(player1.x<=(X_Skift+events[i].Action_area[2]))&&(player1.y>=(Y_Skift+events[i].Action_area[1]))&&(player1.y<(Y_Skift+events[i].Action_area[3])))||((player2.x>=(X_Skift+events[i].Action_area[0]))&&(player2.x<=(X_Skift+events[i].Action_area[2]))&&(player2.y>=(Y_Skift+events[i].Action_area[1]))&&(player2.y<(Y_Skift+events[i].Action_area[3])))))
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
            if ((player.x>=(X_Skift+events[i].Action_area[0]))&&(player.x<=(X_Skift+events[i].Action_area[2]))&&(player.y>=(Y_Skift+events[i].Action_area[1]))&&(player.y<(Y_Skift+events[i].Action_area[3])))               
            {                                
                Menu_pos = [player.menu_pos[0],player.menu_pos[1]];
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

                    if (player.idl=="player_2_Idl")
                    {
                        Menu_pos[0]+=350-Sget("SM Base").width;
                    }
                    Sset(Sget("SM Base"),Menu_pos[0],Menu_pos[1]);
                    Sset(Sget("SM No Signal"),Menu_pos[0],Menu_pos[1]);
                    Sset(Sget("SM Yes Signal"),Menu_pos[0],Menu_pos[1]);
                    Sset(Sget("SM Anten 0"),Menu_pos[0],Menu_pos[1]);
                    Sset(Sget("SM Anten 1"),Menu_pos[0],Menu_pos[1]);
                    Sset(Sget("SM Anten 2"),Menu_pos[0],Menu_pos[1]);
                    Sset(Sget("SM Anten 3"),Menu_pos[0],Menu_pos[1]);
                    Sset(Sget("SM Anten 4"),Menu_pos[0],Menu_pos[1]);
                    Sset(Sget("SM Signal 0"),Menu_pos[0],Menu_pos[1]);
                    Sset(Sget("SM Signal 1"),Menu_pos[0],Menu_pos[1]);
                    Sset(Sget("SM Signal 2"),Menu_pos[0],Menu_pos[1]);
                    Sset(Sget("SM Signal 3"),Menu_pos[0],Menu_pos[1]);
                    Sset(Sget("SM Signal 4"),Menu_pos[0],Menu_pos[1]);
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
                else if ((events[i].name=="Fish")&&(Fish_Menu_Used_By==null))
                {
                    Temp_array = ["FM Food 0","FM Food 1","FM Food 2","FM Food 3","FM Food 4","FM Food 5","FM Enemy 0","FM Enemy 1","FM Enemy 2","FM Enemy 3","FM Enemy 4","FM Enemy 5","FM Fish 0","FM Fish 1","FM Fish 2","FM Fish 3","FM Fish 4","FM Fish 5","FM Fish 6","FM Fish 7","FM HP 6","FM HP 5","FM HP 4","FM HP 3","FM HP 2","FM HP 1","FM HP 0","FM Base",];
                    if (player.idl=="player_2_Idl")
                    {
                        Menu_pos[0]+=350-Sget("FM Base").width;
                    }
                    for (let i=0;i<Temp_array.length;i++)
                    {
                        Sget((Temp_array)[i]).active=true;
                        if(i>=20)
                        {
                            Sset(Sget((Temp_array)[i]),Menu_pos[0],Menu_pos[1]);
                        }
                        else if ((i>=12)&&(i<20))
                        {
                            Sset(Sget((Temp_array)[i]),Menu_pos[0]+111,Menu_pos[1]+101);
                            Sget((Temp_array)[i]).active=false;
                        }
                    }
                    Sget((Temp_array)[16]).active=true;
                    Fish_Menu_Used_By = player;
                    player.control_Delay = -1;
                    Fish_Menu_progress = 0;
                    
                    for (let i=0;i<12;i++)
                    {
                        Current_Sprite = Sget((Temp_array)[i]);
                        Norm = true;
                        while(Norm)
                        {
                            Norm=false;
                            Sset(Current_Sprite,randomInt(Menu_pos[0]+6,Menu_pos[0]+216),randomInt(Menu_pos[1]+6,Menu_pos[1]+197));
                            for (let j=0;j<13;j++)
                            {
                                Other_Sprite = Sget((Temp_array)[j]);
                                if (( i!=j )&&(Other_Sprite.y!=null)&&(((Current_Sprite.y<Other_Sprite.y+Other_Sprite.height)&&(Current_Sprite.y+Current_Sprite.height>Other_Sprite.y)&&(Current_Sprite.x<Other_Sprite.x+Other_Sprite.width)&&(Current_Sprite.x+Current_Sprite.width>Other_Sprite.x))))
                                {
                                    Norm=true;
                                    j=12;
                                }
                            }
                        }
                    }
                    
                }
                else if ((events[i].name=="Comp")&&(Comp_Menu_Used_By==null))
                {
                    Temp_array = ["CM Base","CM Cursor","CM Virus 0","CM Virus 1","CM Virus 2","CM Virus 3","CM Virus 4","CM Virus 5","CM App 0","CM App 1","CM App 2","CM App 3","CM App 4","CM App 5"];
                    Sget(Temp_array[0]).active=true;
                    Sset(Sget(Temp_array[0]),Menu_pos[0],Menu_pos[1]);
                    Sget(Temp_array[1]).active=true;
                    Sset(Sget(Temp_array[1]),Menu_pos[0]+(Sget(Temp_array[0]).width/2),Menu_pos[1]+(Sget(Temp_array[0]).height/2));
                    Comp_Menu_Used_By = player;
                    player.control_Delay = -1;
                    Comp_Menu_progress = 0;
                    Comp_Menu_progs=[];
                    for (let i =2; i < Temp_array.length;i++)
                    {
                        Current_Sprite = Sget((Temp_array)[i]);
                        Norm = true;
                        while(Norm)
                        {
                            Norm=false;
                            Sset(Current_Sprite,randomInt(Menu_pos[0]+6,Menu_pos[0]+314),randomInt(Menu_pos[1]+6,Menu_pos[1]+197));
                            for (let j=2;j<Temp_array.length;j++)
                            {
                                Other_Sprite = Sget((Temp_array)[j]);
                                if (( i!=j )&&(Other_Sprite.y!=null)&&(((Current_Sprite.y<Other_Sprite.y+Other_Sprite.height)&&(Current_Sprite.y+Current_Sprite.height>Other_Sprite.y)&&(Current_Sprite.x<Other_Sprite.x+Other_Sprite.width)&&(Current_Sprite.x+Current_Sprite.width>Other_Sprite.x))))
                                {
                                    Norm=true;
                                    j=Temp_array.length;
                                }
                            }
                        }
                        Comp_Menu_progs.push({
                            id: 1,
                            sprite: Current_Sprite,
                            speed:[0.0,0.0],
                            x: Current_Sprite.x,
                            y: Current_Sprite.y
                        });
                        Comp_Menu_progs[i-2].speed[0]=randomInt(-10,11)/10;
                        Comp_Menu_progs[i-2].speed[1]=randomInt(-10,11)/10;
                        Current_Sprite.active = true;
                    }
                }
                else if ((events[i].name=="Electro")&&(Electro_Menu_Used_By==null))
                {
                    Electro_Menu_Used_By = player;
                    player.control_Delay = -1;
                    Electro_Menu_progress = 0;
                    Electro_Menu_Buffer = false;
                    Temp_array = ["EM Heals D","EM Heals BX","EM Heals BY","EM Heals SX","EM Heals SY","EM Light","EM Small","EM Big","EM Select","EM Base",];
                    for (let i=0;i<Temp_array.length;i++)
                    {
                        Sget(Temp_array[i]).active = true;
                    }
                    if (player.idl=="player_2_Idl")
                    {
                        Menu_pos[0]+=350-Sget("EM Base").width;
                    }
                    Sset(Sget("EM Base"),Menu_pos[0],Menu_pos[1]);
                    Electro_Menu_Selected=0;
                    Sset(Sget("EM Select"),Menu_pos[0],Menu_pos[1]+(Electro_Menu_Selected*22));
                    Sset(Sget("EM Big"),randomInt(Menu_pos[0]+89,Menu_pos[0]+171),randomInt(Menu_pos[1]+6,Menu_pos[1]+87));
                    Sset(Sget("EM Small"),randomInt(Sget("EM Big").x,Sget("EM Big").x+Sget("EM Big").width-30),randomInt(Sget("EM Big").y,Sget("EM Big").y+Sget("EM Big").height-30));
                    Current_Sprite = Sget("EM Light");
                    Norm = true;
                    while(Norm)
                    {
                        Norm=false;
                        Sset(Current_Sprite,randomInt(Menu_pos[0]+89+5,Menu_pos[0]+234-5),randomInt(Menu_pos[1]+6+5,Menu_pos[1]+147-5));
                        Other_Sprite = Sget("EM Small");
                        if ((Other_Sprite.y!=null)&&(((Current_Sprite.y<Other_Sprite.y+Other_Sprite.height)&&(Current_Sprite.y+Current_Sprite.height>Other_Sprite.y)&&(Current_Sprite.x<Other_Sprite.x+Other_Sprite.width)&&(Current_Sprite.x+Current_Sprite.width>Other_Sprite.x))))
                        {
                            Norm=true;
                        }
                    }
                    Electro_Menu_BX =Math.round(((Sget("EM Big").x-Menu_pos[0]-89)/82)*100);
                    Electro_Menu_BY =100-Math.round(((Sget("EM Big").y-Menu_pos[1]-6)/81)*100);
                    Electro_Menu_SX =Math.round(((Sget("EM Small").x-Sget("EM Big").x)/53)*100);
                    Electro_Menu_SY =100-Math.round(((Sget("EM Small").y-Sget("EM Big").y)/51)*100);
                    Sset(Sget("EM Heals BX"),Menu_pos[0]+11,Menu_pos[1]+27+(0*32));
                    Sget("EM Heals BX").width = Math.round((Electro_Menu_BX/100)*71);
                    Sset(Sget("EM Heals BY"),Menu_pos[0]+11,Menu_pos[1]+27+(1*32));
                    Sget("EM Heals BY").width = Math.round((Electro_Menu_BY/100)*71);
                    Sset(Sget("EM Heals SX"),Menu_pos[0]+11,Menu_pos[1]+27+(2*32));
                    Sget("EM Heals SX").width = Math.round((Electro_Menu_SX/100)*53);
                    Sset(Sget("EM Heals SY"),Menu_pos[0]+11,Menu_pos[1]+27+(3*32));
                    Sget("EM Heals SY").width = Math.round((Electro_Menu_SY/100)*51);
                    Sset(Sget("EM Heals D"),Menu_pos[0]+9,Menu_pos[1]+159);
                    Sget("EM Heals D").width = 0;                    
                }
                else if ((events[i].name=="Cabel")&&(Cabel_Menu_Used_By==null))
                {
                    Electro_Menu_Buffer = false;
                    Cabel_Menu_Used_By = player;
                    player.control_Delay = -1;
                    Cabel_Menu_progress = [-1,-1,-1,-1,-1,-1];
                    Cabel_Menu_selected = 0;
                    Cabel_Menu_selected_2 = 0;
                    Cabel_Menu_In_Wire=false;
                    Temp_array = ["CaM G Selected","CaM B Selected","CaM O Selected","CaM G Selected 2","CaM B Selected 2","CaM O Selected 2","CaM Base","CaM G","CaM B","CaM O","CaM G 0","CaM B 0","CaM O 0","CaM G 1","CaM B 1","CaM O 1","CaM G 2","CaM B 2","CaM O 2",];
                    for (let i=0;i<Temp_array.length;i++)
                    {
                        Sset(Sget(Temp_array[i]),player.menu_pos[0],player.menu_pos[1]);
                        if (["CaM G Selected","CaM B Selected","CaM O Selected","CaM G Selected 2","CaM B Selected 2","CaM O Selected 2","CaM Base", "CaM G", "CaM B", "CaM O"].includes(Temp_array[i]))
                        {
                            Sget(Temp_array[i]).active = true;
                        }
                    }
                    Cabel_Menu_progress[0]=randomInt(0,3);
                    Cabel_Menu_progress[2]=Cabel_Menu_progress[0];
                    while(Cabel_Menu_progress[2]==Cabel_Menu_progress[0])
                    {
                        Cabel_Menu_progress[2]=randomInt(0,3);
                    }
                    Cabel_Menu_progress[4]=Cabel_Menu_progress[0];
                    while((Cabel_Menu_progress[4]==Cabel_Menu_progress[2])||(Cabel_Menu_progress[4]==Cabel_Menu_progress[0]))
                    {
                        Cabel_Menu_progress[4]=randomInt(0,3);
                    }
                    Sset(Sget("CaM G"),player.menu_pos[0],player.menu_pos[1]+(Cabel_Menu_progress[0]*68));
                    Sset(Sget("CaM B"),player.menu_pos[0],player.menu_pos[1]+(Cabel_Menu_progress[2]*68));
                    Sset(Sget("CaM O"),player.menu_pos[0],player.menu_pos[1]+(Cabel_Menu_progress[4]*68));
                    Sset(Sget("CaM G Selected 2"),player.menu_pos[0],player.menu_pos[1]+(Cabel_Menu_progress[0]*68));
                    Sset(Sget("CaM B Selected 2"),player.menu_pos[0],player.menu_pos[1]+(Cabel_Menu_progress[2]*68));
                    Sset(Sget("CaM O Selected 2"),player.menu_pos[0],player.menu_pos[1]+(Cabel_Menu_progress[4]*68));
                    Sset(Sget("CaM G Selected"),player.menu_pos[0],player.menu_pos[1]);
                    Sset(Sget("CaM B Selected"),player.menu_pos[0],player.menu_pos[1]+(1*68))
                    Sset(Sget("CaM O Selected"),player.menu_pos[0],player.menu_pos[1]+(2*68));
                    Sset(Sget((["CaM G Selected","CaM B Selected","CaM O Selected"])[Cabel_Menu_selected]),player.menu_pos[0]+20,Sget((["CaM G Selected","CaM B Selected","CaM O Selected"])[Cabel_Menu_selected]).y);
                }
            }
        }
    }

    if ((Cocktail_Readyness[0]>=Cocktail_Readyness[1])&&((player.x>=584)&&(player.x<=637)&&(player.y>=279)&&(player.y<324)))
    {
        player.effects.push(["Speed2",1800,false]);
        Sget("Coctail Ready").active = false;
        Sget("Coctail Empty").active = true;
        Sget("Coctail High").active = false;  
        Cocktail_Readyness[0]=0;
    }
}

Cocktail_Readyness = [0,2520];

function Cocktail_Update()
{
    if (Cocktail_Readyness[0]>=Cocktail_Readyness[1])
    {
        Sget("Coctail Ready").active = true;
        Sget("Coctail Empty").active = false;   
        Sget("Coctail High").active = false;        
    }
    else
    {
        Cocktail_Readyness[0]++;
    }
    for (let i=0;i<2;i++)
    {
        if ((Cocktail_Readyness[0]>=Cocktail_Readyness[1])&&((([player1,player2])[i].x>=584)&&(([player1,player2])[i].x<=637)&&(([player1,player2])[i].y>=279)&&(([player1,player2])[i].y<324)))
        {
            Sget("Coctail Ready").active = false;
            Sget("Coctail Empty").active = false;   
            Sget("Coctail High").active = true;  
        }
    }
}

startGame();