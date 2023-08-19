let tiles = []
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

let hitSound = new Audio("/static/audio/colour-tiles/ding.wav")
hitSound.volume = 0.5

let missSound = new Audio("/static/audio/colour-tiles/combobreak.mp3")
missSound.volume = 0.5

let winSound = new Audio("/static/audio/colour-tiles/developerWin.wav")
winSound.volume = 0.01
winSound.muted = false

let mute = false

function StartGame() {
    let start = document.getElementById("start")
    start.remove()

    let endText = document.getElementById("end-text")
    endText?.remove()

    let score = document.getElementById("score")
    score.innerHTML = "Score: 0"

    let board = document.getElementById("board")
    board.style.flexDirection = "row"

    time = 120

    let modsMenu = document.getElementById("mods")
    modsMenu.classList.add("mods-locked")

    createTiles()
    CreateBoard()
    StartTimer()
}

function EndGame(restarted = false) {
    tiles = []

    let board = document.getElementById("board")
    board.innerHTML = ""
    board.style.flexDirection = "column"

    if (!restarted) {
        if (!mute) {
            winSound.cloneNode(true).play()
        }

        let endText = document.createElement("p")
        endText.innerHTML = `Game Over!\r\nScore: ${document.getElementById("score").innerHTML.slice(7)}`
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
    for (let i = 0; i < 15; i++) {
        tiles[i] = []
        for (let j = 0; j < 32; j++) {
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
    let board = document.getElementById("board")
    let flip = true

    for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 32; j++) {
            let tile = document.createElement("img")
            tile.src = "/static/img/colour-tiles/" + tileNames[tiles[i][j]]
            tile.classList.add("tile")
            tile.id = i + "-" + j
            tile.draggable = false
            if (flip) {
                tile.style.backgroundColor = "#222"
            }
            flip = !flip

            tile.addEventListener("click", () => {
                let missed = false
                if (tiles[i][j] == 0) {
                    matches = searchMatches(i, j)

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
                }
                else {
                    updateTime(-10)
                    missed = true
                }
                if (!mute) {
                    if (missed) {
                        missSound.cloneNode(true).play()
                    }
                    else {
                        hitSound.cloneNode(true).play()
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

    for (let i = xpos; i < 15; i++) {
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

    for (let i = ypos; i < 32; i++) {
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

function addScore() {
    let score = document.getElementById("score")
    score.innerHTML = `Score: ${parseInt(score.innerHTML.slice(7)) + 1}`
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

let sdMod = false;
function ToggleSD() {
    if (time != 0) return;

    let sd = document.getElementById("sudden-death");
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