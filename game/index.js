(async () => {

    const
        {fromPairs, invert, range, flatMap, random} = _,
        {SpriteSheet, loadImage, collides, debug} = utils,
        {loadAssets} = assetManager,

        canvas = document.getElementById('canvas'),
        ctx = canvas.getContext('2d'),

        Entity = class {
            constructor ({spriteSheet, x, y}) {
                this.spriteSheet = spriteSheet
                this.x = x
                this.y = y
                this.xVel = 0
                this.yVel = 0
            }

            update (deltaTime) {
                this.x += this.xVel * (deltaTime)
                this.y += this.yVel * (deltaTime)

                this.animation.update(deltaTime)
            }

            render (deltaTime) {
                const currentFrame = this.animation.getCurrentFrame()
                currentFrame.draw(ctx, this.x, this.y)

                debug(() => {
                    ctx.strokeStyle = 'red'
                    ctx.strokeRect(
                        this.x, this.y, currentFrame.width, currentFrame.height,
                    )

                    if (this.getHitbox) {
                        ctx.strokeStyle = 'blue'
                        const {x,y,width,height} = this.getHitbox()
                        ctx.strokeRect(x,y,width,height)
                    }

                    if (this.attackBox) {
                        ctx.strokeStyle = 'yellow'
                        const {x,y,width,height} = this.attackBox()
                        ctx.strokeRect(x,y,width,height)
                    }
                })
            }

            handleInput () {}
        },

        Player = class extends Entity {
            constructor ({x, y}, gameState) {
                super({
                    spriteSheet: gameState.assets.spriteSheets['player'],
                    x,
                    y,
                })

                this.gameState = gameState

                this.direction = 'down'
                this.animation = this.spriteSheet.getAnimation('idle-down')

                this.animation.start()

                this.xMovementSpeed = 100
                this.yMovementSpeed = 100
            }

            handleInput (input) {
                const {keysState} = this.gameState
                this.yVel = (
                    (keysState['ArrowUp'] ? -this.yMovementSpeed : 0)
                    + (keysState['ArrowDown'] ? this.xMovementSpeed : 0)
                )

                this.xVel = (
                    (keysState['ArrowLeft'] ? -this.xMovementSpeed : 0)
                    + (keysState['ArrowRight'] ? this.xMovementSpeed : 0)
                )

                if (this.xVel)
                    this.direction = this.xVel > 0 ? 'right' : 'left'

                else if (this.yVel)
                    this.direction = this.yVel > 0 ? 'down' : 'up'

                let nextAnimationName;

                if (this.animation.name.startsWith('attack'))
                    return

                if (
                    input.code == 'Space'
                    && input.type == 'keydown'
                    && input.repeat == false
                ){
                    nextAnimationName = 'attack-' + this.direction
                    this.attack()
                }

                else
                    nextAnimationName =
                        (this.xVel || this.yVel)
                            ? 'walk-' + this.direction
                            : 'idle-' + this.direction

                if (nextAnimationName != this.animation.name) {
                    this.animation.stop()
                    this.animation =
                        this.spriteSheet.getAnimation(nextAnimationName)

                    if (this.animation.name.startsWith('attack'))
                        this.animation.once('complete', () => {
                            const prefix =
                                this.xVel || this.yVel ? 'walk' : 'idle'

                            this.animation = this.spriteSheet.getAnimation(
                                prefix + '-' + this.direction
                            )
                            this.animation.start()
                        })
                }

                if (!this.animation.active)
                    this.animation.start()
            }

            attack () {
                const attackRect = this.attackBox()

                this.gameState.entities.forEach((entity) => {
                    if (
                        entity !== this
                        && entity.getHitbox
                        && collides(attackRect, entity.getHitbox())
                    ) {
                        entity.takeDamage()
                    }
                })
            }

            getHitbox () {
                const {width,height} = this.animation.getCurrentFrame()
                return {
                    x: this.x + width / 4,
                    y: this.y + height / 2.5,
                    width: width / 2,
                    height: height / 2,
                }
            }

            attackBox () {
                // TODO: attack box should behave differently depending on
                // the direction the player is facing
                const {width,height} = this.animation.getCurrentFrame()
                return {
                    x: this.x + width / 8,
                    y: this.y + height / 2.5,
                    width: width * (3/4),
                    height: height / 1.75,
                }
            }
        },

        Slime = class extends Entity {
            constructor({x, y, direction}, {assets}) {
                super({
                    spriteSheet: assets.spriteSheets['slime'],
                    x, y,
                })

                this.direction = direction || 'right'
                this.xMovementSpeed = 20

                this.updateDirection()

                this.dead = false
            }

            updateDirection() {
                this.direction =
                    this.direction == 'right' ? 'left' : 'right'

                this.xVel = 0

                this.animation =
                    this.spriteSheet.getAnimation(`idle-${this.direction}`)

                this.animation.once('complete', () => {
                    if (this.dead)
                        return

                    this.xVel =
                        this.direction == 'right'
                            ? this.xMovementSpeed
                            : -this.xMovementSpeed

                    this.animation =
                        this.spriteSheet.getAnimation(`jump-${this.direction}`)

                    this.animation.once('complete',
                        this.updateDirection.bind(this)
                    )

                    this.animation.start()
                })

                this.animation.start()
            }

            takeDamage() {
                if (this.dead)
                    return

                this.dead = true
                this.animation.stop()
                this.xVel = 0
                this.animation =
                    this.spriteSheet.getAnimation(`dead-${this.direction}`)

                this.animation.start()
            }

            getHitbox() {
                const {width,height} = this.animation.getCurrentFrame()
                return {
                    x: this.x + width / 4,
                    y: this.y + height / 4,
                    width: width / 2,
                    height: height / 2,
                }
            }
        },

        Chest = class extends Entity {
            constructor({x, y}, gameState) {
                super({
                    x, y,
                    spriteSheet: gameState.assets.spriteSheets['chest'],
                })

                this.gameState = gameState

                this.animation = this.spriteSheet.getAnimation('closed')

                this.open = false
            }

            update (deltaTime) {
                super.update(deltaTime)
                if (!this.open && this.gameState.isWon) {
                    this.open = true
                    this.animation = this.spriteSheet.getAnimation('open')
                    this.animation.start()

                    this.gameState.setLevel(this.gameState.level + 1)
                }
            }
        },

        main = async () => {
            const
                assets = await loadAssets({
                    onProgress: ({assetName, asset}) => {
                        console.log(`the asset ${assetName} is loaded`)
                    }
                }),

                quotes = await (fetch('../quotes.json').then(r => r.json())),

                keysState = {}

            ;['keydown', 'keyup'].forEach((eventName) => {
                document.addEventListener(eventName, (e) => {
                    keysState[e.key] = eventName == 'keydown' ? true : false
                    gameState.entities.forEach(
                        (entity) => entity.handleInput(e)
                    )
                })
            })

            const updateQuote = (level) => {
                const
                    levelToBeShown = Math.min(level, quotes.length),
                    {quote, author} =
                        quotes[levelToBeShown - 1]

                document.getElementById('quoteText').innerHTML = quote
                document.getElementById('quoteAuthor').innerHTML = author
                document.getElementById('level').value = levelToBeShown
            }

            const updateAvailableQuotes = (level) => {
                document.getElementById('availableQuotes').innerText =
                    Math.min(level, quotes.length)
            }

            document.getElementById('updateQuote')
                .addEventListener('click', () => {
                    const level = document.getElementById('level').value
                    updateQuote(level)
                })

            updateAvailableQuotes(localStorage.getItem('level') || 1)
            updateQuote(localStorage.getItem('level') || 1)

            const
                initGameState = () => {
                    const gameState = {
                        lastTime: Date.now() / 1000,
                        deltaTime: 0,
                        assets,
                        keysState,
                        level: Number(localStorage.getItem('level') || 1),
                        isWon: false,
                        entities: [],

                        setLevel: (level) => {
                            localStorage.setItem('level', level)
                            gameState.level = level
                            updateAvailableQuotes(level)
                            updateQuote(level)
                        }
                    }

                    const player = new Player({
                        x: 0,
                        y: 0,
                    }, gameState)

                    const chest = new Chest({
                        x: 0.5 * canvas.width,
                        y: 0.5 * canvas.height,
                    }, gameState)

                    gameState.entities.push(chest)

                    range(5).forEach((i) => {
                        gameState.entities.push(new Slime({
                            x: random(0.2, 0.8) * canvas.width,
                            y: random(0.2, 0.8) * canvas.height,
                            direction: Math.random() > 0.5 ? 'left' : 'right',
                        }, gameState))
                    })

                    gameState.entities.push(player)

                    return gameState
                }

            let gameState = initGameState()

            const loop = () => {
                update(gameState)
                render(gameState)

                const now = Date.now() / 1000

                gameState.deltaTime = now - gameState.lastTime
                gameState.lastTime = now

                if (!gameState.isWon) {
                    gameState.isWon = gameState.entities
                         .filter((entity) => entity instanceof Slime)
                        .every((slime) => slime.dead)
                }

                if (gameState.isWon) {
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
                    ctx.fillRect(0, 0, canvas.width, canvas.height)

                    ctx.fillStyle = 'white'
                    ctx.font = '32px sans-serif'
                    ctx.textAlign = 'center'
                    ctx.fillText(
                        'Wisdom found!',
                        canvas.width / 2,
                        canvas.height / 2,
                    )
                    ctx.fillText(
                        'Press R to continue the Journey',
                        canvas.width / 2,
                        canvas.height / 2 + 48,
                    )

                    if (gameState.keysState['r'])
                        gameState = initGameState()
                }
            }

            setInterval(loop, 1000 / 60)
        },

        update = ({deltaTime, entities}) =>
            entities.forEach((entity) => entity.update(deltaTime)),

        render = ({deltaTime, entities}) => {
            // see, https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/createRadialGradient
            const gradient = ctx.createRadialGradient(
                canvas.width / 2,
                canvas.height / 2,
                0,

                canvas.width / 2,
                canvas.height / 2,
                Math.max(canvas.width, canvas.height) / 2
            );

            gradient.addColorStop(0, 'lightgreen');
            gradient.addColorStop(1, 'darkgreen');

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            entities.forEach((entity) => entity.render(ctx, deltaTime))
        }


    main()
})()
