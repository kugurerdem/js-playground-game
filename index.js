(async () => {

    const
        {fromPairs, invert, range, flatMap} = _,
        {SpriteSheet, loadImage} = utils,
        {playerSpriteSheet} = assets,

        canvas = document.getElementById('canvas'),
        ctx = canvas.getContext('2d')

    spriteSheet = await playerSpriteSheet

    const
        player = {
            spriteSheet,

            direction: 'down',

            animation: (() => {
                const animation = spriteSheet.getAnimation('idle-down')
                animation.start()
                return animation
            })(),

            x: 0,
            y: 0,

            xVel: 0,
            yVel: 0,

            handleInput: function (input, keysState) {
                this.yVel = (
                    (keysState['ArrowUp'] ? -50 : 0)
                    + (keysState['ArrowDown'] ? 50 : 0)
                )

                this.xVel = (
                    (keysState['ArrowLeft'] ? -50 : 0)
                    + (keysState['ArrowRight'] ? 50 : 0)
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
            },

            update: function (deltaTime) {
                this.x += this.xVel * (deltaTime)
                this.y += this.yVel * (deltaTime)

                this.animation.update(deltaTime)
            },

            render (ctx, deltaTime) {
                const currentFrame = this.animation.getCurrentFrame()
                currentFrame.draw(ctx, this.x, this.y)
            }
        },

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
