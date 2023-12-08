(async () => {

    const
        {fromPairs, invert, range, flatMap} = _,
        {SpriteSheet, loadImage} = utils,
        {playerSpriteSheet} = assets,

        canvas = document.getElementById('canvas'),
        ctx = canvas.getContext('2d')

    spriteSheet = await playerSpriteSheet

    const
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

            render (ctx, deltaTime) {
                const currentFrame = this.animation.getCurrentFrame()
                currentFrame.draw(ctx, this.x, this.y)
            }
        },

        Player = class extends Entity {
            constructor ({spriteSheet, x, y}) {
                super({spriteSheet, x, y})
                this.direction = 'down'
                this.animation = spriteSheet.getAnimation('idle-down')

                this.animation.start()

                this.xSpeed = 50
                this.ySpeed = 50
                // TODO: ^ find a better variable name for these
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
                )
                    nextAnimationName = 'attack-' + this.direction

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
        },

        player = new Player({
            spriteSheet,
            x: 0,
            y: 0
        }),

        main = () => {
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
                update(deltaTime)
                render(ctx, deltaTime)

                now = Date.now() / 1000
                deltaTime = now - lastTime
                lastTime = now
            }

            setInterval(loop, 1000 / 60)
        },

        update = (deltaTime) => {
            player.update(deltaTime)
        },

        render = (deltaTime) => {
            ctx.fillStyle = 'lightgray'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            player.render(ctx)
        }


    main()
})()
