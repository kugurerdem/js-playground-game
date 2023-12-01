(async () => {

    const
        {fromPairs, invert, range, flatMap} = _,
        {SpriteSheet, loadImage} = utils,

        canvas = document.getElementById('canvas'),
        ctx = canvas.getContext('2d'),

        spriteSheet = await loadImage('assets/characters/player.png').then((sheetImg) => {
            return new SpriteSheet({
                image: sheetImg,
                frames: fromPairs(range(0, 6).flatMap((i) => ([
                    [`idle-down-${i}`, {x: i * 48, y: 0, w: 48, h: 48}],
                    [`idle-right-${i}`, {x: i * 48, y: 48, w: 48, h: 48}],
                    [`idle-left-${i}`, {
                        x: i * 48, y: 48, w: 48, h: 48, flip: true,
                    }],
                    [`idle-up-${i}`, {x: i * 48, y: 2 * 48, w: 48, h: 48}],

                    [`walk-right-${i}`, {x: i * 48, y: 4 * 48, w: 48, h: 48}],
                    [`walk-left-${i}`, {
                        x: i * 48, y: 4 * 48, w: 48, h: 48, flip: true,
                    }],
                    [`walk-up-${i}`, {x: i * 48, y: 5 * 48, w: 48, h: 48}],
                    [`walk-down-${i}`, {x: i * 48, y: 3 * 48, w: 48, h: 48}],
                ]))),
                animations: {
                    'idle-down': range(0,6).map((i) => `idle-down-${i}`),
                    'idle-right': range(0,6).map((i) => `idle-right-${i}`),
                    'idle-left': range(0,6).map((i) => `idle-left-${i}`),
                    'idle-up': range(0,6).map((i) => `idle-up-${i}`),

                    'walk-right': range(0,6).map((i) => `walk-right-${i}`),
                    'walk-up': range(0,6).map((i) => `walk-up-${i}`),
                    'walk-left': range(0,6).map((i) => `walk-left-${i}`),
                    'walk-down': range(0,6).map((i) => `walk-down-${i}`),
                },
                scale: 2,
            })
        }),

        player = {
            spriteSheet,

            animation: (() => {
                const animation = spriteSheet.animations['idle-down']
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

                let nextAnimation;
                if (this.xVel)
                    nextAnimation = this.xVel > 0
                        ? spriteSheet.animations['walk-right']
                        : spriteSheet.animations['walk-left']
                else if (this.yVel)
                    nextAnimation = this.yVel > 0
                        ? spriteSheet.animations['walk-down']
                        : spriteSheet.animations['walk-up']
                else
                    nextAnimation = spriteSheet.animations['idle']

                if (!nextAnimation)
                    return

                if (nextAnimation != this.animation) {
                    this.animation.stop()
                    this.animation = nextAnimation
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
            // get draw params

            // draw them
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            player.render(ctx)
        }


    main()
})()
