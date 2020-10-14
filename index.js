
const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;

const scoreL = document.querySelector("#scoreL");

//start game button
const startGameBtn = document.querySelector("#startGameBtn");
const modalEL = document.querySelector("#modalEL");

const gameScore = document.querySelector("#gameScore");

class Player{
    constructor(x , y , radius , color){
        this.x = x;
        this.y = y;
        this.radius = radius; 
        this.color =  color;
    }

    draw(){
        c.beginPath();
        c.arc(this.x , this.y , this.radius , 0 , Math.PI*2 , false);
        c.fillStyle = this.color;
        c.fill();
    }

}


class Projectile{
    constructor(x , y , radius , color , velocity){
        this.x = x;
        this.y = y;
        this.radius = radius; 
        this.color =  color;
        this.velocity = velocity;
    }

    draw(){
        c.beginPath();
        c.arc(this.x , this.y , this.radius , 0 , Math.PI*2 , false);
        c.fillStyle = this.color;
        c.fill();
    }

    update(){
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }

}

class Enemy{
    constructor(x , y , radius , color , velocity){
        this.x = x;
        this.y = y;
        this.radius = radius; 
        this.color =  color;
        this.velocity = velocity;
    }

    draw(){
        c.beginPath();
        c.arc(this.x , this.y , this.radius , 0 , Math.PI*2 , false);
        c.fillStyle = this.color;
        c.fill();
    }

    update(){
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }

}

const friction = 0.99;
class Particle{
    constructor(x , y , radius , color , velocity){
        this.x = x;
        this.y = y;
        this.radius = radius; 
        this.color =  color;
        this.velocity = velocity;
        this.alpha = 1
    }

    draw(){
        c.save();
        c.globalAlpha = this.alpha;
        c.beginPath();
        c.arc(this.x , this.y , this.radius , 0 , Math.PI*2 , false);
        c.fillStyle = this.color;
        c.fill();
        c.restore();
    }

    update(){
        this.draw();
        this.velocity.x *= friction;
        this.velocity.y *= friction;
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
        this.alpha -= 0.01;
    }

}


const x = canvas.width / 2;
const y = canvas.height / 2;

let player = new Player(x, y , 20 , 'white');
let projectiles = [];
let Enemies = [];
let Particles = [];

function init(){
   player = new Player(x, y , 20 , 'white');
   projectiles = [];
   Enemies = [];
   Particles = [];
   score = 0;
   scoreL.innerHTML = score;
   gameScore.innerHTML = score; 
}



function spawnEnemies(){
    setInterval(() =>{
        const radius = 5 + Math.random()*26;
        const r = Math.floor((Math.random() * 4) + 1);
        
        var x = 0;
        var y = 0; 

        if(r==1){
             x = -30;
             y = Math.random()*canvas.height;
        }
        else if(r==2){
             x = canvas.width + 30;
             y = Math.random()*canvas.height;
        }
        else if(r==3){
             y = -30;
             x = Math.random()*canvas.width;
        }else{
             y = 30 + canvas.height;
             x = Math.random()*canvas.width;
        }


        const color = `hsl(${Math.random()*360} , 50% , 50%)`;
        
        const angle = Math.atan2(
            canvas.height/2 - y ,
            canvas.width/2 - x
        )

        const velocity = {
            x:Math.cos(angle),
            y:Math.sin(angle)
        }

        Enemies.push(new Enemy(x , y , radius , color , velocity));
    } , 1000);

}

let score = 0;
let animationId;
function animate(){
    animationId = requestAnimationFrame(animate);
    c.fillStyle = 'rgba(0 , 0 , 0, 0.1)';
    c.fillRect(0 , 0 , canvas.width , canvas.height);
    player.draw();

    Particles.forEach((particle , index) => {
        if(particle.alpha <= 0){
            Particles.splice(index , 1);
        }else{
            particle.update();
        }

        particle.update();
    });

    projectiles.forEach((projectile , index) => {
        projectile.update();
        if(projectile.x < -projectile.radius || projectile.x > canvas.width + projectile.radius || projectile.y < -projectile.radius || projectile.y > projectile.radius + canvas.height){
            setTimeout(() => {
                projectiles.splice(index , 1);

            }, 0 );
        }



    });

    Enemies.forEach((enemy ,index) => {
        enemy.update();
        //check for the collision between player and enemies
        const dist1 = Math.hypot(player.x - enemy.x , player.y - enemy.y )
        if( dist1 < enemy.radius + player.radius){
            cancelAnimationFrame(animationId);
            modalEL.style.display = 'flex';
            gameScore.innerHTML = score;
        }


        //check for collision between enemy and player
        projectiles.forEach((projectile , projectileIndex) =>{
            const dist = Math.hypot(projectile.x - enemy.x , projectile.y - enemy.y)
            if(dist < enemy.radius + projectile.radius){
                //create explosions
                

                for(let i = 0; i<enemy.radius*2 ; i++){
                    Particles.push(new Particle(projectile.x , projectile.y , Math.random()*2 , enemy.color , 
                        { x: (Math.random() - 0.5)*(Math.random()*6) ,
                          y: (Math.random() - 0.5)*(Math.random()*6)
                        }
                    ));
                }
                
                
                if(enemy.radius > 17){
                    score += 100 ;
                    scoreL.innerHTML = score;
                    
                    gsap.to(enemy, {
                        radius : enemy.radius - 10
                    })
                    
                    
                    setTimeout(() => {
                        projectiles.splice(projectileIndex ,1);
                    }, 0); 
                }else{
                    score += 250 ;
                    scoreL.innerHTML = score;
                    
                    setTimeout(() => {
                        Enemies.splice(index , 1);
                        projectiles.splice(projectileIndex ,1);
                    }, 0); 
                }
            }

        });

    });



}



addEventListener('click' , (event) => {
    
    const angle = Math.atan2(event.clientY - canvas.height/2 , event.clientX - canvas.width/2)
    const velocity = {
        x: 5*Math.cos(angle),
        y: 5*Math.sin(angle)
    }
    projectiles.push(new Projectile(canvas.width/2 , canvas.height/2 , 5 , 'white' , velocity));
});



startGameBtn.addEventListener('click' , () => {
    init();
    animate();
    spawnEnemies();
    modalEL.style.display = 'none';

});
