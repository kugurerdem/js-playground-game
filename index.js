(async () => {

    const
        {fromPairs, invert, range, flatMap} = _,
        {SpriteSheet, loadImage, collides} = utils,
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

                ctx.strokeStyle = 'red'
                ctx.strokeRect(
                    this.x, this.y, currentFrame.width, currentFrame.height,
                )

                ctx.strokeStyle = 'blue'
                const {x,y,width,height} = this.getHitbox()
                ctx.strokeRect(x,y,width,height)
            }
        },

        Player = class extends Entity {
            constructor ({spriteSheet, x, y, entities}) {
                super({spriteSheet, x, y})
                this.direction = 'down'
                this.animation = spriteSheet.getAnimation('idle-down')

                this.animation.start()

                this.xSpeed = 100
                this.ySpeed = 100
                // TODO: ^ find a better variable name for these

                this.entities = entities
            }

            handleInput (input, keysState) {
                this.yVel = (
                    (keysState['ArrowUp'] ? -this.ySpeed : 0)
                    + (keysState['ArrowDown'] ? this.xSpeed : 0)
                )

                this.xVel = (
                    (keysState['ArrowLeft'] ? -this.xSpeed : 0)
                    + (keysState['ArrowRight'] ? this.xSpeed : 0)
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
                            this.animation = this.spriteSheet.getAnimation(
                                'idle-' + this.direction
                            )
                            this.animation.start()
                        })
                }

                if (!this.animation.active)
                    this.animation.start()
            }

            attack () {
                const attackRect = this.getHitbox()

                this.entities.forEach((entity) => {
                    if (
                        entity !== this
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
        },

        Slime = class extends Entity {
            constructor({spriteSheet, x, y, direction}) {
                super({spriteSheet, x, y})

                this.direction = direction || 'right'
                this.xSpeed = 20

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
                        this.direction == 'right' ? this.xSpeed : -this.xSpeed
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

                this.animation.once('complete', () => this.animation.stop())
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

        main = async () => {
            const
                assets = await loadAssets({
                    onProgress: ({assetName, asset}) => {
                        console.log(`the asset ${assetName} is loaded`)
                    }
                }),

                entities = [],

                player = new Player({
                    spriteSheet: assets.spriteSheets['player'],
                    x: 0,
                    y: 0,
                    entities,
                })

            range(5).forEach((i) => {
                entities.push(new Slime({
                    spriteSheet: assets.spriteSheets['slime'],
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    direction: Math.random() > 0.5 ? 'right' : 'left',
                }))
            })
            entities.push(player)

            const keysState = {}

            ;['keydown', 'keyup'].forEach((eventName) => {
                document.addEventListener(eventName, (e) => {
                    keysState[e.key] = eventName == 'keydown' ? true : false
                    player.handleInput(e, keysState)
                })
            })


            let
                lastTime = Date.now() / 1000,
                deltaTime = 0

            const loop = () => {
                update(deltaTime, entities)
                render(deltaTime, entities)

                now = Date.now() / 1000
                deltaTime = now - lastTime
                lastTime = now
            }

            setInterval(loop, 1000 / 60)
        },

        update = (deltaTime, entities) =>
            entities.forEach((entity) => entity.update(deltaTime)),

        render = (deltaTime, entities) => {
            ctx.fillStyle = 'lightgray'
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            entities.forEach((entity) => entity.render(ctx, deltaTime))
        }


    main()
})()
