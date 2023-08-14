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
let missSound = new Audio("/static/audio/colour-tiles/badBeep.wav")
let winSound = new Audio("/static/audio/colour-tiles/developerWin.wav")

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
    createTiles()
    CreateBoard()
    StartTimer()
}

function EndGame() {
    tiles = []

    let board = document.getElementById("board")
    board.innerHTML = ""
    board.style.flexDirection = "column"

    let start = document.createElement("button")
    start.innerHTML = "Start!"
    start.id = "start"
    start.onclick = StartGame

    let endText = document.createElement("p")
    endText.innerHTML = `Game Over!\r\nScore: ${document.getElementById("score").innerHTML.slice(7)}`
    endText.id = "end-text"

    board.appendChild(endText)
    board.appendChild(start)

    winSound.play()
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
            if (flip) {
                tile.style.backgroundColor = "#222"
            }
            flip = !flip

            tile.addEventListener("click", () => {
                let missed = false
                if (tiles[i][j] == 0) {
                    matches = searchMatches(i, j)

                    if (matches.length == 0) {
                        time -= 10
                        let timer = document.getElementById("time")
                        timer.innerHTML = `Time: ${time}`
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
                    time -= 10
                    let timer = document.getElementById("time")
                    timer.innerHTML = `Time: ${time}`
                    missed = true
                }
                if (missed) {
                    missSound.cloneNode(true).play()
                }
                else {
                    hitSound.cloneNode(true).play()
                }
            })

            board.appendChild(tile)
        }
        flip = !flip
    }
}

let time = 120
function StartTimer() {
    let timer = document.getElementById("time")
    timer.innerHTML = `Time: ${time}`

    let interval = setInterval(() => {
        time--
        timer.innerHTML = `Time: ${time}`

        if (time <= 0) {
            timer.innerHTML = "Time: 0"
            clearInterval(interval)
            EndGame()
        }
    }, 1000)
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

function Sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}