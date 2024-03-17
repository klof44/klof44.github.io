let tiles = []
let width = 32;
let height = 15;
let tileNames = {
    0: "empty.png",
    1: "red.png",
    2: "orange.png",
    3: "yellow.png",
    4: "green.png",
    5: "blue.png",
    6: "purple.png",
    7: "pink.png",
    8: "teal.png",
    9: "gray.png",
    10: "another-green.png",
}

let combo = 0;
let maxCombo = 0;

let hitSound = new Audio("/static/audio/colour-tiles/ding.wav")
hitSound.volume = 0.5

let missSound = new Audio("/static/audio/colour-tiles/combobreak.mp3")
missSound.volume = 0.5

let winSound = new Audio("/static/audio/colour-tiles/developerWin.wav")
winSound.volume = 0.01
winSound.muted = false

let mute = false

let board = document.getElementById("board")

let mousex = 0
let mousey = 0
document.addEventListener("mousemove", (e) => {
    mousex = e.clientX
    mousey = e.clientY
    UpdateFL()
})

document.addEventListener("keypress", (e) => {
    if (e.key == "r") {
        ResetGame()
        StartGame()
    }
})

function StartGame() {
    let start = document.getElementById("start")
    start.remove()

    let endText = document.getElementById("end-text")
    endText?.remove()

    let scoreElement = document.getElementById("score")
    scoreElement.innerHTML = "Score: 0"

    board.style.flexDirection = "row"

    if (htMod)
        time = 240
    else
        time = 120
    
    score = 0
    updateTime()

	combo = 0;
	maxCombo = 0;

    let modsMenu = document.getElementById("mods")
    modsMenu.classList.add("mods-locked")

    createTiles()
    CreateBoard()
    StartTimer()
}

function EndGame(restarted = false) {
    tiles = []

    board.innerHTML = ""
    board.style.flexDirection = "column"

    if (!restarted) {
        if (!mute) {
            let win = winSound.cloneNode(true)
            win.play()
            win.remove()
        }

        let endText = document.createElement("p")
        endText.innerHTML = `Game Over!\r\nScore: ${document.getElementById("score").innerHTML.slice(7)}<br>Max Combo: x${maxCombo}`
        endText.id = "end-text"

        board.appendChild(endText)
    }

    let start = document.createElement("button")
    start.innerHTML = "Start!"
    start.id = "start"
    start.onclick = StartGame

    board.appendChild(start)

    let modsMenu = document.getElementById("mods")
    modsMenu.classList.remove("mods-locked")

    time = 0;
}

function ResetGame() {
    clearInterval(interval)
    EndGame(true)
}

function createTiles() {
    for (let i = 0; i < height; i++) {
        tiles[i] = []
        for (let j = 0; j < width; j++) {
            let chance = Math.floor(Math.random() * 100)
            if (chance < 30) {
                tiles[i][j] = 0
            } else {
                tiles[i][j] = Math.floor(Math.random() * 10) + 1
            }
        }
    }
}

function CreateBoard() {
    let flip = true

    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            let tile = document.createElement("img")
            tile.src = "/static/img/colour-tiles/" + tileNames[tiles[i][j]]
            tile.classList.add("tile")
            tile.id = i + "-" + j
            tile.draggable = false
            if (flip) {
                tile.style.backgroundColor = "#222"
            }
            flip = !flip
            if (hrMod && !scorev2Mod) {
                tile.classList.add("hr-tile")
            }
            if (scorev2Mod) {
                if (hrMod) {
                    tile.style.width = "0.3125vw"
                    tile.style.height = "0.3125vw"
                    tile.style.padding = "0.515vw"
                }
                else {
                    tile.style.width = "1.25vw"
                    tile.style.height = "1.25vw"
                    tile.style.padding = "0.05vw"
                }
            }

            tile.addEventListener("click", () => {
                if (rxMod) return;
                
                let missed = false
                if (tiles[i][j] == 0) {
                    let matches = searchMatches(i, j)

                    if (matches.length == 0) {
                        updateTime(-10)
                        missed = true
                    }

                    matches.forEach(match => {
                        match.forEach(tile => {
                            if (tiles[tile.coordinate[0]][tile.coordinate[1]] != 0) {
                                addScore()
                            }
                            tiles[tile.coordinate[0]][tile.coordinate[1]] = 0
                            document.getElementById(tile.coordinate[0] + "-" + tile.coordinate[1]).src = "/static/img/colour-tiles/" + tileNames[0]
                        })
                    })
                } else {
                    updateTime(-10)
                    missed = true
                }
                if (!mute) {
                    if (missed) {
                        let miss = missSound.cloneNode(true)
                        miss.play()
                        miss.remove()
						if (combo > maxCombo)
							maxCombo = combo;
						combo = 0;
                    }
                    else {
                        let hit = hitSound.cloneNode(true)
                        hit.play()
                        hit.remove()
                    }
                }

				let comboElement = document.getElementById("combo");
				comboElement.innerHTML = `Combo: x${combo}`;

                UpdateFL()
            })
            
            tile.addEventListener("mouseover" , () => {
                if (rxMod) {
                    if (tiles[i][j] == 0) {
                        let matches = searchMatches(i, j)
                        
                        if (matches.length > 0 && !mute) {
                            let hit = hitSound.cloneNode(true)
                            hit.play()
                            hit.remove()
                        }
                        
                        matches.forEach(match => {
                            match.forEach(tile => {
                                tiles[tile.coordinate[0]][tile.coordinate[1]] = 0
                                document.getElementById(tile.coordinate[0] + "-" + tile.coordinate[1]).src = "/static/img/colour-tiles/" + tileNames[0]
                            })
                        })
                    }
                }
            })

            board.appendChild(tile)
        }
        flip = !flip
    }
}

let time = 0
let interval = null
function StartTimer() {
    interval = setInterval(() => {
        time--
        updateTime()
    }, 1000)
}

function updateTime(change = 0) {
    if (hrMod) {
        change = change * 2
    }

    if (sdMod && change < 0) {
        EndGame()
    }

    let timer = document.getElementById("time")
    time += change

    if (time <= 0) {
        timer.innerHTML = "Time: 0"
        clearInterval(interval)
        EndGame()
    }
    else {
        timer.innerHTML = `Time: ${time}`
    }
}

function searchMatches(xpos, ypos) {
    let left = {
        coordinate: [],
        colour: 0
    }
    let right = {
        coordinate: [],
        colour: 0
    }
    let up = {
        coordinate: [],
        colour: 0
    }
    let down = {
        coordinate: [],
        colour: 0
    }

    for (let i = xpos; i >= 0; i--) {
        if (tiles[i][ypos] != 0) {
            left.coordinate = [i, ypos]
            left.colour = tiles[i][ypos]
            break
        }
    }

    for (let i = xpos; i < height; i++) {
        if (tiles[i][ypos] != 0) {
            right.coordinate = [i, ypos]
            right.colour = tiles[i][ypos]
            break
        }
    }

    for (let i = ypos; i >= 0; i--) {
        if (tiles[xpos][i] != 0) {
            up.coordinate = [xpos, i]
            up.colour = tiles[xpos][i]
            break
        }
    }

    for (let i = ypos; i < width; i++) {
        if (tiles[xpos][i] != 0) {
            down.coordinate = [xpos, i]
            down.colour = tiles[xpos][i]
            break
        }
    }

    let matches = []
    if (left.colour == right.colour && left.colour != 0) {
        matches.push([left, right])
    }
    if (up.colour == down.colour && up.colour != 0) {
        matches.push([up, down])
    }
    if (up.colour == right.colour && up.colour != 0) {
        matches.push([up, right])
    }
    if (up.colour == left.colour && up.colour != 0) {
        matches.push([up, left])
    }
    if (down.colour == right.colour && down.colour != 0) {
        matches.push([down, right])
    }
    if (down.colour == left.colour && down.colour != 0) {
        matches.push([down, left])
    }
    
    return matches
}

let score = 0
function addScore() {
    score += 1 * multiplier * combo
    let scoreElement = document.getElementById("score")
    scoreElement.innerHTML = `Score: ${(Math.round(score * 100) / 100).toLocaleString(undefined)}`

	combo++;
}

function Mute() {
    mute = !mute

    let muteIcon = document.getElementById("mute").children[0]

    if (mute) {
        muteIcon.src = "/static/img/colour-tiles/Mute_Icon.svg"
        winSound.muted = true
    }
    else {
        muteIcon.src = "/static/img/colour-tiles/Speaker_Icon.svg"
        winSound.muted = false
    }
}

let multiplier = 1;

let sdMod = false;
function ToggleSD() {
    if (time != 0) return;

    let sdIcon = document.getElementById("sudden-death").children[0];

    if (sdMod) {
        sdMod = false;
        sdIcon.classList.remove("active-mod");
    }
    else {
        sdMod = true;
        sdIcon.classList.add("active-mod");
    }
}

let flMod = false;
function ToggleFL() {
    if (time != 0) return;

    let flIcon = document.getElementById("flashlight-mod").children[0];

    if (flMod) {
        flMod = false;
        flIcon.classList.remove("active-mod");
        board.style.setProperty("--flashlight", "none");
        multiplier -= 0.12;
    }
    else {
        flMod = true;
        flIcon.classList.add("active-mod");
        board.style.setProperty("--flashlight",  `radial-gradient(circle at ${mousex - board.getBoundingClientRect().left}px ${mousey - board.getBoundingClientRect().top}px, transparent, #000 ${((time) / 1.5)}%)`);
        multiplier += 0.12;
    }

    let modMultiplier = document.getElementById("mod-multiplier");
    modMultiplier.innerHTML = `Multiplier: x${Math.round(multiplier * 100) / 100}`;
}

function UpdateFL() {
    if (flMod && time != 0)
        board.style.setProperty("--flashlight",  `radial-gradient(circle at ${mousex - board.getBoundingClientRect().left}px ${mousey - board.getBoundingClientRect().top}px, transparent, #000 ${((time) / 1.5)}%)`);
    else
        board.style.setProperty("--flashlight", "none");
}

let hrMod = false;
function ToggleHR() {
    if (time != 0) return;

    let hrIcon = document.getElementById("hardrock-mod").children[0];

    if (hrMod) {
        hrMod = false;
        hrIcon.classList.remove("active-mod");
        multiplier -= 0.06;
    }
    else {
        hrMod = true;
        hrIcon.classList.add("active-mod");
        multiplier += 0.06;
    }

    let modMultiplier = document.getElementById("mod-multiplier");
    modMultiplier.innerHTML = `Multiplier: x${Math.round(multiplier * 100) / 100}`;
}

let htMod = false;
function ToggleHT() {
    if (time != 0) return;

    let htIcon = document.getElementById("halftime-mod").children[0];

    if (htMod) {
        htMod = false;
        htIcon.classList.remove("active-mod");
        multiplier += 0.70;
    }
    else {
        htMod = true;
        htIcon.classList.add("active-mod");
        multiplier -= 0.70;
    }

    let modMultiplier = document.getElementById("mod-multiplier");
    modMultiplier.innerHTML = `Multiplier: x${Math.round(multiplier * 100) / 100}`;
}

let rxMod = false;
function ToggleRX() {
    if (time != 0) return;

    let rxIcon = document.getElementById("relax-mod").children[0];
    let modMultiplier = document.getElementById("mod-multiplier");

    if (rxMod) {
        rxMod = false;
        rxIcon.classList.remove("active-mod");
        modMultiplier.innerHTML = `Multiplier: x${Math.round(multiplier * 100) / 100}`;
    }
    else {
        rxMod = true;
        rxIcon.classList.add("active-mod");
        modMultiplier.innerHTML = `Multiplier: x0`;
    }
}

let scorev2Mod = false;
function ToggleSV2() {
    if (time != 0) return;

    let scorev2Icon = document.getElementById("scorev2-mod").children[0];

    if (scorev2Mod) {
        scorev2Mod = false;
        scorev2Icon.classList.remove("active-mod");
        height = 15;
        width = 32;
    }
    else {
        scorev2Mod = true;
        scorev2Icon.classList.add("active-mod");
        height = 30;
        width = 64;
    }
    createTiles()
}