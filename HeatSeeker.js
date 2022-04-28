var gl;
var VBallPos;
var program
var carHitbox = []
var playing = false
var singlePlayer = true;
var score = 0;
var scoreDOM;

class Car
{
    constructor(carPos)
    {
        this.carPos = carPos
    }
    carWidth = .2
    up = false;
    down = false;
    offset = .0325
    speed = .05

    carHitbox = function ()
    {//left up right down
        return [this.carPos[0], this.carPos[1] + this.carWidth, this.carPos[0], this.carPos[1] - this.carWidth]
    }
}
var car = new Car([-.8, .0])

function collision()
{
    /*1- distance to the ball
    *   ball radius is x*x+y*y < r*r
    *   problem, finding the closest point where they touch. easier with square
    *
    *   ball hitbox is x+-r
    *
    *   horizontal first
    *   if(ball.x-r<=car.x and ball.x+r>=car.x)
    *       if(ball.y-r<=car.y and ball.y+r>=car.y)
    *
    *
    * */
}

let car2 = new Car([.8, .0])
console.log(car2)

var ball = class { }
ball.ballPos = [0.0, .8];
ball.ballVelocity = [0.0, 0.0];
ball.toBlue = false;
ball.counter = 0;
ball.maxSpeed = .05
ball.wallMult = .7
ball.radius = .030

ball.bounceWall = function (ballPosY)
{
    this.ballVelocity = [this.ballVelocity[0], -this.ballVelocity[1] * this.wallMult];
    this.ballPos[1] = ballPosY
}
ball.switchSide = function (ballPosX, ballVelocityY)
{
    this.toBlue = !this.toBlue
    this.ballPos[0] = ballPosX
    this.ballVelocity = [-this.ballVelocity[0] * this.wallMult, ballVelocityY]
    this.counter++
    if (this.counter > 20)
        this.counter = 20;
}
ball.update = function (acceleration)
{
    this.ballVelocity[0] += acceleration[0]
    this.ballVelocity[1] += acceleration[1]

    //normalization
    if (this.ballVelocity[0] * this.ballVelocity[0] + this.ballVelocity[1] * this.ballVelocity[1] > this.maxSpeed * this.maxSpeed)
    {
        let speed = normalize(this.ballVelocity, false)
        this.ballVelocity = [speed[0] * this.maxSpeed, speed[1] * this.maxSpeed]
    }

    this.ballPos[0] += this.ballVelocity[0] + acceleration[0];
    this.ballPos[1] += this.ballVelocity[1] + acceleration[1];
}


window.onload = function init()
{

    scoreDOM = document.getElementById("score")
    scoreDOM.innerHTML=score
    const canvas = document.getElementById("canvas");
    gl = WebGLUtils.setupWebGL(canvas)

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    document.getElementById("players").checked=false

    singlePlayer=true


    //associate buffer to data
    insertListeners()

    render();
}

function changePlayer()
{
    singlePlayer=!singlePlayer
    end()
    score = 0;
    scoreDOM.innerHTML=score
}
function end()
{
    playing = false

    ball.ballPos = [0.0, 0.8]

    car.carPos[1] = 0.0
    car2.carPos[1] = 0.0
    ball.ballVelocity = [0.0, 0.0]

    car.up = false;
    car.down = false;
    car2.up = false;
    car2.down = false;
    ball.toBlue = false
    
}

function insertListeners()
{
    document.addEventListener("keydown", function (e)
    {
        if (!playing)
        {
            playing = true;
        }
        switch (e.key)
        {
            case "ArrowUp": car2.up = true;
                break;
            case "ArrowDown": car2.down = true;
                break;
            case "w": car.up = true;
                break;
            case "s": car.down = true;
        }
    })
    document.addEventListener("keyup", function (e)
    {
        switch (e.key)
        {
            case "w": car.up = false;
                break;
            case "s": car.down = false;
                break;
            case "ArrowUp": car2.up = false;
                break;
            case "ArrowDown": car2.down = false;
                break;
        }
    })

}

function drawBall()
{
    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(ball.ballPos), gl.STATIC_DRAW);

    VBallPos = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(VBallPos, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(VBallPos);
}



function calcPosition()
{

    let acceleration = [0.0, 0.0]
    let center;
    let carCoords = car.carHitbox()
    let carCoords2 = car2.carHitbox()
        if(ball.ballPos[0]-ball.radius <= car.carPos[0] && ball.ballPos[0]+ball.radius >= car.carPos[0])
    {
    if (ball.ballPos[1] - ball.radius <= carCoords[1] && ball.ballPos[1] + ball.radius >= carCoords[3])
        {
            ball.switchSide(car.carPos[0] + car.offset, ball.ballPos[1] - car.carPos[1])
            if (singlePlayer) {
                score++
                scoreDOM.innerHTML=score
            }
        }
    }
        if(ball.ballPos[0]-ball.radius <= car2.carPos[0] && ball.ballPos[0]+ball.radius >= car2.carPos[0])
    {
    if (!singlePlayer && ball.ballPos[1] - ball.radius <= carCoords2[1] && ball.ballPos[1] + ball.radius >= carCoords2[3])
            ball.switchSide(car2.carPos[0] - car2.offset, ball.ballPos[1] - car2.carPos[1])
    }

    if (ball.ballPos[0] >= 1.0)
    {
        if (singlePlayer)
            ball.switchSide(1.0, ball.ballVelocity[1])
        else
        {
            end()
            score++
            scoreDOM.innerHTML=score
        }
    }
    if (ball.ballPos[0] <= -1.0)
    {
        end()
        if(singlePlayer)
            score = 0
        else
            score--
        scoreDOM.innerHTML=score
    }
    if (ball.ballPos[1] >= 1.0)
    {
        ball.bounceWall(1.0)

    }
    if (ball.ballPos[1] <= -1.0)
    {
        ball.bounceWall(-1.0)
    }

    if (ball.toBlue)
    {
        center = [-1.0, 0.0]

    }
    else
    {
        center = [1.0, 0.0]
    }

    acceleration[0] = (center[0] - ball.ballPos[0]) * .001
    acceleration[1] = (center[1] - ball.ballPos[1]) * .001

    ball.update(acceleration)


    //console.log(ballVelocity[0]*ballVelocity[0]+ballVelocity[1]*ballVelocity[1])
    //console.log(ballVelocity);
    //console.log(toBlue)
    //console.log("Ballpos "+ballPos);
    //console.log(ballPos[0]+ballVelocity[0]*.17)



}

function resetScore()
{
    score = 0;
    scoreDOM.innerHTML=score
}

/*{
    (ball.ballPos[0] <= car.carPos[0] + car.offset && ball.ballPos[0] >= car.carPos[0]) && (carCoords[1] >= ball.ballPos[1] && carCoords[3] <= ball.ballPos[1])
    //!(ball2x < carpos1x && (ball))
}*/

function drawCar(cari)
{
    if (cari.up)
        cari.carPos[1] += car.speed;


    if (cari.down)
        cari.carPos[1] -= car.speed;


    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cari.carHitbox()), gl.STATIC_DRAW);

    VBallPos = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(VBallPos, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(VBallPos);
}

function render()
{
    gl.clear(gl.COLOR_BUFFER_BIT);
    if (playing)
    {
        calcPosition()
    }
    drawBall()
    gl.drawArrays(gl.POINTS, 0, 1);

    drawCar(car)
    gl.drawArrays(gl.LINES, 0, 2);
    if (!singlePlayer)
    {
        drawCar(car2)
        gl.drawArrays(gl.LINES, 0, 2);
    }
    requestAnimationFrame(render);
}